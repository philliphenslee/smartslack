var api = require('./api');

// Public
module.exports = {

	info: function(channel, callback) {
		api.post('team.info', function(err,results) {
            return callback(null,results);
        });
	}
}