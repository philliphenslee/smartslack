'use strict';

var _ = require('lodash');

var api = require('./api');
var cache = require('../cache');
var errors = require('../errors');
var im = require('./im');
var slackTypes = require('./types');

/**
 * Gets a im channel id for a user by name
 * @param {string} user The Slack username
 * @param {function} callback(err,result)
 */
function getImChannel(user, callback) {
    var imChannel;

    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }

    if (!_.isString(user)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    // If a user id was passed
    if (user.match(/^([U]0)/)) {

        // Does a direct message channel already exist
        imChannel = _.find(cache.data.ims, {user: user});

        if (imChannel) {
            return callback(null, imChannel.id);
        }

        // Open the direct message channel
        im.open(user, function (err, result) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, result.channel.id);
        });

    } else { // Get the user id

        // Search for the user and get the id
        cache.search(slackTypes.USER, user, function (err, result) {

            if (err) {
                return callback(err, null);
            }
            imChannel = _.find(cache.data.ims, {user: result.id});

            if (imChannel) {
                return callback(null, imChannel.id);
            }
            im.open(result.id, function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                callback(null, result.channel.id);
            });
        });
    }
}
/**
 * Gets the list of users
 * @param {boolean} isIncludeArchived Option to include archived users
 * @param {function} callback(err,result)
 */
function getList(isIncludeArchived, callback) {

    if (_.isFunction(isIncludeArchived)) {
        callback = isIncludeArchived;
        isIncludeArchived = null;
    }

    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }

    var params = {exclude_archived: '1'};

    if (isIncludeArchived) {
        params.exclude_archived = '0';
    }

    api.post('users.list', params, function (err, result) {
        if (err) {
            return callback(err);
        }
        cache.data.users = result.members;
        callback(null, result);
    });
}
/**
 * Get the info for a user
 * @param {string} user The user id
 * @param {function} callback(err,result)
 */
function getInfo(user, callback) {

    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }

    if (!_.isString(user)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    api.post('users.info', function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
}
/**
 * Gets the users presence
 * @param {string} user id
 * @param {function} callback(err,result)
 */
function getPresence(user, callback) {

    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }

    if (!_.isString(user)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    api.post('users.getPresence', {user: user}, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
}
/**
 * Gets a user by name or id
 * @param {string} match the channel id ot name
 * @param {function} callback(err,result)
 */
function getUser(match, callback) {

    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }

    if (!_.isString(match)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    cache.search(slackTypes.USER, match, function (err, result) {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
}
/**
 * Sets the presence of the authenticated user
 * @param {string} presence either auto || away
 * @param {function} callback(err,result)
 */
function setPresence(presence, callback) {

    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(presence)) {
        return callback(new Error(errors.missing_required_arg));
    }

    api.post('users.setPresence', {presence: presence}, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
}
module.exports = {
    getImChannel: getImChannel,
    getInfo: getInfo,
    getList: getList,
    getPresence: getPresence,
    getUser: getUser,
    setPresence: setPresence
};
