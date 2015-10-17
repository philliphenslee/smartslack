var api = require('./api');

// Public
module.exports = {

	getPresence: function(channel, callback) {
		api.post('users.getPresence', function(err,results) {
            return callback(null,results);
        });
	},
    info: function(channel, callback) {
		api.post('users.info', function(err,results) {
            return callback(null,results);
        });
	},
    list: function(channel, callback) {
		api.post('users.list', function(err,results) {
            return callback(null,results);
        });
	},
    setPresence: function(channel, callback) {
		api.post('users.setPresence', function(err,results) {
            return callback(null,results);
        });
	}
}