var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var test = require('./test');
var errors = require('../errors');
var Cache = require('../cache');
var slackTypes = require('./types');

describe('test', function () {

    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.token = { token: 'xoxo-01234567890-ABCDEFGHIJKLMNOPQRSTUVWX' };
        cache.data.hostname = 'slack.com';

    });

    // function (method, params, callback)
    describe('#api', function () {

        before(function () {

            var scope = nock('https://slack.com')
                .post('/api/api.test')
                .reply(200, { ok: true, args: { foo: 'bar' } });
        });

        it('exists as method on test', function (done) {
            expect(typeof test.api).to.equal('function');
            done();
        })

        it('should return an error to callback if missing required arguments', function (done) {
            test.api(null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });

        it('should return an api response', function (done) {
            test.api({ foo: 'bar' }, function (err, results) {
                expect(results).to.be.an('object');
                expect(results.ok).to.equal(true);
                expect(results.args.foo).to.equal('bar');
                done();
            });


        });
    });

    // function (method, params, callback)
    describe('#auth', function () {

        beforeEach(function () {

            var scope = nock('https://slack.com')
                .post('/api/auth.test')
                .reply(200, {
                    ok: true,
                });
        });

        it('exists as method on test', function (done) {
            expect(typeof test.auth).to.equal('function');
            done();
        })

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                test.auth(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an api response', function (done) {
            test.auth(function (err, results) {
                expect(results).to.be.an('object');
                expect(results.ok).to.equal(true);
                done();
            });

        });
    });
    after(function () {
        cache = null;
        scope = null;
    });
});