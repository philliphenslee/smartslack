var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');

module.exports = {

    close: function (channel, callback) {
        callback = (_.isFunction(callback)) ? callback : _.noop;

        if (!_.isString(channel)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('im.close', function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },

    getHistory: function (channel, callback) {
        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(channel)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('im.history', {channel: channel}, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },

    getList: function (callback) {
        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        api.post('im.list', function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },

    mark: function (channel, callback) {
        callback = (_.isFunction(callback)) ? callback : _.noop;

        if (!_.isString(channel)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('im.mark', function (err, result) {
            if (err) {
                return callback(err);
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
            callback(null,result);
        });
    }
}