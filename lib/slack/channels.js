var _ = require('lodash');

var api = require('./api');
var errors = require('./errors');
var slackTypes = require('./types');

/**
 * Gets a Slack entity by name or id
 * @param {string} slackType enum i.e. slackType.CHANNEL
 * @param {string} search The entity name or id to find
 * @param {function} callback callback(err, results)
 * @access private
 */
function getEntity(slackType, search, callback) {

    var entity;
    var entityMethod;
    var attribute;
    var apiOptions;

    callback = (typeof callback === 'function') ? callback : function () { };

    if (slackType && typeof slackType === 'string' && search && typeof search === 'string') {

        // Are we looking for a channel, group, or user by id
        search.match(/^([CGU]0)/) ? attribute = 'id' : attribute = 'name';

        if (global.session[slackType]) {
            entity = _.find(global.session[slackType], { [attribute]: search });
            if (entity) {
                return callback(null, entity);
            } else {
                return callback(new Error(errors.item_not_found), null)
            }
        } else {

            entityMethod = slackType + '.list';

            // Don't return archived channels or groups
            if (slackType === 'channels' || slackType === 'groups') {
                apiOptions = { exclude_archived: "1" };
            }

            // Get the list from Slack API
            api.post(entityMethod, apiOptions, (function (err, results) {
                if (err) {
                    return callback(err, null);
                }

                // Save to session object
                // Users work around, when calling uers.list
                // they return members: not users:
                if (slackType === slackTypes.USER) {
                    global.session.users = results.members;
                } else {
                    global.session[slackType] = results[slackType];
                }

                entity = _.find(global.session[slackType], { [attribute]: search });
                if (entity) {
                    return callback(null, entity);
                } else {
                    callback(new Error(errors.item_not_found), null)
                }
            }));
        }

    } else {
        return callback(new Error(errors.missing_required_arg), null);
    }
}



module.exports = {

    get: function (match, callback) {
        callback = (typeof callback === 'function') ? callback : function () { };

        if (!match) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        getEntity(slackTypes.CHANNEL, match, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });

    },

    info: function (channel, callback) {
        api.post('channels.info', { channel: channel }, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    list:
    /**
    * Gets channel list from API, excluding archived channels
    * @param {function} callback(err,results)
    */
    function (callback) {
        api.post('channels.list', { exclude_archived: "1" }, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    // mark: function (channel, callback) {
    //     api.post('channels.mark', function (err, results) {
    //         return callback(null, results);
    //     });
    // },

    // setPurpose: function (channel, callback) {
    //     api.post('channels.setPurpose', function (err, results) {
    //         return callback(null, results);
    //     });
    // },

    // setTopic: function (channel, callback) {
    //     api.post('channels.setTopic', function (err, results) {
    //         return callback(null, results);
    //     });
    // }
}