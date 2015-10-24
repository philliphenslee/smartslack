var _ = require('lodash');
var bole = require('bole');
var https = require('https');
var qs = require('querystring');

var slackTypes = require('./types');
var errors = require('../errors');
var cache = require('../cache');


var log = bole('slack.api');

/**
 * Makes a method call to the Slack API
 * @param {string} method The method to call
 * @param {object} args The additional message options
 * @param {function} callback(err,result)
 */
function post(method, args, callback) {
    var request;

    callback = (_.isFunction(callback)) ? callback : _.noop;

    if (_.isFunction(args)) {
        callback = args;
        args = null;
    }

    if (!_.isString(method)) {
        return callback(new Error(errors.missing_required_arg));
    }

    args = _.merge(args || {}, {token: cache.data.token});

    var postData = qs.stringify(args);

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

        var data = '';
        var result;

        response.setEncoding('utf8');

        response.on('data', function (chunk) {
            data += chunk;
        });

        response.on('end', function () {

            if (response.statusCode === 200) {
                log.debug('API response received');
                try {
                    result = JSON.parse(data);
                } catch (error) {
                    return callback(error);
                }
                if (!result.ok) {
                    return callback(new Error(result.error));
                }
                callback(null, result);

            } else {
                return callback(new Error('http response error ' + ' ' + response.statusCode));
            }
        });
    });

    request.on('error', function (err) {
        log.debug(err);
        return callback(err);
    });

    request.write(postData);
    request.end();
}

module.exports.post = post;
