var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');

/**
* Add a reaction to a message
* @param {string} emojiName  The emoji icon i.e. thumbsup
* @param {string} channel The channel id
* @param {string} timestamp The message timestamp
* @callback {function} callback(err,result)
*/
function add(emojiName, channel, timestamp, callback) {
    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(emojiName) && !_.isString(channel) && !_.isString(timestamp)) {
        return callback(new Error(errors.missing_required_arg), null);
    }
    api.post('reactions.add', { name: emojiName, channel: channel, timestamp: timestamp }, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};
/**
* Get reactions for a message
* @param {string} channel The channel id
* @param {string} timestamp The message timestamp
* @callback {function} callback(err,result)
*/
function getReactions(channel, timestamp, callback) {
    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }

    if (!_.isString(channel)) {
        return callback(new Error(errors.missing_required_arg), null);
    }
    api.post('reactions.get', { channel: channel, timestamp: timestamp }, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};
/**
* Get a list of reactions for the user
* @param {string} user  The user id
* @callback {function} callback(err,result)
*/
function getList(user, callback) {
    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }

    if (!_.isString(user)) {
        return callback(new Error(errors.missing_required_arg), null);
    }
    api.post('reactions.list', { user: user }, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};
/**
* Add a reaction to a message
* @param {string} channel The channel id
* @param {string} timestamp The message timestamp
* @callback {function} callback(err,result)
*/
function remove(channel, timestamp, callback) {

    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(channel) && !_.isString(timestamp)) {
        return callback(new Error(errors.missing_required_arg), null);
    }
    api.post('reactions.remove', { channel: channel, timestamp: timestamp }, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};

module.exports = {
    add: add,
    getReactions: getReactions,
    getList: getList,
    remove: remove
}
