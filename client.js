var SlackClient = require('./lib/index.js');

var options = {token: 'xoxb-11751627585-DYeBN3Zs2yqMrdfmQQWTPUWc'};

//var options = {token: 'xoxb11751627585DYeBN3Zs2yqMrdfmQQWTPUWc'};

//var options = null;

var msg = {type: 'message',
		   channel: 'C0BC6DA11',
		   text: 'Hello World!'}

var slackClient = new SlackClient(options);

var args = {foo: 'bar', arg2: 'Arg value'};
var error = {error: 'Test Slack API Error'};


//slackClient.apiTest(args);




slackClient.login();

slackClient.on('connected', function onConnected(data) {
	slackClient._sendSocket(msg);
	var result = slackClient.getUserByName('oldman'); 
	console.log(result.real_name);
});

setInterval(sendMessage,9000);
	
function sendMessage(){
	slackClient._ping();
}

