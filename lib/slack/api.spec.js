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


    // function (method, params, callback)
    describe('#post', function () {

        before(function () {
            var cache = Cache;
            cache.data = {};
            cache.data.hostname = 'slack.com';

        });

        it('should return an error to callback if missing required argument method', function (done) {
            api.post(null, function (err, results) {
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
            api.post('api.test', null, function (err, results) {
                expect(results).to.be.an('object');
                expect(results.ok).to.equal(true);
                expect(results.arg.foo).to.equal('bars');

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
            api.post('api.test', null, function (err, results) {
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