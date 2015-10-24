[![SmartSlack](https://img.shields.io/badge/smart-slack-e61870.svg)](https://github.com/philliphenslee/smartslack)
[![Node Module](https://img.shields.io/badge/node.js-module-82bb22.svg)](https://github.com/philliphenslee/smartslack)
[![Travis branch](https://img.shields.io/travis/philliphenslee/smartslack/master.svg)](https://travis-ci.org/philliphenslee/smartslack)
[![Coverage Status](https://coveralls.io/repos/philliphenslee/smartslack/badge.svg?branch=master&service=github)](https://coveralls.io/github/philliphenslee/smartslack?branch=master)
[![Current Version](https://img.shields.io/badge/version-0.8.0-blue.svg)](https://github.com/philliphenslee/smartslack)
[![License](http://img.shields.io/badge/license-MIT-lightgrey.svg)](https://raw.githubusercontent.com/philliphenslee/smartslack/master/LICENSE)

##Overview
***SmartSlack*** is a Node.JS module for [*Slack's*](https://slack.com) Real Time Messaging API.


##Installation
```

```
## Basic Usage

Creating a new instance of *SmartSlack* and sending a message to *Slack*

```
var SmartSlack = require('smartslack');

// Configure options
var options = { token: 'xxxx-01234567890-ABCDEFGHIJKLMNOPQRSTUVWX'};

// Create new instance
var slackClient = new SmartSlack(options);

// Listen for errors...
slackClient.on('error',function(error) {
    console.log(error);
}

// Start the Slack RTM session...
slackClient.start();

var message = 'Hello Channel!';

slackClient.on('connected',function() {

    // Send a message to #general
    slackClient.sendToChannel('general',message);
});
```

##Events

* **connected** : Event fired after reciept of the hello event message from the RTM API
* **error** : Emitted anytime the web socket emits an error or after https request errors
* **eventmessage** This event is emitted after receiving any RTM event message
* **message** Emitted when an event message of type message is recevied
* **open** Emmited when the websocket is open
* **close** Emitted when the websocket is closed


Note: Should subscribe to the error event to prevent node from terminating.
When an EventEmitter instance experiences an error, the typical action is to emit
an 'error' event. Error events are treated as a special case in Node.js.
If there is no listener for it, then the default action is to print a stack trace
and exit the program.

See the Node.JS documentation for more information on EventEmitter.
[https://nodejs.org/api/events.html](https://nodejs.org/api/events.html)







