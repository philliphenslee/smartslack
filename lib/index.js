'use strict';

var EventEmitter = require('events').EventEmitter;
var https = require('https');
var qs = require('querystring');
var util = require('util');

var _ = require('lodash');
var WebSocket = require('ws');



var SmartSlack = function (options) {
  this.options = options;

  this.authenticated = false;
  this.connected = false;

  this.user = null;
  this.team = null;

}

util.inherits(SmartSlack, EventEmitter)

SmartSlack.prototype.login = function() {
  this._apiCall('rtm.start', this.options.token, this._onLogin );
}

SmartSlack.prototype._onLogin = function (data) {
  if (data) {
    if (!data.ok) {
      this.emit('error', data.error);
      this.authenticated = false;
    } else {
      this.authenticated = true;
      
      // TODO Stash the slack session data
      
      // Connect
      this.socketUrl = data.url;
      this.connect();
    }
  }
}

SmartSlack.prototype.connect = function () {
  this.ws = new WebSocket(this.socketUrl);

  this.ws.on('open', function (data) {
    this.emit('open', data);
  }.bind(this));

  this.ws.on('close', function (data) {
    this.emit('close', data);
  }.bind(this));

  this.ws.on('message', function (data) {
    try {
      this.emit('message', JSON.parse(data));
    } catch (e) {
      console.log(e);
    }
  }.bind(this));

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


SmartSlack.prototype._apiCall = function (method, params, callback) {

  params = _.extend(params || {}, { token: this.options.token });

  var postData = qs.stringify(params);

  var options = {
    hostname: 'slack.com',
    port: 443,
    path: '/api/' + method,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  var req = https.request(options, function (res) {
    var output;
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
    console.log('problem with request: ' + e.message);
  });

  req.write(postData);
  req.end();
}

module.exports = SmartSlack