[![SmartSlack](https://img.shields.io/badge/smart-slack-e61870.svg)](https://github.com/philliphenslee/smartslack)
[![Node Module](https://img.shields.io/badge/node.js-module-82bb22.svg)](https://github.com/philliphenslee/smartslack)
[![License](http://img.shields.io/badge/license-MIT-lightgrey.svg)](https://raw.githubusercontent.com/philliphenslee/smartslack/master/LICENSE)
[![Travis branch](https://img.shields.io/travis/philliphenslee/smartslack/master.svg)](https://travis-ci.org/philliphenslee/smartslack)
[![Coverage Status](https://coveralls.io/repos/philliphenslee/smartslack/badge.svg?branch=master&service=github)](https://coveralls.io/github/philliphenslee/smartslack?branch=master)
[![Current Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://github.com/philliphenslee/smartslack)

##Overview
***SmartSlack*** is a Node.JS module for [*Slack's*](https://slack.com) Real Time Messaging API. 

## Installation

##Usage

Creating a new intance of *SmartSlack*

```
var SmartSlack = require('smartslack');

var options = { token: 'xxxx-01234567890-ABCDEFGHIJKLMNOPQRSTUVWX'};

var slackClient = new SmartSlack(options);

slackClient.login();

```


