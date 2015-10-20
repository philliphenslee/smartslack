var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var emoji = require('./emoji');
var errors = require('../errors');
var Cache = require('../cache');
var slackTypes = require('./types');


describe('emoji', function () {

    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.hostname = 'slack.com';

        var scope = nock('https://slack.com')
            .post('/api/emoji.list')
            .reply(200, { ok: true });

    });

    // function get(name, callback)
    describe('#getList', function () {

        it('exists as method on emoji', function (done) {
            expect(typeof emoji.getList).to.equal('function');
            done();
        })

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                emoji.getList(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an api response', function (done) {
            emoji.getList(function (err, results) {
                expect(results).to.be.an('object');
                expect(results.ok).to.equal(true);
                done();
            });
        });
    });
    after(function () {
        cache = null;
    })
});