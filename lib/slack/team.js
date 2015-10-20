var _ = require('lodash');
var bole = require('bole');

var api = require('./api');
var errors = require('../errors');

var log = bole('slack.team');

// Public
module.exports = {

    getInfo: function (callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }

        api.post('team.info', function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    }
}