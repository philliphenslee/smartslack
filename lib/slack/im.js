var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');

module.exports = {

    close: function (channel, callback) {
        api.post('im.close', function (err, result) {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    },

    history: function (channel, callback) {
        api.post('im.history', function (err, result) {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    },

    list: function (channel, callback) {
        api.post('im.list', function (err, result) {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    },

    mark: function (channel, callback) {
        api.post('im.mark', function (err, result) {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    },

    open:
    /**
    * Open a direct message (im) channel
    * @param {string} userId The user's id
    * @param {function} callback(err,result)
    */
    function (userId, callback) {
        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(userId)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('im.open', { user: userId }, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (!result.ok) {
                return callback(result);
            }
            callback(null,result);
        });
    }
}