var _ = require('lodash');
var https = require('https');
var qs = require('querystring');
var util = require('util');

var customErrors = require('./errors');

module.exports = {

    post: function (method, params, callback) {

        var request;

        if (typeof callback === 'function') {
            callback = callback;
        } else {
            callback = function () { return undefined; };
        }

        if (!method) {
            return callback(new Error(customErrors.missing_options_arg), null);
        }

        if (typeof params === 'function') {
            callback = params;
            params = null;
        }

        params = _.merge(params || {}, { token: global.ACCESS_TOKEN });

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
    },

}