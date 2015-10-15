/**
 * SmartSlack module.
 * @description A JavaScript Slack API client
 * for building custom bots on node.js
 * @file /lib/index.js
 * @copyright Phillip J. Henslee II 2015 <ph2@ph2.us>
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

var errors = {
  invalid_token: 'Error invalid access token, please provide a valid token.',
  missing_options_arg: 'Error missing required argument object options',
  missing_required_arg: 'Error missing or invalid required argument'
}

// Bole Logging
bole.output({
  level: process.env.LOG_LEVEL || 'debug'
  , stream: pretty
})
pretty.pipe(process.stdout);

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
  this._lastPong = null;
}

util.inherits(SmartSlack, EventEmitter)

/**
 * auth.test api method
 * @return {object} literal
 */
SmartSlack.prototype.authTest = function (callback) {

  callback = (typeof callback === 'function') ? callback : function () { };

  this._apiCall('auth.test', function (data) {
    if (data) {
      callback(null, data);
    }
  });
};

/**
 * Calls api.test api method
 * @return {object} passed args
 */
SmartSlack.prototype.apiTest = function (params, callback) {

  callback = (typeof callback === 'function') ? callback : function () { };

  this._apiCall('api.test', params, function (data) {
    if (data) {
      callback(null, data);
    }
  });
};

/**
 * Add a reaction to a message
 * @param emojiName  i.e. thumbsup
 * @returns {object} JSON response
 */
SmartSlack.prototype.addReaction = function (emojiName, channel, timestamp, callback) {
  
  callback = (typeof callback === 'function') ? callback : function () { };
  
  if (emojiName && channel && timestamp && typeof emojiName === 'string'
      && typeof channel === 'string' && typeof timestamp == 'string') {
        
    this._apiCall('reactions.add', { name: emojiName,
                                     channel: channel,
                                     timestamp: timestamp}, function (data) {
        return callback(null, data);
    });
  } else {
    throw new Error(errors.missing_required_arg);
  };
};

/**
 * Connect a WebSocket
 */
SmartSlack.prototype.connect = function () {
  var _this = this;

  this.ws = new WebSocket(this.socketUrl);

  this.ws.on('open', function (data) {
    _this.emit('open', data);
    _this._lastPong = _.now();
  });

  this.ws.on('close', function (data) {
    _this.emit('close', data);
    
    //TODO Add auto reonnect option
    // Attempt reconnection 
    _this._reconnect();
  });

  this.ws.on('error', function (data) {
    _this.emit('error', data);
  });

  this.ws.on('message', function (data) {
    //TODO try catch JSON call..
    _this._onRtmEvent(JSON.parse(data));
  });
};

/**
 * Gets channel list, excluding archived channels
 * @param {funciton} callback
 * @return {array} the channel list
 */
SmartSlack.prototype.getActiveChannels = function (callback) {

  var _this = this;

  callback = (typeof callback === 'function') ? callback : function () { };

  this._apiCall('channels.list', { "exclude_archived": "1" }, function (data) {

    if (data.ok) {
      
      // Save the channel list
      _this.channels = data.channels;
      return callback(null, data.channels);

    } else {
      return callback(null, data);
    }
  });
};

/**
 * Gets group list from API
 * @param {function} callback
 * @return {array} the group list
 */
SmartSlack.prototype.getActiveGroups = function (callback) {

  var _this = this;

  callback = (typeof callback === 'function') ? callback : function () { };

  this._apiCall('groups.list', { "exclude_archived": "1" }, function (data) {

    if (data.ok) {
      
      // Save the group list
      _this.groups = data.groups;
      return callback(null, data.groups);
      
    } else {
      return callback(null, data);
    }
  });
};

/**
 * Gets a channel by name
 * @param {string} channel name
 * @return {object} channel object
 */
SmartSlack.prototype.getChannelByName = function (name, callback) {
  
  var channel;
  callback = (typeof callback === 'function') ? callback : function () { };

  if (name && this.channels) {
    channel = _.find(this.channels, { name: name });
    if (channel) {
      return callback(null, channel);
    }
  } else {
    throw new Error(errors.missing_required_arg);
  }
}

/**
 * Gets a channel by id
 * @param {string} channel name
 * @return {object} channel object
 */
SmartSlack.prototype.getChannelById = function (id, callback) {
  
  var channel;
  callback = (typeof callback === 'function') ? callback : function () { };

  if (id && this.channels) {
    channel = _.find(this.channels, { id: id });
    if (channel) {
      return callback(null, channel);
    }
  } else {
    throw new Error(errors.missing_required_arg);
  }
}

/**
 * Gets group list
 * @param {function} callback
 * @return {array} the group list
 */
SmartSlack.prototype.getLastChannelMessage = function (channel, callback) {

  callback = (typeof callback === 'function') ? callback : function () { };

  if (channel && typeof channel === 'string') {
    this._apiCall('channels.history', { channel: channel, count: 1 }, function (data) {
      return callback(null, data);
    });
  } else {
    throw new Error(errors.missing_required_arg);
  }
}

/**
 * Gets a group by id
 * @return {object} group object
 */
SmartSlack.prototype.getGroupById = function (id, callback) {

  var group;
  callback = (typeof callback === 'function') ? callback : function () { };

  if (id && this.groups) {
    group = _.find(this.groups, { id: id });
    if (group) {
      return callback(null, group);
    }
  } else {
    throw new Error(errors.missing_required_arg);
  }
};

/**
 * Gets a group by name
 * @return {object} group object
 */
SmartSlack.prototype.getGroupByName = function (name, callback) {

  var group;
  callback = (typeof callback === 'function') ? callback : function () { };

  if (name && this.groups) {
    group = _.find(this.groups, { name: name });
    if (group) {
      return callback(null, group);
    }
  } else {
    throw new Error(errors.missing_required_arg);
  }
};

/**
 * Gets a im channel id
 * @param {string} user name
 * @return {object} user object
 */
SmartSlack.prototype.getImChannelId = function (name, callback) {

  var _this = this;
  var imChannel;
  callback = (typeof callback === 'function') ? callback : function () { };

  if (name && typeof name === 'string') {

    this.getUserByName(name, function (err, user) {
      imChannel = _.find(_this.ims, { user: user.id });
      if (imChannel) {
        return callback(null, imChannel.id);
      } else {
        _this.openIm(user.id, function(err,channel) {
          return callback(channel.id);
        });
      }
    });
  } else {
    throw new Error(errors.missing_required_arg);
  }
};

/**
 * Gets the users presence
 * @param {string} auto || away
 */
SmartSlack.prototype.getPresence = function (user, callback) {

  callback = (typeof callback === 'function') ? callback : function () { };

  if (user && typeof user === 'string') {
    this._apiCall('users.getPresence', { user: user }, function (data) {
      return callback(null, data);
    })
  } else {
    throw new Error(errors.missing_required_arg);
  }
}

/**
 * Gets a user by name
 * @return {object} user object
 */
<<<<<<< HEAD
SmartSlack.prototype.getUserByName = function (name) {
  if (name && typeof name === 'string' && this.users) {
    return _.find(this.users, { name: name });
=======
SmartSlack.prototype.getUserByName = function (name, callback) {
  
  var user;
  callback = (typeof callback === 'function') ? callback : function () { };
  
  if (name && this.users) {
    user =  _.find(this.users, { name: name });
    if (user) {
      return  callback(null, user);
    }
>>>>>>> master
  } else {
    throw new Error(errors.missing_required_arg);
  }
};

/**
 * Gets a user by id
 * @return {object} user object
 */
<<<<<<< HEAD
SmartSlack.prototype.getUserById = function (id) {
  if (id && typeof id === 'string' && this.users) {
    return _.find(this.users, { id: id });
=======
SmartSlack.prototype.getUserById = function (id, callback) {

  var user;
  callback = (typeof callback === 'function') ? callback : function () { };

  if (id && this.users) {
    user = _.find(this.users, { id: id });
    if (user) {
      return callback(null, user);
    }

>>>>>>> master
  } else {
    throw new Error(errors.missing_required_arg);
  }
} 

/**
 * Gets users list from API
 * @param {funciton} callback
 * @return {array} the user list
 */
SmartSlack.prototype.getUsersList = function (callback) {

  var _this = this;
  callback = (typeof callback === 'function') ? callback : function () { };

  this._apiCall('users.list', function (data) {

    if (data.ok) {
      
      // Save the users list
      _this.users = data.users;
      return callback(null, data.users);
    } else {
      return callback(null, data);
    }
  });
};

/**
 * Login to Slack
 */
SmartSlack.prototype.login = function () {

  var _this = this;
  this._apiCall('rtm.start', function (data) {

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
};


/**
 * Open a direct message channel
 * @param user id
 * @returns {object} JSON response
 */
SmartSlack.prototype.openIm = function (userId, callback) {

  callback = (typeof callback === 'function') ? callback : function () { };

  if (userId && typeof userId === 'string') {
    this._apiCall('im.open', { user: userId }, function (data) {
      if (data.ok) {
        return callback(null, data);
      }
    });
  } else {
    throw new Error(errors.missing_required_arg);
  };
};

/**
 * Post a message to the Slack API
 * @param id 
 * @param text 
 * @param params
 */
SmartSlack.prototype.postMessage = function (channelId, text, params, callback) {

  callback = (typeof callback === 'function') ? callback : function () { };

  if (typeof params === 'function') {
    callback = params;
    params = null;
  }

  if (channelId && text) {
    params = _.extend({
      channel: channelId,
      text: text,
      username: this.name
    }, params || {});

    this._apiCall('chat.postMessage', params, function (data) {
      return callback(null, data);
    });
  } else {
    throw new Error(errors.missing_required_arg);
  }
};

/**
 * Sends a message via the RTM socket
 */
SmartSlack.prototype.send = function (channel, text) {

  var msg;
  var data;
  if (channel && text) {
    msg = {
      "id": this._messageId,
      "type": "message",
      "channel": channel,
      "text": text
    }
    data = JSON.stringify(msg);
    this.ws.send(data);
    this._messageId += 1;
  }
}

/**
 * Sets the users presence
 * @param {string} auto || away
 */
SmartSlack.prototype.setPresence = function (presence,callback) {
  
  callback = (typeof callback === 'function') ? callback : function () { };
  
  if (presence && presence === 'away' || presence === 'auto') {
    this._apiCall('users.setPresence', { "presence": presence },function(data) {
      return callback(null, data);
    })
  } else {
    throw new Error(errors.missing_required_arg);
  }
}

/**
 * Used for reconnection, attempts to resolve slack.com
 * Calls login() if resolved
 * @returns {boolean}
 */
SmartSlack.prototype._canResolve = function (callback) {
  
  var _this = this;
  callback = (typeof callback === 'function') ? callback : function () { };
  
  this.log.debug('Attempting to resolve ' + this.hostname);

  dns.resolve4(_this.hostname, function (err, addresses) {
    
    if (!err) {
      _this.log.debug('Resolved ' + _this.hostname + ' (' + addresses[0] + ')');
      
      if (_this.reconnecting) {
        clearInterval(_this._reconnecting);
        _this.login();
      }
      return callback(true);
      
    } else {
      
      _this.log.debug('DNS resolution failed. Error Code: ' + err.code);
      return callback(false);
    }
  });
};

/**
 * Handle slack RTM event message
 * @param The slack RTM message
 */
SmartSlack.prototype._onRtmEvent = function (message) {

  var _this = this;

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
      this._pingInterval = setInterval(function () { _this._ping() }, 5000);
      break;

    case 'message':
      this.emit('message', message);
      break;

    case 'pong':
      this._lastPong = _.now();
      this.log.debug('Latency = ' + (this._lastPong - message.time) + 'ms');
      break;
  }
};

/**
 * Sends ping message over the RTM
 */
SmartSlack.prototype._ping = function () {
  var data;
  var ping = { "type": "ping" };
  ping.id = this._messageId;
  ping.time = _.now();
  data = JSON.stringify(ping);
  this.ws.send(data);
  this._messageId += 1;
}

/**
 * Reconnects to Slack RTM
 */
SmartSlack.prototype._reconnect = function () {
  var _this = this;
  
  // Connection lost stop pinging and reset
  clearInterval(this._pingInterval);
  this._avgLatency = [];
  this._lastPong = null;
  this.connected = false;
  this.authenticated = false;

  //  Attempt to resolve slack.com and call login when it available
  this._reconnecting = setInterval(function () { _this._canResolve() }, 5000);
  this.log.debug('Connection lost waiting to reconnect...');
}

/**
 * Makes a method call to the Slack API
 */
SmartSlack.prototype._apiCall = function (method, params, callback) {

  var _this = this;

  if (typeof params === 'function') {
    callback = params;
    params = null;
  }

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
          if (callback) {
            callback(value);
          }

        } else {
          if (callback) {
            callback({ 'ok': false, 'error': 'API response: ' + res.statusCode })
          }
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

module.exports = SmartSlack;