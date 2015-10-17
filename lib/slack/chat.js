var api = require('./api');

// Public
module.exports = {

	delete: function(channel, callback) {
		api.post('chat.delete', function(err,results) {
            return callback(null,results);
        });
	},

    postMessage: function(channel, callback) {
		api.post('chat.postMessage', function(err,results) {
            return callback(null,results);
        });
	},

    update: function(channel, callback) {
		api.post('chat.update', function(err,results) {
            return callback(null,results);
        });
	}
}