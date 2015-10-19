var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');
var slackTypes = require('./types');

module.exports = {

    get: function (match, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(match)) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        api.getEntity(slackTypes.CHANNEL, match, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },
    /**
    * Gets the last message posted to a channel
    * @param {string} channel The channel id
    * @param {function} callback(err,results)
    */
    getLastChannelMessage: function (channel, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(channel)) {
            api.post('channels.history', { channel: channel, count: 1 }, function (results) {
                return callback(null, results);
            });
        } else {
            callback(new Error(errors.missing_required_arg), null);
        }
    },

    info: function (channel, callback) {
        api.post('channels.info', { channel: channel }, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },
    /**
    * Gets channel list from API, excluding archived channels
    * @param {function} callback(err,results)
    */
    list: function (callback) {
        api.post('channels.list', { exclude_archived: "1" }, function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    mark: function (channel, callback) {
        api.post('channels.mark', function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    setPurpose: function (channel, callback) {
        api.post('channels.setPurpose', function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    setTopic: function (channel, callback) {
        api.post('channels.setTopic', function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    }
}