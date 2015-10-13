var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');
var SmartSlack = require('../lib/index.js');

describe('SmartSlack', function () {

	var mockopts =
		{
			token: 'xoxb-11751627585-DYeBN3Zs2yqMrdfmQQWTPUWc',
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

		describe('#apiTest', function () {

			var slackClient = new SmartSlack(mockopts);

			it('exists as a public method on SmartSlack', function () {
				expect(typeof slackClient.apiTest).to.equal('function');
			})

			it('should return the passed arguments', function () {
				nock('https://slack.com')
					.post('/api/api.test')
					.reply(200, {
						"ok": true,
						"args": { "foo": "bar" },
					});

				slackClient.apiTest({ "foo": "bar" },null, function (data) {
					expect(data.args.foo).to.eql('bar');
				});
			});

		});

	});

});