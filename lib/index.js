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
    invalid_token: 'Invalid access token, please provide a valid token.',
    missing_options_arg: 'Missing required argument object options',
    missing_required_arg: 'Missing or invalid required argument(s)',
    entity_not_found: 'Entity name not found',
    invalid_slack_type: 'Not a valid slack type'
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
 *@param {function} callback(err,result)
 */
SmartSlack.prototype.authTest = function (callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    this.apiCall('auth.test', function (result) {
        if (result) {
            callback(null, result);
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

    if (!params) {
        return callback(new Error(errors.missing_required_arg));
    }

    this.apiCall('api.test', params, function (result) {
        if (result) {
            callback(null, result);
        }
    });
};

/**
 * Add a reaction to a message
 * @param {string} emojiName  i.e. thumbsup
 * @param {string} channel id
 * @param {string} message timestamp
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.addReaction = function (emojiName, channel, timestamp, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (emojiName && channel && timestamp && typeof emojiName === 'string'
        && typeof channel === 'string' && typeof timestamp === 'string') {

        this.apiCall('reactions.add', { name: emojiName, channel: channel, timestamp: timestamp }, function (result) {
            return callback(null, result);
        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Connect a WebSocket
 */
SmartSlack.prototype.connect = function () {

    var output;
    var _this = this;

    this.ws = new WebSocket(this.socketUrl);

    this.ws.on('open', function (result) {
        _this.emit('open', result);
        _this.lastPong = _.now();
    });

    this.ws.on('close', function (result) {
        _this.emit('close', result);

        if (_this.autoReconnect) {
            _this.reconnect();
        }
    });

    this.ws.on('error', function (result) {
        _this.emit('error', result);
    });

    this.ws.on('message', function (result) {
        try {
            output = JSON.parse(result);
            _this.onRtmEvent(output);
        } catch (error) {
            _this.emit('error', error);
        }
    });
};

/**
 * Gets channel list, excluding archived channels
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.getActiveChannels = function (callback) {

    var _this = this;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    this.apiCall('channels.list', { exclude_archived: "1" }, function (err, result) {

        if (err) {
            return callback(err);
        }

        if (result.ok) {

            // Save the channel list
            _this.channels = result.channels;
            return callback(null, result.channels);

        }
        callback(null, result);
    });
};

/**
 * Gets group list from API
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.getActiveGroups = function (callback) {

    var _this = this;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    this.apiCall('groups.list', { exclude_archived: "1" }, function (err, result) {

        if (err) {
            return callback(err);
        }

        if (result.ok) {

            // Save the group list
            _this.groups = result.groups;
            return callback(null, result.groups);
        }
        callback(result, null);
    });
};

/**
 * Gets a channel by name
 * @param {string} channel name
 * @param {function} callback(err,result)
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
        callback(new Error(errors.missing_required_arg), null);
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
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Gets the last message posted to a channel
 * @param {string} channel id
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.getLastChannelMessage = function (channel, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (channel && typeof channel === 'string') {
        this.apiCall('channels.history', { channel: channel, count: 1 }, function (result) {
            return callback(null, result);
        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Gets a group by id
 * @param {string} group id
 * @param {function} callback(err,result)
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
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Gets a group by name
 * @param {string} group name
 * @param {function} callback(err,result)
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
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Gets a im channel id
 * @param {string} user name
 * @param {function} callback(err,result)
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

            _this.openIm(user.id, function (err, result) {
                if (!err) {
                    return callback(null, result.id);
                } else {
                    return callback(err, null);
                }
            });

        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Gets the users presence
 * @param {string} user id
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.getPresence = function (userId, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (userId && typeof userId === 'string') {
        this.apiCall('users.getPresence', { user: userId }, function (result) {
            return callback(null, result);
        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Gets a user by name
 * @param {string} user name (i.e. john)
 * @param {function} callback(err,result)
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
    }
    callback(new Error(errors.missing_required_arg), null);
};

/**
 * Gets a user object by id
 * @param {string} user id
 * @param {function} callback(err,result)
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
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Gets users list from API
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.getUsersList = function (callback) {

    var _this = this;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    this.apiCall('users.list', function (result) {

        if (result.ok) {

            // Save the users list
            _this.users = result.users;
            return callback(null, result.users);
        } else {
            return callback(null, result);
        }
    });
};

/**
 * Login to Slack
 */
SmartSlack.prototype.login = function () {

    var _this = this;
    this.apiCall('rtm.start', function (err, result) {

        if (!err) {
            if (!result.ok) {
                _this.emit('error', result.error);
            } else {

                _this.log.debug('Slack client authenticated...');
                _this.authenticated = true;

                // Persist the Slack session data
                _this.user = result.self;
                _this.users = result.users;
                _this.channels = result.channels;
                _this.groups = result.groups;
                _this.ims = result.ims;
                _this.team = result.team;

                // Connect
                _this.socketUrl = result.url;
                _this.connect();
            }
        }
    });
};


/**
 * Open a direct message channel
 * @param {string} user id
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.openIm = function (userId, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (userId && typeof userId === 'string') {
        this.apiCall('im.open', { user: userId }, function (err, result) {
            if (result.ok) {
                return callback(null, result);
            } else {
                return callback(err, null);
            }
        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Post a message to the Slack API
 * @param id {string} channel id
 * @param text {string} message text
 * @param params message option
 * @param {function} callback(err,result)
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

        this.apiCall('chat.postMessage', params, function (err, result) {
            if (!err) {
                return callback(null, result);
            } else {
                return callback(err, null);
            }

        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Post API message to channel by channel name
 * @param name {string} group name
 * @param text {string} message
 * @param params {object} optional message options
 * @param {function} callback(err,result)
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
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Post API message to group by group name
 * @param name {string} group name
 * @param text {string} message
 * @param params {object} optional message options
 * @param {function} callback(err,result)
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
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Post API message to a user by username
 * @param name {string} username
 * @param text {string} message
 * @param params {object} message options
 * @param {function} callback(err,result)
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
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Sends a message via the RTM socket
 */
SmartSlack.prototype.send = function (channel, text) {

    var msg;
    var result;
    if (channel && text) {
        msg = {
            id: this.messageId,
            type: "message",
            channel: channel,
            text: text
        };
        result = JSON.stringify(msg);
        this.ws.send(result);
        this.messageId += 1;
    }
};

/**
 * Sets the users presence
 * @param {string} auto || away
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.setPresence = function (presence, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (presence && (presence === 'away' || presence === 'auto')) {
        this.apiCall('users.setPresence', { presence: presence }, function (result) {
            return callback(null, result);
        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Used for reconnection, attempts to resolve slack.com
 * Calls login() if resolved
 * @param {function} callback(err,result)
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

    this.emit('eventmessage', message);
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
    var result;
    var ping = { type: "ping" };
    ping.id = this.messageId;
    ping.time = _.now();
    result = JSON.stringify(ping);
    this.ws.send(result);
    this.messageId += 1;
};

/**
 * Post a API message to channel, group, or user
 * @param slackType {string} the slack entity i.e. group
 * @param typeName {string} the entity's name
 * @param text {string} the message text
 * @param params message options
 * @param {function} callback(err,result)
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
            this.getChannelByName(typeName, function (err, result) {
                if (!err) {
                    entityId = result.id;
                }
            });
            break;
        case "group":
            this.getGroupByName(typeName, function (err, result) {
                if (!err) {
                    entityId = result.id;
                }
            });
            break;
        case "user":
            this.getImChannelId(typeName, function (err, result) {
                if (!err) {
                    entityId = result;
                }
            });
            break;
        default:
            entityId = null;
            return callback(new Error(errors.invalid_slack_type), null);
    }

    if (entityId) {
        params = _.extend({
            channel: entityId,
            text: text,
            username: this.user.name,
            as_user: true
        }, params || {});

        this.apiCall('chat.postMessage', params, function (err, result) {
            if (!err) {
                return callback(null, result);
            } else {
                return callback(err, null);
            }

        });
    } else {
        callback(new Error(errors.entity_not_found), null);
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
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.apiCall = function (method, params, callback) {

    var _this = this;
    var request;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (!method) {
        return callback(new Error(errors.missing_required_arg));
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

    request = https.request(options, function (response) {

        var output = '';
        var result;

        response.setEncoding('utf8');

        response.on('data', function (chunk) {
            output += chunk;
        });

        response.on('end', function () {

            if (response.statusCode === 200) {
                try {
                    result = JSON.parse(output);
                } catch (error) {
                    _this.log.debug(error);
                }
                return callback(null, result);

            } else {
                return callback({ ok: false, error: 'API response: ' + response.statusCode }, null);
            }
        });
    });

    request.on('error', function (err) {
        _this.log.debug(err);
        _this.emit('error', err);
    });

    request.write(postData);
    request.end();
};

module.exports = SmartSlack;