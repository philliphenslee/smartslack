var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');

// Public
module.exports = {

    start: function (callback) {
        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }
        api.post('rtm.start',{simple_latest: '1', no_unreads: '1' }, function (err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    }
}