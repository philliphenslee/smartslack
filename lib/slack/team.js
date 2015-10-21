var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');



module.exports = {
    /**
    * Get the team info
    * @param {function} callback(err,result)
    */
    getInfo: function (callback) {
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
}