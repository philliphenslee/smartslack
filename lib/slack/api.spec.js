var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var api = require('./api');
var errors = require('../errors');
var Cache = require('../cache');
var slackTypes = require('./types');

describe('api', function () {


    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.users = [{ id: 'U0A1B2C3D4', name: 'phillip' }]
    });

    // function getEntity(slackType, search, callback)
    describe('#getEntity', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                api.getEntity(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string arguments', function (done) {

            api.getEntity(null,null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });

        it('should return an error to callback when entity not found', function (done) {
            api.getEntity(slackTypes.USER, 'johndoe', function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('the channel, group, or user could not be found');
            });
            done();
        });

        it('should return the user object from the cache', function (done) {
            api.getEntity(slackTypes.USER, 'phillip', function (err, results) {
                expect(results).to.be.an('object');
                expect(results.id).to.equal('U0A1B2C3D4');
            });
            done();
        });
    });

    // function (method, params, callback)
    describe('#post', function () {

        before(function () {
            var cache = Cache;
            cache.data = {};
            cache.data.hostname = 'api.slack.com';
            
             var scope = nock('https://slack.com')
    			.post('/api/api.test')
    			.reply(200, {
    				ok: true,
    				args: { foo: 'bar' }
    			});

        });

        it('should return an error to callback if missing required argument method', function (done) {
            api.post(null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });

        it('should return an api response', function (done) {
            api.post('api.test', null, function (err, results) {
                expect(results).to.be.an('object');
                expect(results.ok).to.equal(true);
                expect(results.arg.foo).to.equal('bar');
            });
            done();
        });
    });
});