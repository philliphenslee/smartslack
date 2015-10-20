var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');


// Public
module.exports = {

    getList: function (callback) {
        if (!_.isFunction(callback)) {
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