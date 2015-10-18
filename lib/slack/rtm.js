var api = require('./api');

// Public
module.exports = {

    start: function (callback) {
        api.post('rtm.start', function (err, results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
    }
}