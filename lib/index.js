/// <reference path="../typings/node/node.d.ts" />

/**
 * SmartSlack module
 * @description SmartSlack is a node.js module
 * for Slack's Real Time Messaging API
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

var Slack = require('./slack/index.js');

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
    IMS: 'ims',
    USER: 'users'
};

// JSON logging by bole and bistre
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
function SmartSlack(options) {

    // Must provide a valid options argument
    if (!options) {
        throw new Error(errors.missing_options_arg);
    }

    var accessToken = options.token;

    // Need a valid Slack token to authenticate
    if (!accessToken || typeof accessToken !== 'string' ||
        !accessToken.match(/^([a-z]{4})-([0-9]{11})-([0-9a-zA-Z]{24})$/)) {
        throw new Error(errors.invalid_token);
    }

    global.ACCESS_TOKEN = options.token;

    this.options = _.defaults(options, this.options);
    this.slack = Slack;

    this.connected = false;
    this.log = bole('smartslack');
    this.user = null;
    this.users = null;
    this.channels = null;
    this.groups = null;
    this.ims = null;
    this.team = null;

    this._autoReconnect = options.autoReconnect || true;
    this._lastPong = null;
    this._messageId = 0;
    this._socketUrl = null;
    this._token = this.options.token;
    this._webSocket = null;
};

util.inherits(SmartSlack, EventEmitter);


/**
 * Add a reaction to a message
 * @param {string} emojiName  The emoji icon i.e. thumbsup
 * @param {string} channel The channel id
 * @param {string} timestamp The message timestamp
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.addReaction = function (emojiName, channel, timestamp, callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    if (emojiName && channel && timestamp && typeof emojiName === 'string'
        && typeof channel === 'string' && typeof timestamp === 'string') {

        this._apiCall('reactions.add', { name: emojiName, channel: channel, timestamp: timestamp }, function (results) {
            return callback(null, results);
        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Gets a channel by name or id
 * @param {string} match the channel id or name to find
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.getChannel = function (match, callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    if (!match) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    this._getEntity(slackTypes.CHANNEL, match, function (err, results) {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

/**
 * Gets channel list from API, excluding archived channels
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.getChannelList = function (callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    this._getEntityList(slackTypes.CHANNEL, function (err, results) {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

/**
 * Gets a group by name or id
 * @param {string} match The group id or name to find
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.getGroup = function (match, callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    if (!match) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    this._getEntity(slackTypes.GROUP, match, function (err, results) {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

/**
 * Gets group list from API, excluding archived groups
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.getGroupList = function (callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    this._getEntityList(slackTypes.GROUP, function (err, results) {
        if (!err) {
            return callback(null, results);
        }
    });
};

/**
 * Gets a im channel id for a user
 * @param {string} name The Slack username
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.getImChannelId = function (name, callback) {

    var _this = this;
    var imChannel;

    callback = (typeof callback === 'function') ? callback : function () { };

    if (name && typeof name === 'string') {

        this.getUser(name, function (err, results) {

            if (err) {
                return callback(err, null);
            }

            imChannel = _.find(_this.ims, { user: results.id });

            if (imChannel) {
                return callback(null, imChannel.id);
            }

            _this.openIm(user.id, function (err, results) {
                if (!err) {
                    return callback(null, results.id);
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
 * @param {string} channel The channel id
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.getLastChannelMessage = function (channel, callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    if (channel && typeof channel === 'string') {
        this._apiCall('channels.history', { channel: channel, count: 1 }, function (results) {
            return callback(null, results);
        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Gets a user by name or id
 * @param {string} match the channel id ot name
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.getUser = function (match, callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    if (!match) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    this._getEntity(slackTypes.USER, match, function (err, results) {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

/**
 * Gets users list from API
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.getUserList = function (callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    this._getEntityList(slackTypes.USER, function (err, results) {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

/**
 * Gets the users presence
 * @param {string} user id
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.getUserPresence = function (userId, callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    if (userId && typeof userId === 'string') {
        this._apiCall('users.getPresence', { user: userId }, function (results) {
            return callback(null, results);
        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Login to Slack
 */
SmartSlack.prototype.login = function () {

    var _this = this;
    this._apiCall('rtm.start', function (err, results) {

        if (!err) {
            if (!results.ok) {
                _this.log.error(results);
                _this.emit('error', results.error);
            } else {

                _this.log.debug('Slack client authenticated...');
                //_this.log.debug(results);

                // Persist the Slack session data
                _this.user = results.self;
                _this.users = results.users;
                _this.channels = results.channels;
                _this.groups = results.groups;
                _this.ims = results.ims;
                _this.team = results.team;

                // Valid for thirty seconds...
                _this._socketUrl = results.url;

                // Connect web socket
                _this._connect();
            }
        }
    });
};

/**
 * Open a direct message channel
 * @param {string} userId Open a direct message channel
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.openIm = function (userId, callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    if (userId && typeof userId === 'string') {
        this._apiCall('im.open', { user: userId }, function (err, results) {
            if (results.ok) {
                return callback(null, results);
            } else {
                return callback(err, null);
            }
        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Post API message to channel or group
 * @param channel {string} channel Channel name or id
 * @param text {string} message Text message
 * @param {object} params Optional message options
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.postMessage = function (channel, text, params, callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    if (channel && typeof channel === 'string' && text && typeof text === 'string') {

        if (typeof params === 'function') {
            callback = params;
            params = null;
        }

        params = _.extend({
            channel: channel,
            text: text,
            username: this.user.name,
            as_user: true
        }, params || {});

        this._apiCall('chat.postMessage', params, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results);

        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Post API message to a user by username
 * @param user {string} user Username or user id
 * @param text {string} message The message text
 * @param params {object} message options
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.postDirectMessage = function (user, text, params, callback) {

    var channel;

    callback = (typeof callback === 'function') ? callback : function () { };

    if (user && typeof user === 'string' && text && typeof text === 'string') {

        if (typeof params === 'function') {
            callback = params;
            params = null;
        }

        this.getImChannelId(user, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            channel = results
        });

        params = _.extend({
            channel: channel,
            text: text,
            username: this.user.name,
            as_user: true
        }, params || {});

        this._apiCall('chat.postMessage', params, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results);
        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Send RTM message to channel
 * @param {string} channel The channel name (i.e. general)
 * @param {string} text The message text
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.sendToChannel = function (channel, text, callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    if (channel && typeof channel === 'string' && text && typeof text === 'string') {
        this._sendToType(slackTypes.CHANNEL, channel, text, callback);
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Send RTM message to group
 * @param {string} group The private group name
 * @param {string} text The message text
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.sendToGroup = function (group, text, callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    if (group && typeof group === 'string' && text && typeof text === 'string') {
        this._sendToType(slackTypes.GROUP, group, text, callback);
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Send RTM message to user
 * @param {string} user The username
 * @param {string} text The message text
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.sendToUser = function (username, text, callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    if (username && typeof username === 'string' && text && typeof text === 'string') {
        this._sendToType(slackTypes.USER, username, text, callback);
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Sets the users presence
 * @param {string} presence auto || away
 * @param {function} callback(err,results)
 */
SmartSlack.prototype.setPresence = function (presence, callback) {

    callback = (typeof callback === 'function') ? callback : function () { };

    if (presence && (presence === 'away' || presence === 'auto')) {
        this._apiCall('users.setPresence', { presence: presence }, function (results) {
            return callback(null, results);
        });
    } else {
        callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Makes a method call to the Slack API
 * @param {string} method The method to call
 * @param {object} params The additional message options
 * @param {function} callback(err,results)
 * @access private
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
        var results;

        response.setEncoding('utf8');

        response.on('data', function (chunk) {
            output += chunk;
        });

        response.on('end', function () {

            if (response.statusCode === 200) {
                try {
                    results = JSON.parse(output);
                } catch (error) {
                    _this.log.debug(error);
                }
                return callback(null, results);

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
 * Used for reconnection, attempts to resolve
 *  slack.com calls login() if resolved
 * @param {function} callback(err,results)
 * @access private
 */
SmartSlack.prototype._canResolve = function (callback) {

    var _this = this;

    callback = (typeof callback === 'function') ? callback : function () { };

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
 * Connect WebSocket
 * @access private
 */
SmartSlack.prototype._connect = function () {

    var output;
    var _this = this;

    this._webSocket = new WebSocket(this._socketUrl);

    this._webSocket.on('open', function (results) {

        _this.emit('open', results);
        _this._lastPong = _.now();
    });

    this._webSocket.on('close', function (results) {

        _this.emit('close', results);
        if (_this._autoReconnect) {
            _this._reconnect();
        }
    });

    this._webSocket.on('error', function (results) {

        _this.emit('error', results);
    });

    this._webSocket.on('message', function (results) {

        try {
            output = JSON.parse(results);
            _this._onRtmEvent(output);
        } catch (error) {
            _this.emit('error', error);
        }
    });
};

/**
 * Gets a Slack entity by name or id
 * @param {string} slackType enum (i.e. slackType.CHANNEL)
 * @param {string} search The entity name or id to find
 * @param {function} callback(err,results)
  * @access private
 */
SmartSlack.prototype._getEntity = function (slackType, search, callback) {

    var _this = this;
    var entity;
    var entityMethod;
    var attribute;

    callback = (typeof callback === 'function') ? callback : function () { };

    if (slackType && typeof slackType === 'string' && search && typeof search === 'string') {

        // Are we looking for a channel, group, or user by id
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

            this[entityMethod](function (err, results) {
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

    } else {
        return callback(new Error(errors.missing_required_arg), null);
    }
};

/**
 * Gets a list of channels, groups, or users from the API
 * @param {string} slackType enum (i.e. slackType.CHANNEL)
 * @param {function} callback(err,results)
 * @access private
 */
SmartSlack.prototype._getEntityList = function (slackType, callback) {

    var _this = this;
    var entityMethod;
    var apiOptions = null;

    callback = (typeof callback === 'function') ? callback : function () { };

    if (!slackType) {
        return callback(new Error(errors.missing_required_arg),null);
    }

    entityMethod = slackType + '.list';

    // Don't return archived channels or groups
    if (slackType === 'channels' || slackType === 'groups') {
        apiOptions = { exclude_archived: "1" };
    }

    this._apiCall(entityMethod, apiOptions, function (err, results) {

        if (err) {
            return callback(err, null);
        }

        if (results.ok) {

            // Users work around, when calling uers.list they return members: not users:
            if (slackType === slackTypes.USER) {
                _this.users = results.members;
                return callback(null, results.members);
            } else {
                _this[slackType] = results[slackType];
                return callback(null, results[slackType]);
            }
        }
        callback(new Error(errors.slack_api_error + ': ' + results), null);
    });
};

/**
 * Handle slack RTM event message
 * @param {object} message The Slack RTM JSON event message
 * @access private
 */
SmartSlack.prototype._onRtmEvent = function (message) {

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
 * @access private
 */
SmartSlack.prototype._ping = function () {
    var results;
    var ping = { type: "ping" };
    ping.id = this._messageId;
    ping.time = _.now();
    results = JSON.stringify(ping);
    this._webSocket.send(results);
    this._messageId += 1;
};

/**
 * Reconnects to Slack RTM, called from canResolve()
 * @access private
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
    if (channel && text) {
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
    } else {
        this.log.error(errors.missing_required_arg);
        return new Error(errors.missing_required_arg);
    }
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

    callback = (typeof callback === 'function') ? callback : function () { };

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
module.exports = SmartSlack