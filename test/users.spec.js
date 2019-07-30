'use strict';

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var users = require('./../lib/slack/users');
var errors = require('../lib/errors');
var Cache = require('../lib/cache');
var slackTypes = require('./../lib/slack/types');


describe('users', function () {


    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.hostname = 'slack.com';
        cache.data.users = [{ id: 'U0A1B2C3D4', name: 'phillip' },
            { id: 'U0E1F2G3H4', name: 'steve' }];
        cache.data.ims = [{ id: 'D0A1B2C3D4', user: 'U0A1B2C3D4' }];
    });

    // function get(name, callback)
    describe('#getUser', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                users.getUser(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            users.getUser(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an error to callback when entity not found', function (done) {
            users.getUser('not_general', function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('the channel, group, or user could not be found');
            });
            done();
        });

        it('should return the channel object from the cache', function (done) {
            users.getUser('phillip', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.id).to.equal('U0A1B2C3D4');
            });
            done();
        });
    });
    // function get(name, callback)
    describe('#getImChannel', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                users.getImChannel(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            users.getImChannel(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an existing im channel from cache', function (done) {

            users.getImChannel('U0A1B2C3D4', function (err, result) {
                expect(result).to.equal('D0A1B2C3D4');
            });
            done();
        });

        it('should open im channel by username if not found in cache', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/im.open')
                .reply(200, { ok: true, channel: { id: "D024BFF1M" } });

            users.getImChannel('steve', function (err, result) {
                expect(result).to.equal('D024BFF1M');
                done();
            });

        });

        it('should open im channel by id if not found in cache', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/im.open')
                .reply(200, { ok: true, channel: { id: "D024BFF1M" } });

            users.getImChannel('U0E1F2G3H4', function (err, result) {
                expect(result).to.equal('D024BFF1M');
                done();
            });

        });

        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/im.open')
                .reply(200, { ok : false, error: 'user_not_found' });

            users.getImChannel('U0E1F2G3H4', function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('user_not_found');
                done();
            });
        });

        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/im.open')
                .reply(200, { ok : false, error: 'user_not_found' });

            users.getImChannel('steve', function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('user_not_found');
                done();
            });
        });

    });
    // function get(name, callback)
    describe('#getList', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                users.getList(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should open channel by id if not found in cache', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/users.list')
                .reply(200, { ok: true });

            users.getList(true, function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });
        });
        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/users.list')
                .reply(200, { ok: false, error: 'user_not_found' });

            users.getList(function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('user_not_found');
                done();
            });
        });

    });

    // function get(name, callback)
    describe('#getPresence', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                users.getPresence(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            users.getPresence(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return users presence from api', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/users.getPresence')
                .reply(200, { ok: true });

            users.getPresence('user', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });

        });
        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/users.getPresence')
                .reply(200, { ok: false, error: 'user_not_found' });

            users.getPresence('U0E1F2G3H4', function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('user_not_found');
                done();
            });
        });

    });
    // function get(name, callback)
    describe('#getInfo', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                users.getInfo(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            users.getInfo(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return users presence from api', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/users.info')
                .reply(200, { ok: true });

            users.getInfo('user', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });

        });
        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/users.info')
                .reply(200, { ok: false, error: 'user_not_found' });

            users.getInfo('U0E1F2G3H4', function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('user_not_found');
                done();
            });
        });

    });
    // function get(name, callback)
    describe('#setPresence', function () {

        it('should return an error to callback if missing required string argument', function (done) {
            users.setPresence(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
                done();
            });
        });

        it('should return api response', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/users.setPresence')
                .reply(200, { ok: true });

            users.setPresence('away', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });

        });
        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/users.setPresence')
                .reply(200, { ok: false, error: 'account_inactive' });

            users.setPresence('auto', function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('account_inactive');
                done();
            });
        });
    });
});