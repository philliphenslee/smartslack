/**
 * SmartSlack module.
 * @description A Slack RTM API client
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
    invalid_slack_type: 'Not a valid slack type',
    slack_api_error: 'A Slack API error occurred',
    item_not_found: 'The item could not be found'
};
/**
 * Slack entity types
 * @enum {string}
 */
var slackTypes = {
    CHANNEL: 'channels',
    GROUP: 'groups',
    USER: 'users'
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
 * @param {object} required configuration options
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
    this.connected = false;
    this.log = bole('smartslack');
    this.user = null;
    this.users = null;
    this.channels = null;
    this.groups = null;
    this.ims = null;
    this.team = null;

    this._autoConnect = options.autoConnect || true;
    this._autoReconnect = options.autoReconnect || true;
    this._webSocket = null;
    this._socketUrl = null;
    this._messageId = 0;
    this._lastPong = null;
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

    this._apiCall('auth.test', function (result) {
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

    this._apiCall('api.test', params, function (result) {
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

        this._apiCall('reactions.add', { name: emojiName, channel: channel, timestamp: timestamp }, function (result) {
            return callback(null, result);
        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Disconnect WebSocket
 */
SmartSlack.prototype.disconnect = function () {

    this._autoReconnect = false;
    this._webSocket.terminate();
    this.connected = false;
    this._lastPong = null;
    clearInterval(this._pingInterval);
};

/**
 * Gets a channel by name or id
 * @param {string} match the channel id ot name
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.getChannel = function (match, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (!match) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    this._getEntity(slackTypes.CHANNEL, match, function (err, result) {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
};

/**
 * Gets channel list, excluding archived channels
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.getChannelList = function (callback) {


    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    this._getEntityList(slackTypes.CHANNEL, function (err, result) {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
};

/**
 * Gets a group by name or id
 * @param {string} match the channel id ot name
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.getGroup = function (match, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (!match) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    this._getEntity(slackTypes.GROUP, match, function (err, result) {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
};

/**
 * Gets group list from API
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.getGroupList = function (callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    this._getEntityList(slackTypes.GROUP, function (err, result) {
        if (!err) {
            return callback(null, result);
        }
    });
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

        this.getUser(name, function (err, user) {

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
        this._apiCall('channels.history', { channel: channel, count: 1 }, function (result) {
            return callback(null, result);
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
        this._apiCall('users.getPresence', { user: userId }, function (result) {
            return callback(null, result);
        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Gets a group by name or id
 * @param {string} match the channel id ot name
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.getUser = function (match, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (!match) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    this._getEntity(slackTypes.USER, match, function (err, result) {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
};

/**
 * Gets users list from API
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.getUserList = function (callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    this._getEntityList(slackTypes.USER, function (err, result) {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
};

/**
 * Login to Slack
 */
SmartSlack.prototype.login = function () {

    var _this = this;
    this._apiCall('rtm.start', function (err, result) {

        if (!err) {
            if (!result.ok) {
                _this.emit('error', result.error);
            } else {

                _this.log.debug('Slack client authenticated...');
                //_this.log.debug(result);

                _this._socketUrl = result.url;

                // Persist the Slack session data
                _this.user = result.self;
                _this.users = result.users;
                _this.channels = result.channels;
                _this.groups = result.groups;
                _this.ims = result.ims;
                _this.team = result.team;

                // Connect web socket if auto connect
                if (_this._autoConnect) {
                    _this._connect();
                }
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
        this._apiCall('im.open', { user: userId }, function (err, result) {
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

        this._apiCall('chat.postMessage', params, function (err, result) {
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
 * @param name {string} channel name
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

        this._postMessageToType(slackTypes.CHANNEL, channelName, text, params, callback);
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
        this._postMessageToType(slackTypes.GROUP, groupName, text, params, callback);
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

        this._postMessageToType(slackTypes.USER, username, text, params, callback);
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Post API message to group by group name
 * @param name {string} group name
 * @param text {string} message
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.sendToChannel = function (channel, text, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (channel && typeof channel === 'string' && text && typeof text === 'string') {
        this._sendToType(slackTypes.CHANNEL, channel, text, callback);
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Post API message to group by group name
 * @param name {string} group name
 * @param text {string} message
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.sendToGroup = function (group, text, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (group && typeof group === 'string' && text && typeof text === 'string') {
        this._sendToType(slackTypes.GROUP, group, text, callback);
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Post API message to group by group name
 * @param name {string} group name
 * @param text {string} message
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.sendToUser = function (username, text, callback) {

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (username && typeof username === 'string' && text && typeof text === 'string') {
        this._sendToType(slackTypes.USER, username, text, callback);
    } else {
        callback(new Error(errors.missing_required_arg), null);
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
        this._apiCall('users.setPresence', { presence: presence }, function (result) {
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
SmartSlack.prototype._canResolve = function (callback) {

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

            if (_this._reconnecting) {
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
            this._lastPong = _.now();

            // Start pings every five seconds
            this._pingInterval = setInterval(function () { _this._ping(); }, 5000);
            break;

        case 'message':
            this.emit('message', message);
            break;

        case 'pong':
            this._lastPong = _.now();
            this.log.debug('Latency: ' + (this._lastPong - message.time) + 'ms');
            break;
    }
};

/**
 * Sends ping message over the RTM
 */
SmartSlack.prototype._ping = function () {
    var result;
    var ping = { type: "ping" };
    ping.id = this._messageId;
    ping.time = _.now();
    result = JSON.stringify(ping);
    this._webSocket.send(result);
    this._messageId += 1;
};





/**
 * Makes a method call to the Slack API
 * @param {string} the method to call
 * @param {object} the message options
 * @param {function} callback(err,result)
 */
SmartSlack.prototype._apiCall = function (method, params, callback) {

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

/**
 * Connect WebSocket
 */
SmartSlack.prototype._connect = function () {

    var output;
    var _this = this;

    this._webSocket = new WebSocket(this._socketUrl);

    this._webSocket.on('open', function (result) {

        _this.emit('open', result);
        _this._lastPong = _.now();
    });

    this._webSocket.on('close', function (result) {

        _this.emit('close', result);
        if (_this._autoReconnect) {
            _this._reconnect();
        }
    });

    this._webSocket.on('error', function (result) {

        _this.emit('error', result);
    });

    this._webSocket.on('message', function (result) {

        try {
            output = JSON.parse(result);
            _this.onRtmEvent(output);
        } catch (error) {
            _this.emit('error', error);
        }
    });
};

/**
 * Gets a Slack entity by name or id
 * @param {string} slackType (slackType.CHANNEL)
 * @param {string} search a channel name or id
 * @param {function} callback(err,result)
 */
SmartSlack.prototype._getEntity = function (slackType, search, callback) {

    var _this = this;
    var entity;
    var entityMethod;
    var attribute;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    if (!slackType && !search) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    search.match(/^([CGU]0)/) ? attribute = 'id' : attribute = 'name';

    if (this[slackType]) {
        entity = _.find(this[slackType], { [attribute]: search });
        if (entity) {
            return callback(null, entity);
        } else {
            return callback(new Error(errors.item_not_found), null)
        }
    } else {

        switch (slackType) {
            case 'channels':
                entityMethod = 'getChannelList';
                break;
            case 'groups':
                entityMethod = 'getGroupList';
                break;
            case 'users':
                entityMethod = 'getUserList';
                break;
            default:
                return callback(new Error(errors.invalid_slack_type), null);
        }

        this[entityMethod](function (err, result) {
            if (err) {
                return callback(err, null);
            }
            entity = _.find(_this[slackType], { [attribute]: search });
            if (entity) {
                return callback(null, entity);
            } else {
                callback(new Error(errors.item_not_found), null)
            }
        });
    }
};

/**
 * Gets a list of channels, groups, or users from the API
 * @param {object} enum slackType (slackType.CHANNEL)
 * @param {function} callback(err,result)
 */
SmartSlack.prototype._getEntityList = function (slackType, callback) {

    var _this = this;
    var entityMethod;
    var apiOptions = null;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    entityMethod = slackType + '.list';

    // Don't return archived channels or groups
    if (slackType === 'channels' || slackType === 'groups') {
        apiOptions = { exclude_archived: "1" };
    }

    this._apiCall(entityMethod, apiOptions, function (err, result) {

        if (err) {
            return callback(err, null);
        }

        if (result.ok) {

            // Users work around, when calling uers.list they return members: not users:
            if (slackType === slackTypes.USER) {
                _this.users = result.members;
                return callback(null, result.members);
            } else {
                _this[slackType] = result[slackType];
                return callback(null, result[slackType]);
            }
        }
        callback(new Error(errors.slack_api_error + ': ' + result), null);
    });
};

/**
 * Post a API message to channel, group, or user
 * @param slackType {string} the slack entity i.e. group
 * @param typeName {string} the entity's name
 * @param text {string} the message text
 * @param params message options
 * @param {function} callback(err,result)
 */
SmartSlack.prototype._postMessageToType = function (slackType, typeName, text, params, callback) {

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
        case slackTypes.CHANNEL:
            this.getChannel(typeName, function (err, result) {
                if (!err) {
                    entityId = result.id;
                }
            });
            break;
        case slackTypes.GROUP:
            this.getGroup(typeName, function (err, result) {
                if (!err) {
                    entityId = result.id;
                }
            });
            break;
        case slackTypes.USER:
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

        this._apiCall('chat.postMessage', params, function (err, result) {
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
SmartSlack.prototype._reconnect = function () {

    var _this = this;

    // Connection lost stop pinging and reset
    clearInterval(this._pingInterval);
    this.connected = false;
    this._lastPong = null;

    //  Attempt to resolve slack.com and call login when available
    this._reconnecting = setInterval(function () { _this._canResolve(); }, 5000);
    this.log.debug('Connection lost waiting to reconnect...');
};

/**
 * Sends a message via the RTM socket
 * @param {string} the channel id
 * @param {string} message text
 * @access private
 */
SmartSlack.prototype._send = function (channel, text) {

    var message;
    var output;
    if (!channel && !text) {

    }
    message = {
        id: this._messageId,
        type: 'message',
        channel: channel,
        text: text
    };

    try {
        output = JSON.stringify(message);
    } catch (error) {
        this.log.error(error);
    }

    this._webSocket.send(output);
    this._messageId += 1;
};


/**
 * Send a RTM socket message to channel, group, or user
 * @param slackType {string} enum slackTypes.CHANNEL
 * @param typeName {string} the entity's name
 * @param text {string} the message text
 * @param {function} callback(err,result)
 */
SmartSlack.prototype._sendToType = function (slackType, typeName, text, callback) {

    var entityId;

    if (typeof callback === 'function') {
        callback = callback;
    } else {
        callback = function () { return undefined; };
    }

    switch (slackType) {
        case slackTypes.CHANNEL:
            this.getChannel(typeName, function (err, result) {
                if (!err) {
                    entityId = result.id;
                }
            });
            break;
        case slackTypes.GROUP:
            this.getGroup(typeName, function (err, result) {
                if (!err) {
                    entityId = result.id;
                }
            });
            break;
        case slackTypes.USER:
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
        this._send(entityId, text);
    } else {
        callback(new Error(errors.entity_not_found), null);
    }
};

module.exports = SmartSlack;