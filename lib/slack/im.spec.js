var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var im = require('./im');
var errors = require('../errors');
var Cache = require('../cache');
var slackTypes = require('./types');


describe('im', function () {



    // function get(name, callback)
    describe('#close', function () {

        before(function () {
            var cache = Cache;
            cache.data = {};
            cache.data.hostname = 'slack.com';

        });

        it('exists as method on im', function (done) {
            expect(typeof im.close).to.equal('function');
            done();
        })

        it('should return an error to callback if missing required string argument', function (done) {

            im.close(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            im.close(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/im.close')
                .reply(200, { ok: true });

            im.close('channelid', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });


        });
    });

    // function get(name, callback)
    describe('#getList', function () {

        before(function () {
            var cache = Cache;
            cache.data = {};
            cache.data.hostname = 'slack.com';

        });


        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                im.getList(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/im.list')
                .reply(200, { ok: true });

            im.getList(function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });


        });
    });

    // function get(name, callback)
    describe('#getHistory', function () {

        before(function () {
            var cache = Cache;
            cache.data = {};
            cache.data.hostname = 'slack.com';

        });


        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                im.getHistory(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/im.history')
                .reply(200, { ok: true });

            im.getHistory('channelid', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });


        });
    });

    // function get(name, callback)
    describe('#mark', function () {

        before(function () {
            var cache = Cache;
            cache.data = {};
            cache.data.hostname = 'slack.com';

        });


        it('should return an error to callback if missing required string argument', function (done) {

            im.mark(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/im.mark')
                .reply(200, { ok: true });

            im.mark('channel', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });
        });
    });


    // function get(name, callback)
    describe('#open', function () {

        before(function () {
            var cache = Cache;
            cache.data = {};
            cache.data.hostname = 'slack.com';

        });

        it('exists as method on im', function (done) {
            expect(typeof im.open).to.equal('function');
            done();
        })

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                im.open(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            im.open(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/im.open')
                .reply(200, { ok: true });

            im.open('user', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });
        });
    });
});