var api = require('./api');

// Public
module.exports = {

	list: function(channel, callback) {
		api.post('chat.delete', function(err,results) {
            return callback(null,results);
        });
	}
}