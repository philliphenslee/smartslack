/**
 * SmartSlack module.
 * @description A simple JavaScript Slack API client
 * for building custom bots on node.js
 * @file /lib/index.js
 * @copyright Phillip J. Henslee II 2015
 * @module smartslack
 */

'use strict';

var EventEmitter = require('events').EventEmitter;
var dns = require('dns');
var https = require('https');
var qs = require('querystring');
var util = require('util');

var _ = require('lodash');
var bole = require('bole')
var pretty = require('bistre')({ time: true })
var WebSocket = require('ws');

bole.output({
  level: process.env.LOG_LEVEL || 'debug'
  , stream: pretty
})

pretty.pipe(process.stdout);

var errors = {
  invalid_token: 'Error invalid access token, please provide a valid token.',
  missing_options_arg: 'Error missing required argument object options'

}

/**
 * Slack RTM API Client
 * @constructor
 * @param {object} configuration options
 */
var SmartSlack = function (options) {

  if (!options) {
    throw new Error(errors.missing_options_arg);
  }

  var accessToken = options.token;

  if (!accessToken || typeof accessToken !== 'string' ||
    !accessToken.match(/^([a-z]{4})\-([0-9]{11})\-([0-9a-zA-Z]{24})$/)) {
    this.log.error(errors.invalid_token);
    throw new Error(errors.invalid_token);
  }

  this.options = _.defaults(options, this.options);
  this.hostname = 'slack.com';
  this.authenticated = false;
  this.connected = false;
  this.log = bole('smartslack');
  this.user = null;
  this.users = {};
  this.channels = {};
  this.groups = {};
  this.ims = {};
  this.socketUrl = null;
  this.team = null;
  this.ws = null;

  this._messageId = 0;
  this._connAttempts = 0;
  this._lastPong = null;
  this._avgLatency = [0];


}

util.inherits(SmartSlack, EventEmitter)

/**
 * Calls auth.test api method
 * @return {boolean}
 */
SmartSlack.prototype.authTest = function () {
  this._apiCall('auth.test', null, function test(data) {
    if (data) {
      if (data.ok) {
        console.log(data);
        return true;
      } else {
        return false;
      }
    }
  })
}

SmartSlack.prototype.apiTest = function (args, error) {
  var params = _.merge({}, args, error);
  this._apiCall('api.test', params, function test(data) {
    if (data) {
      if (data.ok) {
        this.log.info(data);
      } else {
        throw new Error(data.error);
      }
    }
  })
}

SmartSlack.prototype.getChannelByName = function (name) {
  return _.find(this.channels, { name: name });
}

SmartSlack.prototype.getChannelById = function (id) {
  return _.find(this.channels, { id: id });
}


SmartSlack.prototype.getUserByName = function (name) {
  return _.find(this.users, { name: name });
}

SmartSlack.prototype.getUserById = function (id) {
  return _.find(this.users, { id: id });
}

SmartSlack.prototype.login = function () {

  var _this = this;
  this._apiCall('rtm.start', null, function (data) {

    if (data) {

      if (!data.ok) {
        _this.emit('error', data.error);

      } else {
        
        //console.log(data);
        _this.log.debug('Slack client authenticated...');
        _this.authenticated = true;
      
        // Stash the Slack session data
        _this.user = data.self
        _this.users = data.users;
        _this.channels = data.channels;
        _this.groups = data.groups;
        _this.ims = data.ims;
        _this.team = data.team;
      
        // Connect
        _this.socketUrl = data.url;
        _this.connect();
      }
    }
  });
}

SmartSlack.prototype.connect = function () {
  this._connAttempts = 0;
  this.ws = new WebSocket(this.socketUrl);

  this.ws.on('open', function (data) {
    this.emit('open', data);
    this._lastPong = _.now();
  }.bind(this));

  this.ws.on('close', function (data) {
    this.emit('close', data);
  }.bind(this));

  this.ws.on('error', function (data) {
    this.emit('error', data);
  }.bind(this));

  this.ws.on('message', function (data) {
    try {
      this.onRtmEvent(JSON.parse(data));
    } catch (e) {
      console.log(e);
    }
  }.bind(this));
}

SmartSlack.prototype.onRtmEvent = function (message) {
  var _this = this;
  var latency;

  this.emit('rawmessage', message);
  this.log.debug({ 'Slack Event': message });

  switch (message.type) {

    case 'hello':
    
      // Received the hello event message
      this.log.debug('Slack RTM socket connected...')
      this.connected = true;
      this.emit('connected');
      this._lastPong = _.now();
      
      // Start pings every five seconds
      this._pingInterval = setInterval(function () { _this._keepAlive() }, 5000);

      break;

    case 'message':
      this.emit('message', message);
      break;

    case 'pong':

      this._lastPong = _.now();
      
      // Save latency
      latency = (this._lastPong - message.time);
      this.log.debug('Current Latency = ' + (this._lastPong - message.time) + 'ms');
      this._avgLatency.push(latency);
      
      // Save only the last minute
      if (this._avgLatency.length > 12) {
        this._avgLatency.shift();
      }

      this.log.debug('Average Latency = ' + Math.round((_.sum(this._avgLatency) / this._avgLatency.length)) + 'ms');

      break;
  }

}

SmartSlack.prototype.postMessage = function (id, text, params) {
  params = _.extend({
    text: text,
    channel: id,
    username: this.name,
    as_user: true
  }, params || {});

  return this._apiCall('chat.postMessage', params);
};

SmartSlack.prototype._keepAlive = function () {

  this._ping();
  
  // Have we had a ping in the last ten seconds
  if (this._lastPong && (_.now() - this._lastPong) > 10000) {

    clearInterval(this._pingInterval);
    
    // Try to reconnect
    this._reconnect();
  }
}

SmartSlack.prototype._canResolve = function () {
  var _this = this;
  this.log.debug('Attempting to connect to slack.com');
  
  dns.resolve4(_this.hostname, function (err, addresses) {
    _this.log.debug(err);
    if (!err) {
      clearInterval(_this._reconnecting);
      _this.login();
      return true;
    } else {
      return false;
    }
  });
}

SmartSlack.prototype._ping = function () {
  var data;
  var ping = { "type": "ping" };
  ping.id = this._messageId;
  ping.time = _.now();
  data = JSON.stringify(ping);
  this.ws.send(data);
  this._messageId += 1;
}

SmartSlack.prototype._reconnect = function () {
  var _this = this;

  if (this.ws) {
    this.ws.close();
  }
  this.connected = false;
  this.authenticated = false;

  //  Attempt to resolve slack.com and call login when we can
  this._reconnecting = setInterval(function () { _this._canResolve() }, 5000);
  this.log.debug('Connection lost waiting to reconnect...');
}



SmartSlack.prototype._sendSocket = function (data) {
  if (typeof data !== 'undefined') {
    data.id = this._messageId;
    data = JSON.stringify(data);
    this.ws.send(data);
    this._messageId += 1;
  }
}

SmartSlack.prototype._apiCall = function (method, params, callback) {

  var _this = this;

  params = _.merge(params || {}, { token: this.options.token });

  var postData = qs.stringify(params);

  var options = {
    hostname: _this.hostname,
    port: 443,
    path: '/api/' + method,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  var req = https.request(options, function (res) {
    var output = '';
    var value;

    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      output += chunk;
    });

    res.on('end', function () {
      if (callback) {
        if (res.statusCode === 200) {
          value = JSON.parse(output)
          callback(value);
        } else {
          callback({ 'ok': false, 'error': 'API response: ' + res.statusCode })
        }
      }

    })
  });

  req.on('error', function (e) {
    _this.log.debug('HTTPS request error: ' + e)
    if (callback) {
      callback({ 'ok': false, 'error': e.errno })
    }
  });

  req.write(postData);
  req.end();
}

module.exports = SmartSlack