'use strict';
var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');

/**
 * Get the team info
 * @callback {function} callback(err,result)
 */
function getInfo(callback) {
    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }
    api.post('team.info', function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
}


module.exports = {
    getInfo: getInfo
};
