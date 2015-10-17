var channels = require('./channels');
var chat = require('./chat');
var im = require('./im');
var reactions = require('./reactions');
var rtm = require('./rtm');
var test = require('./test');
var users = require('./users');

var types = {
    CHANNEL: 'channels',
    GROUP: 'groups',
    IMS: 'ims',
    USER: 'users'
};


module.exports = {

	channels: channels,
    chat: chat,
    im: im,
    reactions: reactions,
    rtm: rtm,
    users: users,
    test: test,
    types: types
}