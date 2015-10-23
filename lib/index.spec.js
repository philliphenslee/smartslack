var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var Cache = require('./cache');
var SmartSlack = require('../lib/index.js');

describe('SmartSlack', function () {

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

    var mockopts =
        {
            token: 'xxxx-01234567890-ABCDEFGHIJKLMNOPQRSTUVWX',
            autoReconnect: false
        };

    var mockopts_invalid_token =
        {
            token: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        };

    describe('constructor', function () {

        it('can be constructed', function (done) {
            var slackClient = new SmartSlack(mockopts);
            slackClient.should.be.an('object');
            done();
        })

        it('should validate required options arguments', function (done) {
            expect(function () {
                new SmartSlack(null);
            }).to.throw('missing required argument object options');
            done();
        });

        it('should validate required token option', function (done) {
            expect(function () {
                new SmartSlack(mockopts_invalid_token);
            }).to.throw('invalid access token, please provide a valid token.');

            done();
        });
    });

    describe('#start', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient.start).to.equal('function');
            done();
        })
    });

    describe('#postDirectMessage', function () {

         beforeEach(function () {

            var scope = nock('https://slack.com')
                .post('/api/chat.postMessage')
                .reply(200, {
                    ok: true
                });
        });

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient.postDirectMessage).to.equal('function');
            done();
        })


        it('should return an error to callback if missing required string arguments', function (done) {
            var slackClient = new SmartSlack(mockopts);
            slackClient.postDirectMessage(null,null,null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
                done();
            });

        });

        it('should return an api response', function (done) {
             var slackClient = new SmartSlack(mockopts);
            slackClient.postDirectMessage('phillip', 'message', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });
        });
    });

    describe('#postMessage', function () {

         before(function () {

            var scope = nock('https://slack.com')
                .post('/api/chat.postMessage')
                .reply(200, {
                    ok: true
                });
        });

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient.postMessage).to.equal('function');
            done();
        })


        it('should return an error to callback if missing required string arguments', function (done) {
            var slackClient = new SmartSlack(mockopts);
            slackClient.postMessage(null, null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
                done();
            });

        });

         it('should return an api response', function (done) {
             var slackClient = new SmartSlack(mockopts);
            slackClient.postMessage('general', 'message', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });
        });

    });

    describe('#sendToChannel', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient.sendToChannel).to.equal('function');
            done();
        })


        it('should return an error to callback if missing required string arguments', function (done) {
            var slackClient = new SmartSlack(mockopts);
            slackClient.sendToChannel(null,null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
                done();
            });

        });

    });

    describe('#sendToGroup', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient.sendToGroup).to.equal('function');
            done();
        })

        it('should return an error to callback if missing required string argument', function (done) {
            var slackClient = new SmartSlack(mockopts);
            slackClient.sendToGroup(null,null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
                done();
            });

        });

    });

    describe('#sendToUser', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient.sendToUser).to.equal('function');
            done();
        })


       it('should return an error to callback if missing required string argument', function (done) {
            var slackClient = new SmartSlack(mockopts);
            slackClient.sendToUser(null,null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
                done();
            });

        });

    });

    describe('#getUptime', function () {


        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient.getUptime).to.equal('function');
            done();
        })

        it('returns a string with the formatted uptime', function (done) {
            var slackClient = new SmartSlack(mockopts);
            var uptime = slackClient.getUptime();
            expect(uptime).to.be.a('string');
            done();
        })
    });

    describe('#_canResolve', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient._canResolve).to.equal('function');
            done();
        })
    });

    describe('#_connectSocket', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient._connectSocket).to.equal('function');
            done();
        })
    });

    describe('#_onRtmEvent', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient._onRtmEvent).to.equal('function');
            done();
        })
    });

    describe('#_ping', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient._ping).to.equal('function');
            done();
        })
    });

    describe('#_reconnect', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient._reconnect).to.equal('function');
            done();
        })
    });

    describe('#_send', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient._send).to.equal('function');
            done();
        })
    });

    describe('#_sendToType', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient._sendToType).to.equal('function');
            done();
        });

        it('should return and error if passed invalid type', function (done) {
            var slackClient = new SmartSlack(mockopts);
            slackClient._sendToType('invalid_type', 'type_name', 'text', function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('invalid slack entity type');
            });
            done();

        });

    });
});