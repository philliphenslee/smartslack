var _ = require('lodash');

var api = require('./api');
var cache = require('../cache');
var errors = require('../errors');
var slackTypes = require('./types');

/**
* Gets a channel object from the local cache
* @param {string} match The channel id or name
* @callback {function}  callback(err,result)
*/
function getChannel(match, callback) {

    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }

    if (!_.isString(match)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    cache.search(slackTypes.CHANNEL, match, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};

/**
* Gets the last message posted to a channel
* @param {string} channel The channel id
* @callback {function} callback(err,result)
*/
function getLastChannelMessage(channel, callback) {

    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }

    if (!_.isString(channel)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    if (!channel.match(/^(C0)/)) {
        return callback(new Error(errors.invalid_channel_id));
    }

    api.post('channels.history', { channel: channel, count: 1 }, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });

};

/**
* Gets the channels history
* @param {string} channel The channel id
* @param {object} options additonal method arguments
* @callback {function} callback(err,result)
*/
function getHistory(channel, args, callback) {

    if (_.isFunction(args)) {
        callback = args;
        args = null;
    }

    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }

    if (!_.isString(channel)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    if (!channel.match(/^(C0)/)) {
        return callback(new Error(errors.invalid_channel_id));
    }
    api.post('channels.history', { channel: channel }, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};
/**
* Gets the channels information from the api
* @param {string} channel The channel id
* @callback {function} callback(err,result)
*/
function getInfo(channel, callback) {

    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }

    if (!_.isString(channel)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    if (!channel.match(/^(C0)/)) {
        return callback(new Error(errors.invalid_channel_id));
    }

    api.post('channels.info', { channel: channel }, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};
/**
* Gets channel list from API, excluding archived channels
* @callback {function} callback(err,result)
*/
function getList(callback) {

    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }
    api.post('channels.list', { exclude_archived: "1" }, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};
/**
* Moves the read cursor in a channel.
* @param {string} channel The channel id
* @param {string} timestamp Time of most recently seen message
* @callback {function} callback(err,result)
*/
function mark(channel, timestamp, callback) {

    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(channel) && !_.isString(timestamp)) {
        return callback(new Error(errors.missing_required_arg), null);
    }
    api.post('channels.mark', { channel: channel, timestamp: timestamp }, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};
/**
* Set the channels's purpose
* @param {string} channel The channel id
* @param {string} purpose The new channel purpose
* @callback {function} callback(err,result)
*/
function setPurpose(channel, purpose, callback) {

    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(channel) && !_.isString(purpose)) {
        return callback(new Error(errors.missing_required_arg), null);
    }
    api.post('channels.setPurpose', { channel: channel, purpose: purpose }, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};
/**
* Set the channel's topic
* @param {string} channel The channel id
* @param {string} topic The new channel topic
* @callback {function} callback(err,result)
*/
function setTopic(channel, topic, callback) {

    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (!_.isString(channel) && !_.isString(topic)) {
        return callback(new Error(errors.missing_required_arg), null);
    }

    api.post('channels.setTopic', { channel: channel, topic: topic }, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
}

module.exports = {

    getChannel: getChannel,
    getHistory: getHistory,
    getInfo: getInfo,
    getLastChannelMessage: getLastChannelMessage,
    getList: getList,
    mark: mark,
    setPurpose: setPurpose,
    setTopic: setTopic,
}
