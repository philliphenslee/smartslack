var api = require('./api');

// Public
module.exports = {

	start: function(channel, callback) {
		api.post('rtm.start', function(err,results) {
            return callback(null,results);
        });
	}
}