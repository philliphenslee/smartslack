var _ = require('lodash');
var bole = require('bole');

var api = require('./api');
var errors = require('../errors');

var log = bole('slack.emoji');

// Public
module.exports = {

    getList: function (callback) {
        if (!_.isFunction(callback)) {
            log.debug(errors.callback_type);
            throw new Error(errors.callback_type);
        }
        api.post('emoji.list', function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    }
}