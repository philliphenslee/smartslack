var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');

/**
* Get a list of team emoji
* @callback {function} callback(err,result)
*/
function getList(callback) {
    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }
    api.post('emoji.list', function (err, result) {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
}
module.exports = {
    getList: getList
};
