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
    get: function (match, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(match)) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        cache.search(slackTypes.GROUP, match, function (err, result) {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });

    },

    info: function (group, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }
        if (!_.isString(group)) {
            return callback(new Error(errors.missing_required_arg), null);
        }
        api.post('groups.info', { group: group }, function (err, result) {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    },

    list:
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

    // mark: function (group, callback) {
    //     api.post('groups.mark', function (err, result) {
    //         return callback(null, result);
    //     });
    // },

    // setPurpose: function (group, callback) {
    //     api.post('groups.setPurpose', function (err, result) {
    //         return callback(null, result);
    //     });
    // },

    // setTopic: function (group, callback) {
    //     api.post('groups.setTopic', function (err, result) {
    //         return callback(null, result);
    //     });
    // }
}