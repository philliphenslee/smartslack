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
var WebSocket = require('ws');

var Slack = require('./slack/index.js');
var logging = require('./logging')(/** no-opts */);
var errors = require('./errors');
var Cache = require('./cache');
var slackTypes = require('./slack/types');

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

    // Save the cache data
    this.cache = Cache;
    this.cache.defaults(options);
    this.cache.defaults({ hostname: 'slack.com' });

    this.slack = Slack;
    this.log = bole('SmartSlack');

    this._connected = false;
    this._autoReconnect = options.autoReconnect || true;
    this._lastPong = null;
    this._messageId = 0;
    this._socketUrl = null;
    this._webSocket = null;
};


util.inherits(SmartSlack, EventEmitter);

/**
 * Login to Slack
 */
SmartSlack.prototype.login = function () {
    var _this = this;
    this.slack.rtm.start(function (err, results) {

        if (!err) {
            if (!results.ok) {
                _this.log.error(results);
                _this.emit('error', results.error);
            } else {

                _this.log.info('Slack client authenticated...');
                _this.log.debug(results);

                // Cache the Slack session data
                _this.cache.data.user = results.self;
                _this.cache.data.users = results.users;
                _this.cache.data.channels = results.channels;
                _this.cache.data.groups = results.groups;
                _this.cache.data.ims = results.ims;
                _this.cache.data.team = results.team;

                // Valid for thirty seconds...
                _this._socketUrl = results.url;

                // Connect web socket
                _this._connect();
            }
        }
    });
};

/**
 * Send RTM message to channel
 * @param {string} channel The channel name (i.e. general)
 * @param {string} text The message text
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.sendToChannel = function (channel, text, callback) {

    if (arguments.length === 0) {
        throw new Error(errors.missing_required_arg);
    }

    callback = (_.isFunction(callback)) ? callback : _.noop();

    if (_.isFunction(text)) {
        callback = text;
        text = null;
    }

    if (_.isString(channel) && _.isString(text)) {
        return this._sendToType(slackTypes.CHANNEL, channel, text, callback);
    }
    this.log.debug(errors.missing_required_arg);
    callback(new Error(errors.missing_required_arg));
};

/**
 * Send RTM message to group
 * @param {string} group The private group name
 * @param {string} text The message text
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.sendToGroup = function (group, text, callback) {

    if (arguments.length === 0) {
        throw new Error(errors.missing_required_arg);
    }

    callback = (_.isFunction(callback)) ? callback : _.noop();

    if (_.isFunction(text)) {
        callback = text;
        text = null;
    }

    if (_.isString(group) && _.isString(text)) {
        return this._sendToType(slackTypes.CHANNEL, group, text, callback);
    }
    this.log.debug(errors.missing_required_arg);
    callback(new Error(errors.missing_required_arg));
};

/**
 * Send RTM message to user
 * @param {string} user The username
 * @param {string} text The message text
 * @param {function} callback(err,result)
 */
SmartSlack.prototype.sendToUser = function (username, text, callback) {

    if (arguments.length === 0) {
        throw new Error(errors.missing_required_arg);
    }

    callback = (_.isFunction(callback)) ? callback : _.noop();

    if (_.isFunction(text)) {
        callback = text;
        text = null;
    }

    if (_.isString(username) && _.isString(text)) {
        return this._sendToType(slackTypes.USER, username, text, callback);
    }
    this.log.debug(errors.missing_required_arg);
    callback(new Error(errors.missing_required_arg));
};


/**
 * Used for reconnection, attempts to resolve
 * slack.com calls login() if resolved
 * @param {function} callback(err,results)
 * @access private
 */
SmartSlack.prototype._canResolve = function (callback) {

    var _this = this;

    callback = (typeof callback === 'function') ? callback : function () { };

    this.log.debug('Attempting to resolve ' + _this.cache.data.hostname);

    dns.resolve4(_this.cache.data.hostname, function (err, addresses) {

        if (!err) {
            _this.log.debug('Resolved ' + _this.cache.data.hostname + ' (' + addresses[0] + ')');

            if (_this._reconnecting) {
                clearInterval(_this._reconnecting);
                _this.login();
            }
            return callback(null, true);

        } else {

            _this.log.error('DNS resolution failed. Error Code: ' + err.code);
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
 * Handle slack RTM event message
 * @param {object} message The Slack RTM JSON event message
 * @access private
 */
SmartSlack.prototype._onRtmEvent = function (message) {

    var _this = this;
    if (_.isNull(message)) {
        return;
    }

    this.emit('eventmessage', message);
    this.log.debug(message);

    switch (message.type) {

        case 'hello':
            // Received the hello event message
            this.log.info('Slack hello received, socket connected...');
            this._connected = true;
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
            this.log.debug('Last pong latency: ' + (this._lastPong - message.time) + 'ms');
            break;

        case 'presence_change':
            _.find(this.cache.data.users, { id: message.user }).presence = message.presence;
            this.log.info('User presence changed, updating user presence...');
            break;

        case 'team_join event':
            this.log.info('New member joined the team, updating user list...');
            this.slack.users.getList(function (err, results) {
                if (err) {
                    console.error(err);
                } else {
                    console.debug(results);
                }
            });
            break;

        case 'user_change':
            this.log.info('User information has changed, updating user list...');
            this.slack.users.getList(function (err, results) {
                if (err) {
                    console.error(err);
                } else {
                    console.debug(results);
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
    this._connected = false;
    this._lastPong = null;

    //  Attempt to resolve slack.com and call login when available
    this._reconnecting = setInterval(function () { _this._canResolve(); }, 5000);
    this.log.debug('Connection lost, waiting to reconnect...');
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
    if (_.isString(channel) && _.isString(text)) {
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
    }
    this.log.error(errors.missing_required_arg);
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

    callback = (_.isFunction(callback)) ? callback : _.noop();

    switch (slackType) {
        case slackTypes.CHANNEL:
            this.slack.channels.get(typeName, function (err, result) {
                if (!err) {
                    entityId = result.id;
                }
            });
            break;
        case slackTypes.GROUP:
            this.slack.groups.get(typeName, function (err, result) {
                if (!err) {
                    entityId = result.id;
                }
            });
            break;
        case slackTypes.USER:
            this.slack.users.getImChannel(typeName, function (err, result) {
                if (!err) {
                    entityId = result;
                }
            });
            break;
        default:
            entityId = null;
            return callback(new TypeError(errors.invalid_slack_type));
    }

    if (entityId) {
        return this._send(entityId, text);
    }
    callback(new Error(errors.entity_not_found));

};

module.exports = SmartSlack