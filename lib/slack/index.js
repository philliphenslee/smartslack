var channels = require('./channels');
var chat = require('./chat');
var emoji = require('./emoji');
var groups = require('./groups');
var im = require('./im');
var reactions = require('./reactions');
var rtm = require('./rtm');
var test = require('./test');
var types = require('./types');
var users = require('./users');

module.exports = {

	channels: channels,
    chat: chat,
    emoji: emoji,
    groups: groups,
    im: im,
    reactions: reactions,
    rtm: rtm,
    users: users,
    test: test,
    types: types
}