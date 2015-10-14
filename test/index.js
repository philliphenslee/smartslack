var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');
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

	describe('#authTest', function () {

		var slackClient = new SmartSlack(mockopts);

		it('exists as a public method on SmartSlack', function (done) {
			expect(typeof slackClient.authTest).to.equal('function');
			done();
		})

		it('should return auth test response', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/auth.test')
				.reply(200, { ok: true }
					);

			slackClient.authTest(function (data) {
				expect(data).to.be.an('object');
				expect(data.ok).to.equal(true);
				done();
			});
		});

	});

	describe('#apiTest', function () {

		var slackClient = new SmartSlack(mockopts);

		it('exists as a public method on SmartSlack', function (done) {
			expect(typeof slackClient.apiTest).to.equal('function');
			done();
		})

		it('should return the passed test arguments', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/api.test')
				.reply(200, {
					ok: true,
					args: { foo: 'bar' }
				});

			slackClient.apiTest(null, function (data) {
				expect(data).to.be.an('object');
				expect(data.args.foo).to.equal('bar');
				done();
			});
		});

	});

	describe('#getActiveChannels', function () {

		var response = {
			"ok": true,
			"channels": [
				{
					"id": "C024BE91L",
					"name": "fun",
					"created": 1360782804,
					"creator": "U024BE7LH",
					"is_archived": false,
					"is_member": false,
					"num_members": 6,
					"topic": {
						"value": "Fun times",
						"creator": "U024BE7LV",
						"last_set": 1369677212
					},
					"purpose": {
						"value": "This channel is for fun",
						"creator": "U024BE7LH",
						"last_set": 1360782804
					}
				}

			]
		}

		var slackClient = new SmartSlack(mockopts);

		it('exists as a public method on SmartSlack', function (done) {
			expect(typeof slackClient.getActiveChannels).to.equal('function');
			done();
		})

		it('should return an array of active Slack channels', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/channels.list')
				.reply(200, response);

			slackClient.getActiveChannels(function (data) {
				expect(data).to.be.an('array');
				expect(data[0].name).to.equal('fun');
				done();
			});
		});

	});

	describe('#getChannelByName', function () {

		var slackClient = new SmartSlack(mockopts);

		slackClient.channels = [
			{
				"id": "C024BE91L",
				"name": "fun",
				"created": 1360782804,
				"creator": "U024BE7LH",
				"is_archived": false,
				"is_member": false,
				"num_members": 6,
				"topic": {
					"value": "Fun times",
					"creator": "U024BE7LV",
					"last_set": 1369677212
				},
				"purpose": {
					"value": "This channel is for fun",
					"creator": "U024BE7LH",
					"last_set": 1360782804
				}
			},
		]

		it('exists as public method on SmartSlack', function (done) {
			expect(typeof slackClient.getChannelByName).to.equal('function');
			done();
		});
		
		it('should check for a valid channel name argument', function(done){
			expect(function () {
				slackClient.getChannelByName();
			}).to.throw('Error missing or invalid required argument');
			done();
		})
		

		it('should return a channel object', function (done) {
			var channel = slackClient.getChannelByName('fun');
			expect(channel).to.be.an('object');
			expect(channel.name).to.equal('fun');
			done();
		})
	});
	
	describe('#getChannelById', function () {

		var slackClient = new SmartSlack(mockopts);

		slackClient.channels = [
			{
				"id": "C024BE91L",
				"name": "fun",
				"created": 1360782804,
				"creator": "U024BE7LH",
				"is_archived": false,
				"is_member": false,
				"num_members": 6,
				"topic": {
					"value": "Fun times",
					"creator": "U024BE7LV",
					"last_set": 1369677212
				},
				"purpose": {
					"value": "This channel is for fun",
					"creator": "U024BE7LH",
					"last_set": 1360782804
				}
			},
		]

		it('exists as public method on SmartSlack', function (done) {
			expect(typeof slackClient.getChannelById).to.equal('function');
			done();
		});
		
		it('should check for a valid channel id argument', function(done){
			expect(function () {
				slackClient.getChannelById();
			}).to.throw('Error missing or invalid required argument');
			done();
		})
		
		it('should return a channel object', function (done) {
			var channel = slackClient.getChannelById('C024BE91L');
			expect(channel).to.be.an('object');
			expect(channel.name).to.equal('fun');
			done();
		})
	});
	
	describe('#getUserByName', function () {

		var slackClient = new SmartSlack(mockopts);

		slackClient.users = [ { id: 'U0BZD3JFH7',
                                name: 'john',
                                real_name: 'John Doe',
                                presence: 'away' }
                            ]

		it('exists as public method on SmartSlack', function (done) {
			expect(typeof slackClient.getUserByName).to.equal('function');
			done();
		});
		
		it('should check for a valid channel id argument', function(done){
			expect(function () {
				slackClient.getUserByName();
			}).to.throw('Error missing or invalid required argument');
			done();
		})
		
		it('should return a user object', function (done) {
			var user = slackClient.getUserByName('john');
			expect(user).to.be.an('object');
			expect(user.id).to.equal('U0BZD3JFH7');
			done();
		})
	});
	
	describe('#getUserById', function () {

		var slackClient = new SmartSlack(mockopts);

		slackClient.users = [ { id: 'U0BZD3JFH7',
                                name: 'john',
                                real_name: 'John Doe',
                                presence: 'away' }
                            ]

		it('exists as public method on SmartSlack', function (done) {
			expect(typeof slackClient.getUserById).to.equal('function');
			done();
		});
		
		it('should check for a valid channel id argument', function(done){
			expect(function () {
				slackClient.getUserById();
			}).to.throw('Error missing or invalid required argument');
			done();
		})
		
		it('should return a user object', function (done) {
			var user = slackClient.getUserById('U0BZD3JFH7');
			expect(user).to.be.an('object');
			expect(user.name).to.equal('john');
			done();
		})
	});
	
	describe('#login', function () {
		
		response = {
			ok: true,
			self: {},
			users: {},
			channels: {},
			ims: {},
			groups: {},
			team: {},
			url: 'ws://localhost'
		}
		
		var scope = nock('https://slack.com')
				.post('/api/rtm.start')
				.reply(200,response);
				
		var slackClient = new SmartSlack(mockopts);	
		
		before(function(done) {
		  slackClient.login();
		  done();	
		});

		it('exists as public method on SmartSlack', function (done) {
			expect(typeof slackClient.login).to.equal('function');
			done();
		});
		
		it('should be authenticated', function (done) {
		  expect(slackClient.authenticated).to.equal(true);	
		  done();
		})
		
	});
	
	describe('#postMessage', function () {

		var slackClient = new SmartSlack(mockopts);
		
		it('should require channel id and text arguments', function(done){
			
			expect(function () {
				slackClient.postMessage();
			}).to.throw('Error missing or invalid required argument');
			done();
		})

		it('should return message response', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/chat.postMessage')
				.reply(200, {
					"ok": true,
                     "ts": "1405895017.000506",
                     "channel": "C024BE91L",
				});

			slackClient.postMessage('123456','message',null, function (data) {
				expect(data).to.be.an('object');
				expect(data.ok).to.equal(true);
				expect(data.channel).to.equal('C024BE91L');
				done();
			});
		});

	});
	
	describe('#openIm', function() {

		var slackClient = new SmartSlack(mockopts);
		
		it('should require a valid user {string} argument', function(done){
			
			expect(function () {
				slackClient.openIm();
			}).to.throw('Error missing or invalid required argument');
			done();
		})

		it('should return a JSON response', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/im.open')
				.reply(200, { ok: true,
                         no_op: true,
                         already_open: true,
                         channel: { id: 'D0BMZB9V3' } 
						 });

			slackClient.openIm('U0BZD3JFH7', function (data) {
				expect(data).to.be.an('object');
				expect(data.ok).to.equal(true);
				expect(data.channel.id).to.equal('D0BMZB9V3');
				done();
				});
			
		});
	    
	})
	
	describe('#_apiCall', function () {

		var slackClient = new SmartSlack(mockopts);

		it('should return the passed test arguments', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/api.test')
				.reply(200, {
					ok: false,
					error: 'Slack API Error!',
					args: { foo: 'bar' }
				});

			slackClient.apiTest(null, function (data) {
				expect(data).to.be.an('object');
				expect(data.ok).to.equal(false);
				done();
			});
		});

	});

});