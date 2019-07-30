'use strict';

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var api = require('./../lib/slack/api');
var errors = require('../lib/errors');
var Cache = require('../lib/cache');
var slackTypes = require('./../lib/slack/types');

describe('api', function () {

    // function (method, params, callback)
    describe('#post', function () {

        before(function () {
            var cache = Cache;
            cache.data = {};
            cache.data.hostname = 'slack.com';

        });

        it('should return an error to callback if missing required argument method', function (done) {
            api.post(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });

        it('should return an api response to caller', function (done) {
            var scope = nock('https://slack.com')
                .post('/api/api.test')
                .reply(200, {
                    ok: true,
                    args: { arg1: 'ar1Value' }
                });
            api.post('api.test', null, function (err, result) {
                expect(result).to.be.an('object');
                expect(result.ok).to.equal(true);
                expect(result.args.arg1).to.equal('ar1Value');
            });
            done();
        });

        it('should return an error to caller', function (done) {
            var scope = nock('https://slack.com')
                .post('/api/api.test')
                .reply(200, {
                    ok: false,
                    error: 'API Error'
                });
            api.post('api.test', null, function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('API Error');
                done();
            });

        });

        it('should return an http response errors', function (done) {
            var scope = nock('https://slack.com')
                .post('/api/api.test')
                .reply(500, {
                    ok: false,
                });
            api.post('api.test', null, function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('http response error  500');
                done();
            });

        });
        it('should return an error if unable to parse JSON response', function (done) {
            var scope = nock('https://slack.com')
                .post('/api/api.test')
                .reply(200, '#JSON-CANT_PARSE#');

            api.post('api.test', null, function (err, result) {
                expect(err).to.be.an('error');
                expect(err.message).to.equal('Unexpected token # in JSON at position 0');
                done();
            });

        });
    });
});