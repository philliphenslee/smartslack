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

        callback = (_.isFunction(callback)) ? callback : function () { };

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
    get: function (channel, callback) {
        api.post('reactions.get', function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    list: function (channel, callback) {
        api.post('reactions.list', function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    remove: function (channel, callback) {
        api.post('reactions.remove', function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    }
}