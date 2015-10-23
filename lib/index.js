/**
 * SmartSlack module
 * @description SmartSlack is a node.js module for Slack's Real Time Messaging API
 * @copyright Phillip J. Henslee II 2015 <ph2@ph2.us>
 * @module smartslack
 */
'use strict';

var EventEmitter = require('events').EventEmitter;
var dns = require('dns');
var https = require('https');
var util = require('util');

var _ = require('lodash');
var bole = require('bole');
var WebSocket = require('ws');

var errors = require('./errors');
var logging = require('./logging')(/** no-opts */);
var Cache = require('./cache');
var slack = require('./slack/');

/**
 * Slack RTM API Client
 * @constructor
 * @param {object} options required configuration options
 */
function SmartSlack(options) {

    // Must provide a valid options argument
    if (!_.isObject(options)) {
        throw new Error(errors.missing_options_arg);
    }

    var accessToken = options.token;

    // Need a valid Slack token to authenticate
    if (!accessToken || typeof accessToken !== 'string' || !accessToken.match(/^([a-z]{4})-([0-9]{11})-([0-9a-zA-Z]{24})$/)) {
        throw new Error(errors.invalid_token);
    }

    // Save the cache data
    this.cache = Cache;
    this.cache.defaults(options);
    this.cache.add({hostname: 'slack.com'});

    // API references
    this.channels = slack.channels;
    this.chat = slack.chat;
    this.emoji = slack.emoji;
    this.groups = slack.groups;
    this.im = slack.im;
    this.reactions = slack.reactions;
    this.test = slack.test;
    this.users = slack.users;

    // Logger
    this.log = bole('SmartSlack');

    this._autoReconnect = options.autoReconnect || true;
    this._lastPong = null;
    this._messageId = 0;
    this._socketUrl = null;
    this._webSocket = null;
}

util.inherits(SmartSlack, EventEmitter);

/**
 * Start the RTM session
 */
SmartSlack.prototype.start = function () {
    var _this = this;
    slack.rtm.start(function (err, result) {

        if (err) {
            throw err;
        }

        _this.log.info('Slack RTM session started...');
        _this.log.debug(result);

        _this._startTime = _.now();

        // Cache the Slack session data
        _this.cache.data.user = result.self;
        _this.cache.data.users = result.users;
        _this.cache.data.channels = result.channels;
        _this.cache.data.groups = result.groups;
        _this.cache.data.ims = result.ims;
        _this.cache.data.team = result.team;

        // Valid for thirty seconds...
        _this._socketUrl = result.url;

        // Connect web socket
        _this._connectSocket();
    });
};

/**
 * Post a direct message via the API
 * @description Convenience function so you can call
 * client.postDirectMessage instead of client.chat.postDirectMessage;
 * @param {string} user The user id, name, or email address
 * @param {string} text The message text
 * @param {object} args Additional argument options for the messsage
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.postDirectMessage = function (user, text, args, callback) {
    if (typeof args === 'function') {
        callback = args;
        args = null;
    }
    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(user) && !_.isString(text)) {
        return callback(new Error(errors.missing_required_arg));
    }
    return slack.chat.postDirectMessage(user, text, args, callback);

};


/**
 * Post a message via the API
 * @description Convenience function so you can call
 * client.postMessage instead of client.chat.postMessage;
 * @param {string} channel The channel name or id
 * @param {string} text The message text
 * @param {object} args Additional argument options for the messsage
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.postMessage = function (channel, text, args, callback) {
    if (typeof args === 'function') {
        callback = args;
        args = null;
    }
    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(channel) && !_.isString(text)) {
        return callback(new Error(errors.missing_required_arg));
    }
    return slack.chat.postMessage(channel, text, args, callback);
};

/**
 * Send RTM message to channel
 * @param {string} channel The channel name (i.e. general)
 * @param {string} text The message text
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.sendToChannel = function (channel, text, callback) {
    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(channel) && !_.isString(text)) {
        return callback(new Error(errors.missing_required_arg));
    }
    return this._sendToType(slack.types.CHANNEL, channel, text, callback);
};

/**
 * Send RTM message to group
 * @param {string} group The private group name
 * @param {string} text The message text
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.sendToGroup = function (group, text, callback) {
    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(group) && !_.isString(text)) {
        return callback(new Error(errors.missing_required_arg));
    }
    return this._sendToType(slack.types.GROUP, group, text, callback);
};

/**
 * Send RTM message to user
 * @param {string} username The username
 * @param {string} text The message text
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.sendToUser = function (username, text, callback) {
    callback = (_.isFunction(callback)) ? callback : function () {
    };

    if (!_.isString(username) && !_.isString(text)) {
        return callback(new Error(errors.missing_required_arg));
    }
    return this._sendToType(slack.types.USER, username, text, callback);
};

/**
 * Get the uptime
 * @return {string} formatted uptime in minutes, hours, or days
 */
SmartSlack.prototype.getUptime = function () {
    var uptime = '';
    var seconds = ((_.now() - this._startTime) / 1000.0);
    var minutes = (seconds / 60);
    var hours = (minutes / 60);
    var days = (hours / 24);

    if (seconds < 3600000) {
        uptime = minutes.toFixed(2) + ' minutes';
        return uptime;
    }
    if (hours < 24) {
        uptime = hours.toFixed(2) + ' hours';
        return uptime;
    } else {
        uptime = days.toFixed(2) + ' days';
        return uptime;
    }
};

/**
 * Used for reconnection, attempts to resolve
 * slack.com calls login() if resolved
 * @param {function} callback(err,result)
 * @access private
 */
SmartSlack.prototype._canResolve = function (callback) {

    var _this = this;

    callback = (_.isFunction(callback)) ? callback : _.noop;

    this.log.debug('Attempting to resolve ' + _this.cache.data.hostname);

    dns.resolve4(_this.cache.data.hostname, function (err, addresses) {

        if (err) {
            _this.log.error('DNS resolution failed. Error Code: ' + err.code);
            return callback(false);
        }

        _this.log.debug('Resolved ' + _this.cache.data.hostname + ' (' + addresses[0] + ')');

        if (_this._reconnecting) {
            clearInterval(_this._reconnecting);
            _this.start();
        }
        return callback(null, true);
    });
};

/**
 * Connect WebSocket
 * @access private
 */
SmartSlack.prototype._connectSocket = function () {

    var _this = this;
    var output;


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
            _this._onRtmEvent(output);
        } catch (error) {
            _this.emit('error', error);
        }
    });
};

/**
 * Handle slack RTM event message
 * @param {object} message The Slack RTM JSON event message
 * @access private
 */
SmartSlack.prototype._onRtmEvent = function (message) {

    var _this = this;
    var uptime;

    this.emit('eventmessage', message);
    this.log.debug(message);

    switch (message.type) {

        case 'hello':
            // Received the hello event message
            this.log.info('Slack hello received, socket connected...');
            this.emit('connected');
            this._lastPong = _.now();

            // Start pings every five seconds
            this._pingInterval = setInterval(function () {
                _this._ping();
            }, 5000);
            break;

        case 'message':
            this.emit('message', message);

            uptime = this.getUptime();
            if (message.text === 'naomi uptime') {
                this._send(message.channel, uptime);
            }
            break;

        case 'pong':
            this._lastPong = _.now();
            this.log.debug('Last pong latency: ' + (this._lastPong - message.time) + 'ms');
            this.log.debug('Uptime: ' + this.getUptime());
            break;

        case 'presence_change':
            _.find(this.cache.data.users, {id: message.user}).presence = message.presence;
            this.log.info('User presence changed, updating user presence...');
            break;

        case 'team_join event':
            this.log.info('New member joined the team, updating user list...');
            this.users.getList(function (err, result) {
                if (err) {
                    _this.log.error(err);
                } else {
                    _this.cache.data.users = result.members;
                }
            });
            break;

        case 'user_change':
            this.log.info('User information has changed, updating user list...');
            this.users.getList(function (err, result) {
                if (err) {
                    _this.log.error(err);
                } else {
                    _this.cache.data.users = result.members;
                }
            });
            break;
    }
};

/**
 * Sends ping message over the RTM
 * @access private
 */
SmartSlack.prototype._ping = function () {
    var _this = this;
    var result;
    var ping = {type: "ping"};
    ping.id = _this._messageId;
    ping.time = _.now();
    result = JSON.stringify(ping);
    _this._webSocket.send(result);
    _this._messageId += 1;
};

/**
 * Reconnects to Slack RTM, called from canResolve()
 * @access private
 */
SmartSlack.prototype._reconnect = function () {

    var _this = this;

    // Connection lost stop pinging and reset
    clearInterval(_this._pingInterval);
    _this._lastPong = null;
    _this._startTime = null;

    //  Attempt to resolve slack.com and call login when available
    _this._reconnecting = setInterval(function () {
        _this._canResolve();
    }, 5000);
    _this.log.info('Connection lost, waiting to reconnect...');
};

/**
 * Sends a message via the RTM socket
 * @param {string} channel The channel id
 * @param {string} text The message text
 * @access private
 */
SmartSlack.prototype._send = function (channel, text) {
    var _this = this;
    var message;
    var data;

    text = _.escape(text);

    message = {
        id: this._messageId,
        type: 'message',
        channel: channel,
        text: text
    };

    try {
        data = JSON.stringify(message);
    } catch (error) {
        this.log.error(error);
    }

    _this._webSocket.send(data);
    _this._messageId += 1;

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

    callback = (_.isFunction(callback)) ? callback : function () {
    };

    switch (slackType) {
        case slack.types.CHANNEL:
            this.channels.getChannel(typeName, function (err, result) {
                if (!err) {
                    entityId = result.id;
                }
            });
            break;
        case slack.types.GROUP:
            this.groups.getGroup(typeName, function (err, result) {
                if (!err) {
                    entityId = result.id;
                }
            });
            break;
        case slack.types.USER:
            this.users.getImChannel(typeName, function (err, result) {
                if (!err) {
                    entityId = result;
                }
            });
            break;
        default:
            entityId = null;

    }

    if (entityId) {
        return this._send(entityId, text);
    }
    callback(new TypeError(errors.invalid_entity_type));
};

module.exports = SmartSlack;