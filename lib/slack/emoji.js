var api = require('./api');

// Public
module.exports = {

	list: function(callback) {

		api.post('chat.delete', function(err,results) {
            if (err) {
                return callback(err, null);
            }
            callback(null, results);
        });
	}
}