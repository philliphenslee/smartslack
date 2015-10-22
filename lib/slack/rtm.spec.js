var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var rtm = require('./rtm');
var Cache = require('../cache');


describe('rtm', function () {

    describe('#start', function () {

        before(function () {
            var cache = Cache;
            cache.data = {};
            cache.add({ hostname: 'slack.com' });

        });

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                rtm.start(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an api response', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/rtm.start')
                .reply(200, {ok: true});

            rtm.start(function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });

        });

        it('should return an api error', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/rtm.start')
                .reply(200, {
                    ok: false,
                    error: 'api error'
                });
            rtm.start(function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('api error');
                done();
            });
        });
    });
});