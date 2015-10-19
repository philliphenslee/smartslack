var _ = require('lodash');

var api = require('./api');
var errors = require('../errors');

module.exports = {

    close: function (channel, callback) {
        api.post('im.close', function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    history: function (channel, callback) {
        api.post('im.history', function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    list: function (channel, callback) {
        api.post('im.list', function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    mark: function (channel, callback) {
        api.post('im.mark', function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    },

    open:
    /**
    * Open a direct message (im) channel
    * @param {string} userId The user's id
    * @param {function} callback(err,results)
    */
    function (userId, callback) {
        api.post('im.open', { user: userId }, function (err, results) {
            if (err) {
                return callback(err, null);
            }
            if (results.ok) {
                return callback(null, results);
            }
            callback(results, null);

        });
    }
}