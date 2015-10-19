var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var SmartSlack = require('../lib/index.js');

describe('SmartSlack', function () {

    var mockopts =
        {
            token: 'xxxx-01234567890-ABCDEFGHIJKLMNOPQRSTUVWX',
            autoReconnect: true
        };

    var mockopts_invalid_token =
        {
            token: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        };

    describe('constructor', function () {

        it('can be constructed', function (done) {
            var slackClient = new SmartSlack(mockopts);
            slackClient.should.be.an('object');
            done();
        })

        it('should validate required options arguments', function (done) {
            expect(function () {
                // No options
                new SmartSlack(null);
            }).to.throw('missing required argument object options');
            done();
        });

        it('should validate required token option', function (done) {

            expect(function () {
                // Bad token
                new SmartSlack(mockopts_invalid_token);
            }).to.throw('invalid access token, please provide a valid token.');

            done();
        });
    });
});