'use strict';

var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');
var cache = require('../cache');
var users = require('./users');
var common = require('../common');

/**
 * Delete a channel message
 * @param timestamp {string} The message timestamp
 * @param {string} channel The channel id
 * @param {function} callback(err,result)
 */
function deleteMessage(timestamp, channel, callback) {

    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(timestamp) && !_.isString(channel)) {
        return callback(new Error(errors.missing_required_arg), null);
    }
    api.post('chat.delete', {ts: timestamp, channel: channel}, function (err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}
/**
 * Post API message to a entity by email, username, or channel
 * @param entity {string} entity The entity
 * @param text {string} message The message text
 * @param {object} options Optional message options
 * @param {function} callback(err,result)
 */
function postDirectMessage(entity, text, options, callback) {
    var channel;

    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (_.isFunction(options)) {
        callback = options;
        options = null;
    }

    if (!_.isString(entity) && !_.isString(text)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    if (entity.match(/^D0[0-9A-Z]{7}/)) {
        channel = entity;
    }

    if (!channel) {
        users.getImChannel(entity, function (err, result) {
            if (err) {
                return callback(err);
            }
            channel = result;
        });
    }

    text = common.escape(text);

    options = _.extend({
        channel: channel,
        text: text,
        username: cache.data.user.name,
        as_user: true
    }, options || {});

    api.post('chat.postMessage', options, function (err, result) {
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
 * @param {object} options Optional message options
 * @param {function} callback(err,result)
 */
function postMessage(channel, text, options, callback) {
    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (_.isFunction(options)) {
        callback = options;
        options = null;
    }

    if (!_.isString(channel) && !_.isString(text)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    // Assume channel name and prefix with # if missing
    if (!channel.match(/^([CG]0)/)) {
        if (channel[0] !== '#') {
            channel = '#' + channel;
        }
    }

    text = common.escape(text);

    options = _.extend({
        channel: channel,
        text: text,
        as_user: true
    }, options || {});

    api.post('chat.postMessage', options, function (err, result) {
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
 * @param {function} callback(err,result)
 */
function updateMessage(timestamp, channel, text, callback) {

    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(timestamp) && !_.isString(channel) && !_.isString(text)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    text = _.escape(text);

    api.post('chat.update', {ts: timestamp, channel: channel, text: text}, function (err, result) {
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
