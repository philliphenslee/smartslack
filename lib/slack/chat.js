var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');
var cache = require('../cache');
var users = require('./users');

/**
* Delete a channel message
* @param timestamp {string} The message timestamp
* @param {string} channel The channel id
* @callback {function} callback(err,result)
*/
function deleteMessage(timestamp, channel, callback) {

    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(timestamp) && !_.isString(channel)) {
        return callback(new Error(errors.missing_required_arg), null);
    }
    api.post('chat.delete', { ts: timestamp, channel: channel }, function (err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}
/**
* Post API message to a user by username
* @param user {string} user The user id
* @param text {string} message The message text
* @param {object} args Optional message options
* @callback {function} callback(err,result)
*/
function postDirectMessage(user, text, args, callback) {
    var channel;

    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (typeof args === 'function') {
        callback = args;
        args = null;
    }

    if (!_.isString(user) && !_.isString(text)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    users.getImChannel(user, function (err, result) {
        if (err) {
            return callback(err);
        }
        channel = result
    });

    text = _.escape(text);

    args = _.extend({
        channel: channel,
        text: text,
        username: cache.data.user.name,
        as_user: true
    }, args || {});

    api.post('chat.postMessage', args, function (err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });

}
/**
* Post API message to channel or group
* @param channel {string} channel Channel name or id
* @param text {string} message Text message
* @param {object} args Optional message options
* @callback {function} callback(err,result)
*/
function postMessage(channel, text, args, callback) {
    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (typeof args === 'function') {
        callback = args;
        args = null;
    }

    if (!_.isString(channel) && !_.isString(text)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    // Assume channel name and prefix with #
    if (!channel.match(/^([CG]0)/)) {
        channel = '#' + channel;
    }

    text = _.escape(text);

    args = _.extend({
        channel: channel,
        text: text,
        as_user: true
    }, args || {});

    api.post('chat.postMessage', args, function (err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}
/**
* Updates a chat message
* @param {string} timestamp The message timestamp
* @param {string} channel The channel id
* @param {string} text The new message text
* @callback {function} callback(err,result)
*/
function updateMessage(timestamp, channel, text, callback) {

    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(timestamp) && !_.isString(channel) && !_.isString(text)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    text = _.escape(text);

    api.post('chat.update', { ts: timestamp, channel: channel, text: text }, function (err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}
module.exports = {
    deleteMessage: deleteMessage,
    postDirectMessage: postDirectMessage,
    postMessage: postMessage,
    updateMessage: updateMessage
};
