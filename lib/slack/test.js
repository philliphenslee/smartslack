var api = require('./api');

module.exports = {

    api:

    /**
     * Test the Slack API
     * @param {object} params The args or errors to send
     * @param {function} callback callback(err, results)
     */
    function (params, callback) {
        api.post('api.test', params, function (err, results) {
            if (err) {
                return callback(err, null)
            }
            callback(null, results);
        });
    },
    auth:

    /**
     * Test Slack api authentication
     * @param {function} callback callback(err, results)
     */
    function (callback) {
        api.post('auth.test', function (err, results) {
            if (err) {
                return callback(err, null)
            }
            callback(null, results);
        });
    }


}