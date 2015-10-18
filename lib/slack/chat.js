var _ = require('lodash');
var api = require('./api');
var errors = require('./errors');

// Public
module.exports = {

    delete: function (channel, callback) {
        api.post('chat.delete', function (err, results) {
            return callback(null, results);
        });
    },

    postMessage:
    /**
    * Post API message to channel or group
    * @param channel {string} channel Channel name or id
    * @param text {string} message Text message
    * @param {object} params Optional message options
    * @param {function} callback(err,results)
    */
    function (channel, text, params, callback) {
        callback = (typeof callback === 'function') ? callback : function () { };

        if (channel && typeof channel === 'string' && text && typeof text === 'string') {

            if (typeof params === 'function') {
                callback = params;
                params = null;
            }

            params = _.extend({
                channel: channel,
                text: text,
                username: global.session.user.name,
                as_user: true
            }, params || {});

            api.post('chat.postMessage', params, function (err, results) {
                if (err) {
                    return callback(err, null);
                }
                return callback(null, results);

            });
        } else {
            callback(new Error(errors.missing_required_arg), null);
        }
    },

    update: function (channel, callback) {
        api.post('chat.update', function (err, results) {
            return callback(null, results);
        });
    }
}