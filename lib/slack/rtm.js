var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');

/**
* Start a real time message session
* @callback {function} callback(err,result)
*/
function start(callback) {
    if (!_.isFunction(callback)) {
        throw new Error(errors.callback_type);
    }
    api.post('rtm.start', { simple_latest: '1', no_unreads: '1' }, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
}
module.exports = {
    start: start
};
