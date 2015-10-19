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
    });

    // function get(name, callback)
    describe('#get', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                groups.get(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            groups.get(null,function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });

        it('should return an error to callback when entity not found', function (done) {
            groups.get('not_general', function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('the channel, group, or user could not be found');
            });
            done();
        });

        it('should return the group object from the cache', function (done) {
            groups.get('private-group', function (err, results) {
                expect(results).to.be.an('object');
                expect(results.id).to.equal('G0A1B2C3D4');
            });
            done();
        });
    });
});