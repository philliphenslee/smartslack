var _ = require('lodash');

var api = require('./api');
var cache = require('../cache');
var errors = require('../errors');
var im = require('./im');
var cache = require('../cache');
var slackTypes = require('./types');

module.exports = {

    /**
    * Gets a user by name or id
    * @param {string} match the channel id ot name
    * @param {function} callback(err,result)
    */
    getUser: function (match, callback) {

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
    },
    /**
    * Gets a im channel id for a user by name
    * @param {string} name The Slack username
    * @param {function} callback(err,result)
    */
    getImChannel: function (name, callback) {
        var imChannel;

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(name)) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        cache.search(slackTypes.USER, name, function (err, result) {

            if (err) {
                return callback(err, null);
            }
            imChannel = _.find(cache.data.ims, { user: result.id });

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
    },
    /**
    * Gets the list of users
    * @param {string} user id
    * @param {function} callback(err,result)
    */
    getList: function (isIncludeArchived, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        var params = { exclude_archived: '1' };

        if (isIncludeArchived) {
            params.exclude_archived = '0';
        }

        api.post('users.list', params, function (err, result) {
            if (err) {
                return callback(err, null);
            }
            cache.data.users = result.members;
            callback(null, result);
        });
    },
    getPresence:
    /**
    * Gets the users presence
    * @param {string} user id
    * @param {function} callback(err,result)
    */
    function (user, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(user)) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        api.post('users.getPresence', { user: user }, function (err, result) {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    },
    getInfo: function (user, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        if (!_.isString(user)) {
            return callback(new Error(errors.missing_required_arg), null);
        }

        api.post('users.info', function (err, result) {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    },
    setPresence:
    /**
    * Sets the presence of the authenticated user
    * @param {string} presence auto || away
    * @param {function} callback(err,result)
    */
    function (presence, callback) {

        callback = (_.isFunction(callback)) ? callback : _.noop;

        if (presence !== 'away' || presence !== 'auto') {
            return callback(new Error(errors.missing_required_arg), null);
        }

        api.post('users.setPresence', { presence: presence }, function (err, result) {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    }
}