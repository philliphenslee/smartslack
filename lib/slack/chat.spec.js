var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var chat = require('./chat');
var errors = require('../errors');
var Cache = require('../cache');
var slackTypes = require('./types');

describe('chat', function () {

    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.user = {};
        cache.data.user.name = 'bot';
        cache.data.hostname = 'chat.slack.com';

        var scope = nock('https://slack.com')
            .post('/api/chat.postMessage')
            .reply(200, {
                ok: true,
            });
    });
    // function (method, params, callback)
    describe('#postMessage', function () {

        it('exists as method on chat', function (done) {
            expect(typeof chat.postMessage).to.equal('function');
            done();
        })

        it('should return an error to callback if missing required arguments', function (done) {
            chat.postMessage(null, null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });

        it('should return an chat response', function (done) {
            chat.postMessage('channel', 'message', function (err, results) {
                expect(results).to.be.an('object');
                expect(results.ok).to.equal(true);
            });
            done();
        });
    });
});