var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var users = require('./users');
var errors = require('../errors');
var Cache = require('../cache');
var slackTypes = require('./types');


describe('users', function () {


    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.users = [{ id: 'U0A1B2C3D4', name: 'phillip' }]
    });

    // function get(name, callback)
    describe('#getUser', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                users.getUser(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            users.getUser(null,function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an error to callback when entity not found', function (done) {
            users.getUser('not_general', function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('the channel, group, or user could not be found');
            });
            done();
        });

        it('should return the channel object from the cache', function (done) {
            users.getUser('phillip', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.id).to.equal('U0A1B2C3D4');
            });
            done();
        });
    });
    after(function () {
        cache = null;
    });
});