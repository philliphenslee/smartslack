var _ = require('lodash');
var bole = require('bole');

var api = require('./api');
var cache = require('../cache');
var errors = require('../errors');
var slackTypes = require('./types');

var log = bole('slack.channels');

module.exports = {
    /**
    * Gets the last message posted to a channel
    * @param {string} channel The channel id
    * @param {function} callback(err,result)
    */
    getChannel: function (match, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(match)) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        cache.search(slackTypes.CHANNEL, match, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    /**
    * Gets the last message posted to a channel
    * @param {string} channel The channel id
    * @param {function} callback(err,result)
    */
    getLastChannelMessage: function (channel, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(channel)) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        if (!channel.match(/^(C0)/)) {
            return callback(new Error(errors.invalid_channel_id));
        }

        api.post('channels.history', { channel: channel, count: 1 }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });

    },
    /**
    * Gets the last message posted to a channel
    * @param {string} channel The channel id
    * @param {function} callback(err,result)
    */
    getInfo: function (channel, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(channel)) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        if (!channel.match(/^(C0)/)) {
            return callback(new Error(errors.invalid_channel_id));
        }

        api.post('channels.info', { channel: channel }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    /**
    * Gets channel list from API, excluding archived channels
    * @param {function} callback(err,result)
    */
    getList: function (callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }
        api.post('channels.list', { exclude_archived: "1" }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    /**
    * Gets the last message posted to a channel
    * @param {string} channel The channel id
    * @param {function} callback(err,result)
    */
    mark: function (channel, timestamp, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(channel) && !_.isString(timestamp)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('channels.mark', { channel: channel, timestamp: timestamp }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    /**
    * Gets the last message posted to a channel
    * @param {string} channel The channel id
    * @param {function} callback(err,result)
    */
    setPurpose: function (channel, purpose, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(channel) && !_.isString(purpose)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('channels.setPurpose', { channel: channel, purpose: purpose }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    /**
    * Gets the last message posted to a channel
    * @param {string} channel The channel id
    * @param {function} callback(err,result)
    */
    setTopic: function (channel, topic, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(channel) && !_.isString(topic)) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        api.post('channels.setTopic', { channel: channel, topic: topic }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    }
}