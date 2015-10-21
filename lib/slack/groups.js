var _ = require('lodash');

var api = require('./api');
var cache = require('../cache');
var errors = require('../errors');
var slackTypes = require('./types');

module.exports = {

    /**
    * Gets a group by name or id
    * @param {string} match The group id or name to find
    * @param {function} callback(err,result)
    */
    getGroup: function (match, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(match)) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        cache.search(slackTypes.GROUP, match, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });

    },
    /**
    * Gets the groups info
    * @param {string} match The group id or name to find
    * @param {function} callback(err,result)
    */
    getInfo: function (group, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }
        if (!_.isString(group)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('groups.info', { group: group }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },

    getList:
    /**
    * Gets group list from API, excluding archived groups
    * @param {function} callback(err,result)
    */
    function (callback) {
        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }
        api.post('groups.list', { exclude_archived: "1" }, function (err, result) {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    },
    /**
    * Moves the read cursor in a group.
    * @param {string} channel The group id
    * @param {string} timestamp Time of most recently seen message
    * @param {function} callback(err,result)
    */
    mark: function (channel, timestamp, callback) {

        callback = (_.isFunction(callback)) ? callback : _.noop;

        if (!_.isString(channel) && !_.isString(timestamp)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('groups.mark', { channel: channel, timestamp: timestamp }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    /**
    * Set the groups's purpose
    * @param {string} channel The channel id
    * @param {string} purpose The new channel purpose
    * @param {function} callback(err,result)
    */
    setPurpose: function (channel, purpose, callback) {

        callback = (_.isFunction(callback)) ? callback : _.noop;

        if (!_.isString(channel) && !_.isString(purpose)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('groups.setPurpose', { channel: channel, purpose: purpose }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },
    /**
    * Set the groups's topic
    * @param {string} channel The channel id
    * @param {string} topic The new channel topic
    * @param {function} callback(err,result)
    */
    setTopic: function (channel, topic, callback) {

        callback = (_.isFunction(callback)) ? callback : _.noop;

        if (!_.isString(channel) && !_.isString(topic)) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        api.post('groups.setTopic', { channel: channel, topic: topic }, function (err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    }
}