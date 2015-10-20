var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');

module.exports = {

    close: function (channel, callback) {
        api.post('im.close', function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    history: function (channel, callback) {
        api.post('im.history', function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    list: function (channel, callback) {
        api.post('im.list', function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    mark: function (channel, callback) {
        api.post('im.mark', function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    open:
    /**
    * Open a direct message (im) channel
    * @param {string} userId The user's id
    * @param {function} callback(err,results)
    */
    function (userId, callback) {
        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(userId)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('im.open', { user: userId }, function (err, results) {
            if (err) {
                return callback(err);
            }
            if (!results.ok) {
                return callback(results);
            }
            callback(null,results);
        });
    }
}