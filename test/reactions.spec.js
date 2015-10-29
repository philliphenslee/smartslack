'use strict';

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var reactions = require('./../lib/slack/reactions');
var errors = require('../lib/errors');
var Cache = require('../lib/cache');
var slackTypes = require('./../lib/slack/types');


describe('reactions', function () {


    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.groups = [{id: 'G0A1B2C3D4', name: 'private-group'}];
        cache.data.hostname = 'slack.com';
    });

    // function get(name, callback)
    describe('#add', function () {

        it('exists as method on reactions', function (done) {
            expect(typeof reactions.add).to.equal('function');
            done();
        });


        it('should return an error to callback if missing required string argument', function (done) {

            reactions.add(null, null, null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/reactions.add')
                .reply(200, {ok: true});

            reactions.add('emoji', 'channel', 'timestamp', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });
        });

        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/reactions.add')
                .reply(200, {ok: false, error: 'api error message'});

            reactions.add('emoji', 'channel', 'timestamp', function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('api error message');
                done();
            });
        });
    });
    // function get(name, callback)
    describe('#getReactions', function () {

        it('exists as method on reactions', function (done) {
            expect(typeof reactions.getReactions).to.equal('function');
            done();
        });

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                reactions.getReactions(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            reactions.getReactions(null, null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/reactions.get')
                .reply(200, {ok: true});

            reactions.getReactions('channel', 'timestamp', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });
        });

        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/reactions.get')
                .reply(200, {ok: false, error: 'api error message'});

            reactions.getReactions('channel', 'timestamp', function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('api error message');
                done();
            });
        });
    });
    // function get(name, callback)
    describe('#getList', function () {

        it('exists as method on reactions', function (done) {
            expect(typeof reactions.getList).to.equal('function');
            done();
        });

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                reactions.getList(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            reactions.getList(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/reactions.list')
                .reply(200, {ok: true});

            reactions.getList('user', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });
        });

        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/reactions.list')
                .reply(200, {ok: false, error: 'api error message'});

            reactions.getList('user', function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('api error message');
                done();
            });
        });
    });
    // function get(name, callback)
    describe('#remove', function () {

        it('exists as method on reactions', function (done) {
            expect(typeof reactions.remove).to.equal('function');
            done();
        });


        it('should return an error to callback if missing required string argument', function (done) {

            reactions.remove(null, null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/reactions.remove')
                .reply(200, {ok: true});

            reactions.remove('channel', 'timestamp', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });
        });

        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/reactions.remove')
                .reply(200, {ok: false, error: 'api error message'});

            reactions.remove('channel', 'timestamp', function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('api error message');
                done();
            });
        });
    });
});