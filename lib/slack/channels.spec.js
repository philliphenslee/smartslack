var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var channels = require('./channels');
var errors = require('../errors');
var Cache = require('../cache');
var slackTypes = require('./types');


describe('channels', function () {


    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.channels = [{ id: 'C0A1B2C3D4', name: 'general' }]
        cache.data.hostname = 'slack.com';
    });

    // function get(name, callback)
    describe('#get', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                channels.get(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            channels.get(null,function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });

        it('should return an error to callback when entity not found', function (done) {
            channels.get('not_general', function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('the channel, group, or user could not be found');
            });
            done();
        });

        it('should return the channel object from the cache', function (done) {
            channels.get('general', function (err, results) {
                expect(results).to.be.an('object');
                expect(results.id).to.equal('C0A1B2C3D4');
            });
            done();
        });
    });

    // function get(name, callback)
    describe('#getLastChannelMessage', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                channels.getLastChannelMessage(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            channels.getLastChannelMessage(null,function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });
    });

    // function get(name, callback)
    describe('#info', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                channels.info(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            channels.info(null,function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });
    });

    // function get(name, callback)
    describe('#list', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                channels.list(null);
            }).to.throw('callback must be a function');
            done();
        });
    });

    // function get(name, callback)
    describe('#mark', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                channels.mark(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            channels.mark(null,null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });
    });

    // function get(name, callback)
    describe('#setPurpose', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                channels.setPurpose(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            channels.setPurpose(null,null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });
    });

    // function get(name, callback)
    describe('#setTopic', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                channels.setTopic(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            channels.setTopic(null,null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });
    });

    after(function () {
        cache = null;
    });
});