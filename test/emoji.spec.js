'use strict';

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var emoji = require('./../lib/slack/emoji');
var errors = require('../lib/errors');
var Cache = require('../lib/cache');
var slackTypes = require('./../lib/slack/types');


describe('emoji', function () {

    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.hostname = 'slack.com';

    });

    // function get(name, callback)
    describe('#getList', function () {

        it('exists as method on emoji', function (done) {
            expect(typeof emoji.getList).to.equal('function');
            done();
        });

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                emoji.getList(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an api response', function (done) {
            var scope = nock('https://slack.com')
            .post('/api/emoji.list')
            .reply(200, { ok: true });
            emoji.getList(function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
            });
            done();
        });

        it('should return an api response', function (done) {
            var scope = nock('https://slack.com')
            .post('/api/emoji.list')
            .reply(200, { ok: false, error: 'api error occured' });
            emoji.getList(function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('api error occured');
                done();
            });
        });
    });
});