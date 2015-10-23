var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');

/**
* Close a direct message (im) channel
* @param {string} channel The channel id
* @callback {function} callback(err,result)
*/
function close(channel, callback) {
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
};
/**
* Get the hostory for a channel
* @param {string} channel The channel id
* @callback {function} callback(err,result)
*/
function getHistory(channel, callback) {
    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }

    if (!_.isString(channel)) {
        return callback(new Error(errors.missing_required_arg), null);
    }
    api.post('im.history', { channel: channel }, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};
/**
* Get the list of channels
* @callback {function} callback(err,result)
*/
function getList(callback) {
    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }

    api.post('im.list', function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};
/**
* Mark the read cursor for a channel
* @param {string} channel The channel id
* @callback {function} callback(err,result)
*/
function mark(channel, callback) {
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
};
/**
* Open a direct message (im) channel
* @param {string} userId The user's id
* @callback {function} callback(err,result)
*/
function open(userId, callback) {
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
        callback(null, result);
    });
}

module.exports = {
    close: close,
    getHistory: getHistory,
    getList: getList,
    mark: mark,
    open: open
}
