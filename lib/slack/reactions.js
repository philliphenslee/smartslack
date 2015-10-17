var api = require('./api');

// Public
module.exports = {

	add: function(channel, callback) {
		api.post('reactions.add', function(err,results) {
            return callback(null,results);
        });
	},
    get: function(channel, callback) {
		api.post('reactions.get', function(err,results) {
            return callback(null,results);
        });
	},
    list: function(channel, callback) {
		api.post('reactions.list', function(err,results) {
            return callback(null,results);
        });
	},
    remove: function(channel, callback) {
		api.post('reactions.remove', function(err,results) {
            return callback(null,results);
        });
	}
}