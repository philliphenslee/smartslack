var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');


module.exports = {
    /**
     * Test the Slack API
     * @param {object} params The args or errors to send
     * @param {function} callback callback(err, result)
     */
    api: function (params, callback) {

        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }
        if (!_.isObject(params)) {
            return callback(new Error(errors.missing_required_arg));
        }
        api.post('api.test', params, function (err, result) {
            if (err) {
                return callback(err)
            }
            callback(null, result);
        });
    },
    /**
     * Test Slack api authentication
     * @param {function} callback callback(err, result)
     */
    auth: function (callback) {
        
        if (!_.isFunction(callback)) {
            throw new Error(errors.callback_type);
        }
        api.post('auth.test', function (err, result) {
            if (err) {
                return callback(err)
            }
            callback(null, result);
        });
    }


}