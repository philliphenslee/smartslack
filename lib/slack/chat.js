var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');
var cache = require('../cache');
var users = require('./users');

module.exports = {

    /**
    * Delete a channel message
    * @param timestamp {string} The message timestamp
    * @param {string} channel The channel id
    * @param {function} callback(err,result)
    */
    deleteMessage: function (timestamp, channel, callback) {

        callback = (_.isFunction(callback)) ? callback : _.noop;

        if (!_.isString(timestamp) && !_.isString(channel)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('chat.delete', { ts: timestamp, channel: channel }, function (err, result) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, result);
        });
    },
    /**
    * Post API message to a user by username
    * @param user {string} user Username or user id
    * @param text {string} message The message text
    * @param params {object} message options
    * @param {function} callback(err,result)
    */
    postDirectMessage: function (user, text, params, callback) {
        var channel;

        callback = (_.isFunction(callback)) ? callback : _.noop;

        if (typeof params === 'function') {
            callback = params;
            params = null;
        }

        if (!_.isString(user) && !_.isString(text)) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        users.getImChannel(user, function (err, result) {
            if (err) {
                return callback(err);
            }
            channel = result
        });

        params = _.extend({
            channel: channel,
            text: text,
            username: cache.data.user.name,
            as_user: true
        }, params || {});

        api.post('chat.postMessage', params, function (err, result) {
            if (err) {
                return callback(err);
            }
            return callback(null, result);
        });

    },
    /**
    * Post API message to channel or group
    * @param channel {string} channel Channel name or id
    * @param text {string} message Text message
    * @param {object} params Optional message options
    * @param {function} callback(err,result)
    */
    postMessage: function (channel, text, params, callback) {

        callback = (_.isFunction(callback)) ? callback : _.noop;

        if (typeof params === 'function') {
            callback = params;
            params = null;
        }

        if (!_.isString(channel) && !_.isString(text)) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        params = _.extend({
            channel: channel,
            text: text,
            username: cache.data.user.name,
            as_user: true
        }, params || {});

        api.post('chat.postMessage', params, function (err, result) {
            if (err) {
                return callback(err);
            }
            return callback(null, result);

        });

    },
    /**
    * Updates a chat message
    * @param {string} timestamp The message timestamp
    * @param {string} channel The channel id
    * @param {string} text The new message text
    * @param {function} callback(err,result)
    */
    updateMessage: function (timestamp, channel, text, callback) {

        callback = (_.isFunction(callback)) ? callback : _.noop;

        if (!_.isString(timestamp) && !_.isString(channel) && _.isString(text)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('chat.update', { ts: timestamp, channel: channel, text: text }, function (err, result) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, result);
        });
    }
}