var api = require('./api');
var errors = require('../errors');

module.exports = {

    /**
    * Add a reaction to a message
    * @param {string} emojiName  The emoji icon i.e. thumbsup
    * @param {string} channel The channel id
    * @param {string} timestamp The message timestamp
    * @param {function} callback(err,results)
    */
    add: function (emojiName, channel, timestamp, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(emojiName) && !_.isString(channel) && !_.isString(timestamp)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('reactions.add', { name: emojiName, channel: channel, timestamp: timestamp }, function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
    get: function (channel, callback) {
        api.post('reactions.get', function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
    list: function (channel, callback) {
        api.post('reactions.list', function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
    remove: function (channel, callback) {
        api.post('reactions.remove', function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    }
}