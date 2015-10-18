var _ = require('lodash');

var api = require('./api');
var errors = require('./errors');
var session = require('./session');
var users = require('./users');


// Public
module.exports = {

    delete: function (channel, callback) {
        api.post('chat.delete', function (err, results) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, results);
        });
    },

    postDirectMessage:
    /**
    * Post API message to a user by username
    * @param user {string} user Username or user id
    * @param text {string} message The message text
    * @param params {object} message options
    * @param {function} callback(err,results)
    */
    function (user, text, params, callback) {
        var channel;

        callback = (typeof callback === 'function') ? callback : function () { };

        if (user && typeof user === 'string' && text && typeof text === 'string') {

            if (typeof params === 'function') {
                callback = params;
                params = null;
            }

            users.getImChannel(user, function (err, results) {
                if (err) {
                    return callback(err, null);
                }
                channel = results
            });

            params = _.extend({
                channel: channel,
                text: text,
                username: this.user.name,
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
                username: session.user.name;
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
            if (err) {
                return callback(err, null);
            }
            return callback(null, results);
        });
    }
}