var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');

module.exports = {

    /**
    * Add a reaction to a message
    * @param {string} emojiName  The emoji icon i.e. thumbsup
    * @param {string} channel The channel id
    * @param {string} timestamp The message timestamp
    * @param {function} callback(err,result)
    */
    add: function (emojiName, channel, timestamp, callback) {
        callback = (_.isFunction(callback)) ? callback : _.noop;

        if (!_.isString(emojiName) && !_.isString(channel) && !_.isString(timestamp)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('reactions.add', { name: emojiName, channel: channel, timestamp: timestamp }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    /**
    * Add a reaction to a message
    * @param {string} emojiName  The emoji icon i.e. thumbsup
    * @param {string} channel The channel id
    * @param {string} timestamp The message timestamp
    * @param {function} callback(err,result)
    */
    getReactions: function (channel, timestamp, callback) {
        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(channel)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('reactions.get',{channel: channel, timestamp: timestamp}, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    /**
    * Add a reaction to a message
    * @param {string} emojiName  The emoji icon i.e. thumbsup
    * @param {string} channel The channel id
    * @param {string} timestamp The message timestamp
    * @param {function} callback(err,result)
    */
    getList: function (user, callback) {
        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(user)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('reactions.list',{user: user}, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    /**
    * Add a reaction to a message
    * @param {string} emojiName  The emoji icon i.e. thumbsup
    * @param {string} channel The channel id
    * @param {string} timestamp The message timestamp
    * @param {function} callback(err,result)
    */
    remove: function (channel, timestamp, callback) {

        callback = (_.isFunction(callback)) ? callback : _.noop;

        if (!_.isString(channel) && !_.isString(timestamp)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('reactions.remove', { channel: channel, timestamp: timestamp }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    }
}