var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var team = require('./team');
var errors = require('../errors');
var Cache = require('../cache');
var slackTypes = require('./types');


describe('team', function () {

    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.hostname = 'slack.com';

        var scope = nock('https://slack.com')
            .post('/api/team.info')
            .reply(200, { ok: true });

    });

    // function get(name, callback)
    describe('#getInfo', function () {

        it('exists as method on team', function (done) {
            expect(typeof team.getInfo).to.equal('function');
            done();
        })

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                team.getInfo(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an api response', function (done) {
            team.getInfo(function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);

            });
            done();
        });
    });
    after(function () {
        cache = null;
    })
});