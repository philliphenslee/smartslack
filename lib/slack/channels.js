var api = require('./api');

// Public
module.exports = {

	info: function(channel, callback) {
		api.post('channels.info', function(err,results) {
            return callback(null,results);
        });
	},

    list: function(channel, callback) {
		api.post('channels.list', function(err,results) {
            return callback(null,results);
        });
	},

    mark: function(channel, callback) {
		api.post('channels.mark', function(err,results) {
            return callback(null,results);
        });
	},

    setPurpose: function(channel, callback) {
		api.post('channels.setPurpose', function(err,results) {
            return callback(null,results);
        });
	},

    setTopic: function(channel, callback) {
		api.post('channels.setTopic', function(err,results) {
            return callback(null,results);
        });
	}
}