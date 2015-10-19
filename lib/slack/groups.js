var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');
var slackTypes = require('./types');

module.exports = {

    get:
    /**
    * Gets a group by name or id
    * @param {string} match The group id or name to find
    * @param {function} callback(err,results)
    */
    function (match, callback) {

        callback = (typeof callback === 'function') ? callback : function () { };

        if (!match) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        api.getEntity(slackTypes.GROUP, match, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });

    },

    info: function (group, callback) {
        api.post('groups.info', { group: group }, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    list:
    /**
    * Gets group list from API, excluding archived groups
    * @param {function} callback(err,results)
    */
    function (callback) {
        api.post('groups.list', { exclude_archived: "1" }, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    // mark: function (group, callback) {
    //     api.post('groups.mark', function (err, results) {
    //         return callback(null, results);
    //     });
    // },

    // setPurpose: function (group, callback) {
    //     api.post('groups.setPurpose', function (err, results) {
    //         return callback(null, results);
    //     });
    // },

    // setTopic: function (group, callback) {
    //     api.post('groups.setTopic', function (err, results) {
    //         return callback(null, results);
    //     });
    // }
}