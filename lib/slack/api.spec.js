var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var api = require('./api');
var errors = require('../errors');
var Cache = require('../cache');
var slackTypes = require('./types');

describe('api', function () {

    // function (method, params, callback)
    describe('#post', function () {

        before(function () {
            var cache = Cache;
            cache.data = {};
            cache.data.hostname = 'slack.com';

        });

        it('should return an error to callback if missing required argument method', function (done) {
            api.post(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an api response to caller', function (done) {
            var scope = nock('https://slack.com')
                .post('/api/api.test')
                .reply(200, {
                    ok: true,
                    args: { foo: 'bar' }
                });
            api.post('api.test', null, function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                expect(result.arg.foo).to.equal('bars');
            });
            done();
        });

        it('should return an error to caller', function (done) {
            var scope = nock('https://slack.com')
                .post('/api/api.test')
                .reply(200, {
                    ok: false,
                    error: 'API Error'
                });
            api.post('api.test', null, function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('API Error');
                done();
            });

        });
    });

    after(function () {
        cache = null;
    });
});