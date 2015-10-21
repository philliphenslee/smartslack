
var _ = require('lodash');
var bole = require('bole');
var https = require('https');
var qs = require('querystring');
var util = require('util');

var errors = require('../errors');
var cache = require('../cache');
var slackTypes = require('./types');

var log = bole('slack.api');

module.exports = {

    /**
    * Makes a method call to the Slack API
    * @param {string} method The method to call
    * @param {object} params The additional message options
    * @param {function} callback(err,result)
    */
    post: function (method, args, callback) {
        var request;

        callback = (_.isFunction(callback)) ? callback : _.noop;

        if (_.isFunction(args)) {
            callback = args;
            args = null;
        }

        if (!_.isString(method)) {
            return callback(new Error(errors.missing_required_arg));
        }

        args = _.merge(args || {}, { token: cache.data.token });

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

            var output = '';
            var result;

            response.setEncoding('utf8');

            response.on('data', function (chunk) {
                output += chunk;
            });

            response.on('end', function () {

                if (response.statusCode === 200) {
                    log.debug('API response received succesfully');
                    try {
                        result = JSON.parse(output);
                    } catch (error) {
                        return callback(error);
                    }
                    if (!result.ok) {
                        return callback(new Error(result.error));
                    }
                    callback(null, result);


                } else {
                    return callback(new Error('HTTPS response error ' + ' ' + response.statusCode));
                }
            });
        });

        request.on('error', function (err) {
            callback(err);
        });

        request.write(postData);
        request.end();
    }
}