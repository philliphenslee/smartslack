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
        cache.data.users = [{ id: 'U0A1B2C3D4', name: 'phillip' }];
        cache.data.ims = {}
        cache.data.ims = [{ id: 'D0BN0UDLG',
                            is_im: true,
                            user: 'U0A1B2C3D4'}]
        cache.data.hostname = 'slack.com';

    });

    // function (method, params, callback)
    describe('#delete', function () {

        before(function () {

            var scope = nock('https://slack.com')
                .post('/api/chat.delete')
                .reply(200, {
                    ok: true
                });
        });

        it('exists as method on chat', function (done) {
            expect(typeof chat.delete).to.equal('function');
            done();
        })

        it('should return an error to callback if missing required arguments', function (done) {
            chat.postMessage(null, null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        // it('should return an api response', function (done) {
        //     chat.postMessage('general', 'message', function (err, results) {
        //         expect(results).to.be.an('object');
        //         expect(results.ok).to.equal(true);
        //         done();
        //     });

        // });
    });

    // function (method, params, callback)
    describe('#postMessage', function () {

        before(function () {

            var scope = nock('https://slack.com')
                .post('/api/chat.postMessage')
                .reply(200, {
                    ok: true
                });
        });

        it('exists as method on chat', function (done) {
            expect(typeof chat.postMessage).to.equal('function');
            done();
        })

        it('should return an error to callback if missing required arguments', function (done) {
            chat.postMessage(null, null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an api response', function (done) {
            chat.postMessage('general', 'message', function (err, results) {
                expect(results).to.be.an('object');
                expect(results.ok).to.equal(true);
                done();
            });

        });
    });

    // function (method, params, callback)
    describe('#postDirectMessage', function () {

        beforeEach(function () {

            var scope = nock('https://slack.com')
                .post('/api/chat.postMessage')
                .reply(200, {
                    ok: true,
                });
        });

        it('exists as method on chat', function (done) {
            expect(typeof chat.postDirectMessage).to.equal('function');
            done();
        })

        it('should return an error to callback if missing required arguments', function (done) {
            chat.postDirectMessage(null, null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an error if invalid user', function (done) {
            chat.postDirectMessage('phillips', 'message', function (err, results) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('the channel, group, or user could not be found');

            });
             done();
        });

        it('should return an api response', function (done) {
            chat.postDirectMessage('phillip', 'message', function (err, results) {
                expect(results).to.be.an('object');
                expect(results.ok).to.equal(true);
                done();
            });

        });
    });

    // function (method, params, callback)
    describe('#update', function () {

        before(function () {

            var scope = nock('https://slack.com')
                .post('/api/chat.delete')
                .reply(200, {
                    ok: true
                });
        });

        it('exists as method on chat', function (done) {
            expect(typeof chat.update).to.equal('function');
            done();
        })

        it('should return an error to callback if missing required arguments', function (done) {
            chat.postMessage(null, null,null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        // it('should return an api response', function (done) {
        //     chat.postMessage('general', 'message', function (err, results) {
        //         expect(results).to.be.an('object');
        //         expect(results.ok).to.equal(true);
        //         done();
        //     });

        // });
    });
    after(function () {
        cache = null;
    });
});