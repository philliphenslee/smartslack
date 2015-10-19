var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');
var im = require('./im');
var cache = require('../cache');
var slackTypes = require('./types');

module.exports = {

    get:
    /**
    * Gets a user by name or id
    * @param {string} match the channel id ot name
    * @param {function} callback(err,results)
    */
    function (match, callback) {

        if (typeof callback !== 'function') {
            throw new Error(errors.callback_type);
        }

        if (!match) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        api.getEntity(slackTypes.USER, match, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });

    },
    /**
    * Gets a im channel id for a user by name
    * @param {string} name The Slack username
    * @param {function} callback(err,results)
    */
    getImChannel: function (name, callback) {

        var imChannel;

        callback = (typeof callback === 'function') ? callback : function () { };

        if (name && typeof name === 'string') {

            api.getEntity(slackTypes.USER, name, function (err, results) {

                if (err) {
                    return callback(err, null);
                }

                imChannel = _.find(cache.data.ims, { user: results.id });

                if (imChannel) {
                    return callback(null, imChannel.id);
                }

                im.open(results.id, function (err, results) {
                    if (err) {
                        return callback(err, null);
                    }
                    callback(null, results.channel.id);
                });

            });
        } else {
            callback(new Error(errors.missing_required_arg), null);
        }
    },
    getList: function (isIncludeArchived, callback) {
        var params = { exclude_archived: '1' };

        if (isIncludeArchived) {
            params.exclude_archived = '0';
        }

        api.post('users.list', params, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            cache.data.users = results.members;
            callback(null, results);
        });
    },
    getPresence:
    /**
    * Gets the users presence
    * @param {string} user id
    * @param {function} callback(err,results)
    */
    function (user, callback) {

        callback = (typeof callback === 'function') ? callback : function () { };

        api.post('users.getPresence', { user: user }, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },
    info: function (user, callback) {

        callback = (typeof callback === 'function') ? callback : function () { };

        api.post('users.info', function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },
    setPresence:
    /**
    * Sets the presence of the authenticated user
    * @param {string} presence auto || away
    * @param {function} callback(err,results)
    */
    function (presence, callback) {

        callback = (typeof callback === 'function') ? callback : function () { };

        if (presence && (presence === 'away' || presence === 'auto')) {
            api.post('users.setPresence', { presence: presence }, function (results) {
                return callback(null, results);
            });
        } else {
            callback(new Error(errors.missing_required_arg), null);
        }
    }
}