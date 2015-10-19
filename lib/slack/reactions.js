var api = require('./api');
var errors = require('../errors');

module.exports = {

    add:
    /**
    * Add a reaction to a message
    * @param {string} emojiName  The emoji icon i.e. thumbsup
    * @param {string} channel The channel id
    * @param {string} timestamp The message timestamp
    * @param {function} callback(err,results)
    */
    function (emojiName, channel, timestamp, callback) {

        callback = (typeof callback === 'function') ? callback : function () { };

        if (emojiName && channel && timestamp && typeof emojiName === 'string'
            && typeof channel === 'string' && typeof timestamp === 'string') {

            api.post('reactions.add', { name: emojiName, channel: channel, timestamp: timestamp }, function (results) {
                return callback(null, results);
            });
        } else {
            callback(new Error(errors.missing_required_arg), null);
        }
    },
    get:

    function (channel, callback) {
        api.post('reactions.get', function (err, results) {
            return callback(null, results);
        });
    },
    list: function (channel, callback) {
        api.post('reactions.list', function (err, results) {
            return callback(null, results);
        });
    },
    remove: function (channel, callback) {
        api.post('reactions.remove', function (err, results) {
            return callback(null, results);
        });
    }
}