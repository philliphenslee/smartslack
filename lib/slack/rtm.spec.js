var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var api = require('./api');
var rtm = require('./rtm');
var errors = require('../errors');
var Cache = require('../cache');
var slackTypes = require('./types');

describe('rtm', function () {


    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.add({ hostname: 'slack.com' });

        var scope = nock('https://slack.com')
            .post('/api/rtm.start')
            .reply(200, {
                ok: true,
                url: 'wss://localhost'
            });
    });

    // function getEntity(slackType, search, callback)
    describe('#start', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                rtm.start(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an api response', function (done) {
            rtm.start(function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                expect(result.arg.url).to.equal('wss://localhost');
            });
            done();
        });
    });
    after(function () {
        cache = null;
        scope = null;
    });
});