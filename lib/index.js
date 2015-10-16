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
var bole = require('bole');
var pretty = require('bistre')({ time: true });
var WebSocket = require('ws');

var errors = {
    invalid_token: 'Error invalid access token, please provide a valid token.',
    missing_options_arg: 'Error missing required argument object options',
    missing_required_arg: 'Error missing or invalid required argument'
};

// Bole Logging
bole.output({
    level: process.env.LOG_LEVEL || 'debug'
    , stream: pretty
});
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
        !accessToken.match(/^([a-z]{4})-([0-9]{11})-([0-9a-zA-Z]{24})$/)) {
        throw new Error(errors.invalid_token);
    }

    this.options = _.defaults(options, this.options);
    this.hostname = 'slack.com';
    this.authenticated = false;
    this.autoReconnect = options.autoReconnect || true;
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

    this.messageId = 0;
    this.lastPong = null;
};

util.inherits(SmartSlack, EventEmitter);

/**
 * auth.test api method
 *@param {function} callback(err,data)
 */
SmartSlack.prototype.authTest = function (callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    this.apiCall('auth.test', function (data) {
        if (data) {
            callback(null, data);
        }
    });
};

/**
 * Calls api.test api method
 * @params {object} json options
 */
SmartSlack.prototype.apiTest = function (params, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    this.apiCall('api.test', params, function (data) {
        if (data) {
            callback(null, data);
        }
    });
};

/**
 * Add a reaction to a message
 * @param {string} emojiName  i.e. thumbsup
 * @param {string} channel id
 * @param {string} message timestamp
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.addReaction = function (emojiName, channel, timestamp, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (emojiName && channel && timestamp && typeof emojiName === 'string'
        && typeof channel === 'string' && typeof timestamp === 'string') {

        this.apiCall('reactions.add', { name: emojiName, channel: channel, timestamp: timestamp }, function (data) {
            return callback(null, data);
        });
    } else {
        throw new Error(errors.missing_required_arg);
    }
};

/**
 * Connect a WebSocket
 */
SmartSlack.prototype.connect = function () {
    var output;
    var _this = this;

    this.ws = new WebSocket(this.socketUrl);

    this.ws.on('open', function (data) {
        _this.emit('open', data);
        _this.lastPong = _.now();
    });

    this.ws.on('close', function (data) {
        _this.emit('close', data);

        if (_this.autoReconnect) {
            _this.reconnect();
        }
    });

    this.ws.on('error', function (data) {
        _this.emit('error', data);
    });

    this.ws.on('message', function (data) {
        try {
            output = JSON.parse(data);
            _this.onRtmEvent(output);
        } catch (error) {
            _this.emit('error', error);
        }
    });
};

/**
 * Gets channel list, excluding archived channels
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.getActiveChannels = function (callback) {

    var _this = this;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    this.apiCall('channels.list', { exclude_archived: "1" }, function (data) {

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
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.getActiveGroups = function (callback) {

    var _this = this;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    this.apiCall('groups.list', { exclude_archived: "1" }, function (data) {

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
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.getChannelByName = function (name, callback) {

    var channel;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (name && this.channels) {
        channel = _.find(this.channels, { name: name });
        if (channel) {
            return callback(null, channel);
        }
    } else {
        throw new Error(errors.missing_required_arg);
    }
};

/**
 * Gets a channel by id
 * @param {string} channel id
 * @param {function} callback
 */
SmartSlack.prototype.getChannelById = function (id, callback) {

    var channel;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (id && this.channels) {
        channel = _.find(this.channels, { id: id });
        if (channel) {
            return callback(null, channel);
        }
    } else {
        throw new Error(errors.missing_required_arg);
    }
};

/**
 * Gets the last message posted to a channel
 * @param {string} channel id
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.getLastChannelMessage = function (channel, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (channel && typeof channel === 'string') {
        this.apiCall('channels.history', { channel: channel, count: 1 }, function (data) {
            return callback(null, data);
        });
    } else {
        throw new Error(errors.missing_required_arg);
    }
};

/**
 * Gets a group by id
 * @param {string} group id
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.getGroupById = function (id, callback) {

    var group;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

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
 * @param {string} group name
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.getGroupByName = function (name, callback) {

    var group;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

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
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.getImChannelId = function (name, callback) {

    var _this = this;
    var imChannel;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (name && typeof name === 'string') {

        this.getUserByName(name, function (err, user) {

            if (!err) {
                imChannel = _.find(_this.ims, { user: user.id });
            } else {
                return callback(err, null);
            }

            if (imChannel) {
                return callback(null, imChannel.id);
            }

            _this.openIm(user.id, function (err, data) {
                if (!err) {
                    return callback(null, data.id);
                } else {
                    return callback(err, null);
                }
            });

        });
    } else {
        throw new Error(errors.missing_required_arg);
    }
};

/**
 * Gets the users presence
 * @param {string} user id
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.getPresence = function (userId, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (userId && typeof userId === 'string') {
        this.apiCall('users.getPresence', { user: userId }, function (data) {
            return callback(null, data);
        });
    } else {
        throw new Error(errors.missing_required_arg);
    }
};

/**
 * Gets a user by name
 * @param {string} user name (i.e. john)
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.getUserByName = function (name, callback) {

    var user;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (name && this.users) {
        user = _.find(this.users, { name: name });
        if (user) {
            return callback(null, user);
        } else {
            return callback('Error: User not found', null);
        }
    } else {
        throw new Error(errors.missing_required_arg);
    }
};

/**
 * Gets a user object by id
 * @param {string} user id
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.getUserById = function (id, callback) {

    var user;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (id && this.users) {
        user = _.find(this.users, { id: id });
        if (user) {
            return callback(null, user);
        }
    } else {
        throw new Error(errors.missing_required_arg);
    }
};

/**
 * Gets users list from API
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.getUsersList = function (callback) {

    var _this = this;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    this.apiCall('users.list', function (data) {

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
    this.apiCall('rtm.start', function (err, data) {

        if (!err) {
            if (!data.ok) {
                _this.emit('error', data.error);
            } else {

                _this.log.debug('Slack client authenticated...');
                _this.authenticated = true;

                // Stash the Slack session data
                _this.user = data.self;
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
 * @param {string} user id
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.openIm = function (userId, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (userId && typeof userId === 'string') {
        this.apiCall('im.open', { user: userId }, function (err, data) {
            if (data.ok) {
                return callback(null, data);
            } else {
                return callback(err, null);
            }
        });
    } else {
        throw new Error(errors.missing_required_arg);
    }
};

/**
 * Post a message to the Slack API
 * @param id {string} channel id
 * @param text {string} message text
 * @param params message option
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.postMessage = function (channelId, text, params, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (typeof params === 'function') {
        callback = params;
        params = null;
    }

    if (channelId && text) {
        params = _.extend({
            channel: channelId,
            text: text,
            username: this.user.name,
            as_user: true
        }, params || {});

        this.apiCall('chat.postMessage', params, function (err, data) {
            if (!err) {
                return callback(null, data);
            } else {
                return callback(err, null);
            }

        });
    } else {
        throw new Error(errors.missing_required_arg);
    }
};

/**
 * Post API message to channel by channel name
 * @param name {string} group name
 * @param text {string} message
 * @param params {object} optional message options
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.postMessageToChannel = function (channelName, text, params, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (channelName && typeof channelName === 'string' && text && typeof text === 'string') {
        if (typeof params === 'function') {
            callback = params;
            params = null;
        }

        this.postMessageToType('channel', channelName, text, params, callback);
    } else {
        throw new Error(errors.missing_required_arg);
    }
};

/**
 * Post API message to group by group name
 * @param name {string} group name
 * @param text {string} message
 * @param params {object} optional message options
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.postMessageToGroup = function (groupName, text, params, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (groupName && typeof groupName === 'string' && text && typeof text === 'string') {
        if (typeof params === 'function') {
            callback = params;
            params = null;
        }
        this.postMessageToType('group', groupName, text, params, callback);
    } else {
        throw new Error(errors.missing_required_arg);
    }
};

/**
 * Post API message to a user by username
 * @param name {string} username
 * @param text {string} message
 * @param params {object} message options
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.postMessageToUser = function (username, text, params, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (username && typeof username === 'string' && text && typeof text === 'string') {
        if (typeof params === 'function') {
            callback = params;
            params = null;
        }


        this.postMessageToType('user', username, text, params, callback);
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
            id: this.messageId,
            type: "message",
            channel: channel,
            text: text
        };
        data = JSON.stringify(msg);
        this.ws.send(data);
        this.messageId += 1;
    }
};

/**
 * Sets the users presence
 * @param {string} auto || away
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.setPresence = function (presence, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (presence && (presence === 'away' || presence === 'auto')) {
        this.apiCall('users.setPresence', { presence: presence }, function (data) {
            return callback(null, data);
        });
    } else {
        throw new Error(errors.missing_required_arg);
    }
};

/**
 * Used for reconnection, attempts to resolve slack.com
 * Calls login() if resolved
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.canResolve = function (callback) {

    var _this = this;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    this.log.debug('Attempting to resolve ' + this.hostname);

    dns.resolve4(_this.hostname, function (err, addresses) {

        if (!err) {
            _this.log.debug('Resolved ' + _this.hostname + ' (' + addresses[0] + ')');

            if (_this.reconnecting) {
                clearInterval(_this.reconnecting);
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
SmartSlack.prototype.onRtmEvent = function (message) {

    var _this = this;

    this.emit('rawmessage', message);
    this.log.debug(message);

    switch (message.type) {

        case 'hello':

            // Received the hello event message
            this.log.debug('Slack RTM socket connected...');
            this.connected = true;
            this.emit('connected');
            this.lastPong = _.now();

            // Start pings every five seconds
            this.pingInterval = setInterval(function () { _this.ping(); }, 5000);
            break;

        case 'message':
            this.emit('message', message);
            break;

        case 'pong':
            this.lastPong = _.now();
            this.log.debug('Latency: ' + (this.lastPong - message.time) + 'ms');
            break;
    }
};

/**
 * Sends ping message over the RTM
 */
SmartSlack.prototype.ping = function () {
    var data;
    var ping = { type: "ping" };
    ping.id = this.messageId;
    ping.time = _.now();
    data = JSON.stringify(ping);
    this.ws.send(data);
    this.messageId += 1;
};

/**
 * Post a API message to channel, group, or user
 * @param slackType {string} the slack entity i.e. group
 * @param typeName {string} the entity's name
 * @param text {string} the message text
 * @param params message options
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.postMessageToType = function (slackType, typeName, text, params, callback) {

    var entityId;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (typeof params === 'function') {
        callback = params;
        params = null;
    }

    switch (slackType) {
        case "channel":
            this.getChannelByName(typeName, function (err, data) {
                if (!err) {
                    entityId = data.id;
                }
            });
            break;
        case "group":
            this.getGroupByName(typeName, function (err, data) {
                if (!err) {
                    entityId = data.id;
                }
            });
            break;
        case "user":
            this.getImChannelId(typeName, function (err, data) {
                if (!err) {
                    entityId = data;
                }
            });
            break;
        default:
            entityId = null;
            return callback('Error invalid Slack type', null);
    }

    if (entityId) {
        params = _.extend({
            channel: entityId,
            text: text,
            username: this.user.name,
            as_user: true
        }, params || {});

        this.apiCall('chat.postMessage', params, function (err, data) {
            if (!err) {
                return callback(null, data);
            } else {
                return callback(err, null);
            }

        });
    } else {
        return callback('Error entity name not found', null);
    }
};


/**
 * Reconnects to Slack RTM
 */
SmartSlack.prototype.reconnect = function () {
    var _this = this;

    // Connection lost stop pinging and reset
    clearInterval(this.pingInterval);
    this.lastPong = null;
    this.connected = false;
    this.authenticated = false;

    //  Attempt to resolve slack.com and call login when it available
    this.reconnecting = setInterval(function () { _this.canResolve(); }, 5000);
    this.log.debug('Connection lost waiting to reconnect...');
};

/**
 * Makes a method call to the Slack API
 * @param {string} the method to call
 * @param {object} the message options
 * @param {function} callback(err,data)
 */
SmartSlack.prototype.apiCall = function (method, params, callback) {

    var _this = this;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

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
        var data;

        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function () {
            if (res.statusCode === 200) {
                try {
                    data = JSON.parse(output);
                } catch (error) {
                    return _this.log.debug(error);
                }
                return callback(null, data);

            } else {
                return callback({ ok: false, error: 'API response: ' + res.statusCode }, null);
            }
        });
    });

    req.on('error', function (e) {
        _this.log.debug('HTTPS request error: ' + e);
        callback({ ok: false, error: e.errno });
    });

    req.write(postData);
    req.end();
};

module.exports = SmartSlack;