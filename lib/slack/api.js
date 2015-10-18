var _ = require('lodash');
var https = require('https');
var qs = require('querystring');
var util = require('util');

var errors = require('./errors');
var session = require('../session');
var slackTypes = require('./types');

/**
 * Gets a Slack entity by name or id
 * @param {string} slackType enum i.e. slackType.CHANNEL
 * @param {string} search The entity name or id to find
 * @param {function} callback callback(err, results)
 * @access private
 */
function _getEntity(slackType, search, callback) {

    var entity;
    var entityMethod;
    var attribute;
    var apiOptions;

    callback = (typeof callback === 'function') ? callback : function () { };

    if (slackType && typeof slackType === 'string' && search && typeof search === 'string') {

        // Are we looking for a channel, group, or user by id
        search.match(/^([CGU]0)/) ? attribute = 'id' : attribute = 'name';

        if (session.data[slackType]) {
            entity = _.find(session.data[slackType], { [attribute]: search });
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
            _apiCall(entityMethod, apiOptions, function (err, results) {
                if (err) {
                    return callback(err, null);
                }

                // Save to session object
                // Users work around, when calling uers.list
                // they return members: not users:
                if (slackType === slackTypes.USER) {
                    session.data.users = results.members;
                } else {
                    session.data[slackType] = results[slackType];
                }

                entity = _.find(session.data[slackType], { [attribute]: search });
                if (entity) {
                    return callback(null, entity);
                } else {
                    callback(new Error(errors.item_not_found), null)
                }
            });
        }

    } else {
        return callback(new Error(errors.missing_required_arg), null);
    }
}
/**
 * Makes a method call to the Slack API
 * @param {string} method The method to call
 * @param {object} params The additional message options
 * @param {function} callback(err,results)
 * @access private
 */
function _apiCall(method, params, callback) {
    var request;

    callback = (typeof callback === 'function') ? callback : function () { };

    if (!method) {
        return callback(new Error(errors.missing_options_arg), null);
    }

    if (typeof params === 'function') {
        callback = params;
        params = null;
    }

    params = _.merge(params || {}, { token: session.data.token });

    var postData = qs.stringify(params);

    var options = {
        hostname: 'slack.com',
        port: 443,
        path: '/api/' + method,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    request = https.request(options, function (response) {

        var output = '';
        var results;

        response.setEncoding('utf8');

        response.on('data', function (chunk) {
            output += chunk;
        });

        response.on('end', function () {

            if (response.statusCode === 200) {
                try {
                    results = JSON.parse(output);
                } catch (error) {
                    //_this.log.debug(error);
                }
                return callback(null, results);

            } else {
                return callback({ ok: false, error: 'API response: ' + response.statusCode }, null);
            }
        });
    });

    request.on('error', function (err) {
        //TODO ???
    });

    request.write(postData);
    request.end();
}

module.exports = {

    getEntity:
    /**
    * Gets a Slack entity by name or id
    * @param {string} slackType enum i.e. slackType.CHANNEL
    * @param {string} search The entity name or id to find
    * @param {function} callback callback(err, results)
    * @access private
    */
    function (slackType, search, callback) {
        _getEntity(slackType, search, callback);
    },
    /**
    * Makes a method call to the Slack API
    * @param {string} method The method to call
    * @param {object} params The additional message options
    * @param {function} callback(err,results)
    */
    post: function (method, params, callback) {
        _apiCall(method, params, callback);
    },


}