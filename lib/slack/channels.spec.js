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
    describe('#getChannel', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                channels.getChannel(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            channels.getChannel(null,function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an error to callback when entity not found', function (done) {
            channels.getChannel('not_general', function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('the channel, group, or user could not be found');
            });
            done();
        });

        it('should return the channel object from the cache', function (done) {
            channels.getChannel('general', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.id).to.equal('C0A1B2C3D4');
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

            channels.getLastChannelMessage(null,function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });
    });

    // function get(name, callback)
    describe('#getInfo', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                channels.getInfo(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            channels.getInfo(null,function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });
    });

    // function get(name, callback)
    describe('#getList', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                channels.getList(null);
            }).to.throw('callback must be a function');
            done();
        });
    });

    // function get(name, callback)
    describe('#mark', function () {

        it('should return an error to callback if missing required string argument', function (done) {

            channels.mark(null,null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });
    });

    // function get(name, callback)
    describe('#setPurpose', function () {

        it('should return an error to callback if missing required string argument', function (done) {

            channels.setPurpose(null,null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });
    });

    // function get(name, callback)
    describe('#setTopic', function () {

        it('should return an error to callback if missing required string argument', function (done) {

            channels.setTopic(null,null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });
    });

    after(function () {
        cache = null;
    });
});