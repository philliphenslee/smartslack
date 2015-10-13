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

	var mockopts_invalidToken =
		{
			token: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		};

	describe('constructor', function () {

		it('can be constructed', function (done) {

			var slackClient = new SmartSlack(mockopts);
			slackClient.should.be.an('object');
			done();

		})

		it('should require an options object', function (done) {

			expect(function () {
				new SmartSlack();
			}).to.throw('Error missing required argument object options');

			done();

		});

		it('should respect its options', function (done) {

			var slackClient = new SmartSlack(mockopts);
			slackClient.should.have.property('options');
			slackClient.options.should.be.an('object');
			slackClient.options.token.should.be.a('string');
			done();
		});

		it('should validate token', function (done) {

			expect(function () {
				new SmartSlack(mockopts_invalidToken);
			}).to.throw('Error invalid access token, please provide a valid token.');

			done();

		});

	});

});