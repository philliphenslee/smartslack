var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var groups = require('./../lib/slack/groups');
var errors = require('../lib/errors');
var Cache = require('../lib/cache');
var slackTypes = require('./../lib/slack/types');


describe('groups', function () {


    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.groups = [{ id: 'G0A1B2C3D4', name: 'private-group' }];
        cache.data.hostname = 'slack.com';
    });

    // function get(name, callback)
    describe('#getGroup', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                groups.getGroup(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            groups.getGroup(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an error to callback when entity not found', function (done) {
            groups.getGroup('not_general', function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('the channel, group, or user could not be found');
            });
            done();
        });

        it('should return the group object from the cache', function (done) {
            groups.getGroup('private-group', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.id).to.equal('G0A1B2C3D4');
            });
            done();
        });
    });
    // function get(name, callback)
    describe('#getInfo', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                groups.getInfo(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            groups.getInfo(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/groups.info')
                .reply(200, { ok: true });

            groups.getInfo('G0A1B2C34D', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });
        });
        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/groups.info')
                .reply(200, { ok: false, error: 'group_not_found' });

            groups.getInfo('groupid', function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('group_not_found');
                done();
            })
        });
    });

    // function get(name, callback)
    describe('#getList', function () {

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                groups.getList(null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/groups.list')
                .reply(200, { ok: true });

            groups.getList(function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });

        });
        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/groups.list')
                .reply(200, { ok: false, error: 'group_not_found' });

            groups.getList(function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('group_not_found');
                done();
            })
        });
    });

    // function get(name, callback)
    describe('#mark', function () {

        it('should return an error to callback if missing required string argument', function (done) {

            groups.mark(null, null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/groups.mark')
                .reply(200, { ok: true });

            groups.mark('G0A1B2C34D', 'timestamp', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });

        });
        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/groups.mark')
                .reply(200, { ok: false, error: 'group_not_found' });

            groups.mark('groupid', 'timestamp',function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('group_not_found');
                done();
            })
        });
    });

    // function get(name, callback)
    describe('#setPurpose', function () {

        it('should return an error to callback if missing required string argument', function (done) {

            groups.setPurpose(null, null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });
        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/groups.setPurpose')
                .reply(200, { ok: true });

            groups.setPurpose('G0A1B2C34D','purpose', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });

        });
        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/groups.setPurpose')
                .reply(200, { ok: false, error: 'group_not_found' });

            groups.setPurpose('groupid','purpose', function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('group_not_found');
                done();
            })
        });
    });

    // function get(name, callback)
    describe('#setTopic', function () {

        it('should return an error to callback if missing required string argument', function (done) {

            groups.setTopic(null, null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });
        it('should return an api response to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/groups.setTopic')
                .reply(200, { ok: true });

            groups.setTopic('G0A1B2C34D','topic', function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                done();
            });

        });
        it('should return an api error to caller', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/groups.setTopic')
                .reply(200, { ok: false, error: 'group_not_found' });

            groups.setTopic('groupid','topic', function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('group_not_found');
                done();
            })
        });
    });
});