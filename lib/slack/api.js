
var _ = require('lodash');
var bole = require('bole');
var https = require('https');
var qs = require('querystring');
var util = require('util');

var errors = require('../errors');
var cache = require('../cache');
var slackTypes = require('./types');

var log = bole('Slack.api');

/**
 * Gets a Slack entity by name or id
 * @param {string} slackType enum i.e. slackType.CHANNEL
 * @param {string} search The entity name or id to find
 * @param {function} callback callback(err, results)
 * @access private
 */
function _getEntity(slackType, search, callback) {

    var entity;
    var attribute;

    if (!_.isFunction(callback)) {
        log.error(errors.callback_type);
        throw new Error(errors.callback_type);

    }

    if (_.isFunction(search)) {
        callback = search;
        search = null;
    }
    if (!_.isString(slackType) && !_.isString(search)) {
        log.error(errors.missing_required_arg);
        return callback(new Error(errors.missing_required_arg));

    }

    // Are we looking for a channel, group, or user by id
    search.match(/^([CGU]0)/) ? attribute = 'id' : attribute = 'name';

    if (cache.data[slackType]) {
        entity = _.find(cache.data[slackType], { [attribute]: search });

        if (entity) {
            return callback(null, entity);
        } else {
            log.warn(errors.entity_not_found);
            return callback(new Error(errors.item_not_found));
        }
    } else {
        log.error('Could not save cache data for ' + slackType);
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

    if (typeof params === 'function') {
        callback = params;
        params = null;
    }
    if (typeof method !== 'string') {
        if (typeof callback === 'function') {
            log.error(errors.missing_required_arg);
            return callback(new Error(errors.missing_required_arg));
        }
    }

    params = _.merge(params || {}, { token: cache.data.token });

    var postData = qs.stringify(params);

    var options = {
        hostname: cache.data.hostname,
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
                log.debug('API response received succesfully');
                try {
                    results = JSON.parse(output);
                } catch (error) {
                    log.error(error);
                }
                return callback(null, results);

            } else {
                return callback(new Error('HTTPS respone error' + ' ' + response.statusCode));
            }
        });
    });

    request.on('error', function (err) {
        log.error(err);
    });

    request.write(postData);
    request.end();
}

module.exports = {

    /**
   * Gets a Slack entity by name or id
   * @param {string} slackType enum i.e. slackType.CHANNEL
   * @param {string} search The entity name or id to find
   * @param {function} callback callback(err, results)
   * @access private
   */
    getEntity: function (slackType, search, callback) {

        if (!_.isFunction(callback)) {
            log.error(errors.callback_type);
            throw new Error(errors.callback_type);
        }
        if (!_.isString(slackType) && !_.isString(search)) {
            log.error(errors.missing_required_arg)
            return callback(new Error(errors.missing_required_arg));
        }
        _getEntity(slackType, search, function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
    /**
    * Makes a method call to the Slack API
    * @param {string} method The method to call
    * @param {object} params The additional message options
    * @param {function} callback(err,results)
    */
    post: function (method, params, callback) {
        _apiCall(method, params, function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    }
}