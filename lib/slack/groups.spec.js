var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var groups = require('./groups');
var errors = require('../errors');
var Cache = require('../cache');
var slackTypes = require('./types');


describe('groups', function () {


    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.groups = [{ id: 'G0A1B2C3D4', name: 'private-group' }]
        cache.data.hostname = 'slack.com';
    });

    // function get(name, callback)
    describe('#getGroup', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                groups.getGroup(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            groups.getGroup(null,function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an error to callback when entity not found', function (done) {
            groups.getGroup('not_general', function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('the channel, group, or user could not be found');
            });
            done();
        });

        it('should return the group object from the cache', function (done) {
            groups.getGroup('private-group', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.id).to.equal('G0A1B2C3D4');
            });
            done();
        });
    });
    // function get(name, callback)
    describe('#getInfo', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                groups.getInfo(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            groups.getInfo(null,function (err, result) {
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
                groups.getList(null);
            }).to.throw('callback must be a function');
            done();
        });
    });

    // function get(name, callback)
    describe('#mark', function () {

        it('should return an error to callback if missing required string argument', function (done) {

            groups.mark(null,null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });
    });

    // function get(name, callback)
    describe('#setPurpose', function () {

        it('should return an error to callback if missing required string argument', function (done) {

            groups.setPurpose(null,null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });
    });

    // function get(name, callback)
    describe('#setTopic', function () {

        it('should return an error to callback if missing required string argument', function (done) {

            groups.setTopic(null,null, function (err, result) {
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