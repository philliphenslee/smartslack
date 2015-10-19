var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var SmartSlack = require('../lib/index.js');

describe('SmartSlack', function () {

    var mockopts =
        {
            token: 'xxxx-01234567890-ABCDEFGHIJKLMNOPQRSTUVWX',
            autoReconnect: true
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

    describe('#login', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient.login).to.equal('function');
            done();
        })

    });

    describe('#sendToChannel', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient.sendToChannel).to.equal('function');
            done();
        })


        it('should validate required arguments', function (done) {
            expect(function () {
                var slackClient = new SmartSlack(mockopts);
                slackClient.sendToChannel(/**no-args*/);
            }).to.throw('missing or invalid required argument(s)');

            done();
        });


        it('should return an error to callback if missing required string argument', function (done) {
            var slackClient = new SmartSlack(mockopts);
            slackClient.sendToChannel(null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });

    });

    describe('#sendToGroup', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient.sendToGroup).to.equal('function');
            done();
        })


        it('should validate required arguments', function (done) {
            expect(function () {
                var slackClient = new SmartSlack(mockopts);
                slackClient.sendToGroup(/**no-args*/);
            }).to.throw('missing or invalid required argument(s)');

            done();
        });


        it('should return an error to callback if missing required string argument', function (done) {
            var slackClient = new SmartSlack(mockopts);
            slackClient.sendToGroup(null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });

    });

    describe('#sendToUser', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient.sendToUser).to.equal('function');
            done();
        })


        it('should validate required arguments', function (done) {
            expect(function () {
                var slackClient = new SmartSlack(mockopts);
                slackClient.sendToUser(/**no-args*/);
            }).to.throw('missing or invalid required argument(s)');

            done();
        });


        it('should return an error to callback if missing required string argument', function (done) {
            var slackClient = new SmartSlack(mockopts);
            slackClient.sendToUser(null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });

    });

    describe('#_canResolve', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient._connect).to.equal('function');
            done();
        })
    });

    describe('#_connect', function () {

        it('exists as method on SmartSlack', function (done) {
            var slackClient = new SmartSlack(mockopts);
            expect(typeof slackClient._connect).to.equal('function');
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
            expect(typeof slackClient._onRtmEvent).to.equal('function');
            done();
        })
    });
});