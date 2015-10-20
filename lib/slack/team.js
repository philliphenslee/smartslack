var api = require('./api');
var errors = require('../errors');

// Public
module.exports = {

    info: function (callback) {

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