var api = require('./api');

// Public
module.exports = {

	close: function(channel, callback) {
		api.post('im.close', function(err,results) {
            return callback(null,results);
        });
	},

    history: function(channel, callback) {
		api.post('im.history', function(err,results) {
            return callback(null,results);
        });
	},

    list: function(channel, callback) {
		api.post('im.list', function(err,results) {
            return callback(null,results);
        });
	},

    mark: function(channel, callback) {
		api.post('im.mark', function(err,results) {
            return callback(null,results);
        });
	},

    open: function(channel, callback) {
		api.post('im.open', function(err,results) {
            return callback(null,results);
        });
	}
}