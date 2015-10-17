var api = require('./api');

module.exports = {

    api:
    /**
     * @param {object params The args or errors to send
     */
    function (params, callback) {
        return callback('API RESPONSE');
    },
    auth:
    /**
     * @param {function} callback(err, results)
     */
    function (callback) {
        api.post('auth.test', function (err, results) {
            return callback(results);
        });
    }


}