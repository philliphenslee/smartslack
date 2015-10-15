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
			});
			done();
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
			});
			done();
		});
	});
	
	describe('#addReaction', function () {

		var slackClient = new SmartSlack(mockopts);

		it('exists as a public method on SmartSlack', function (done) {
			expect(typeof slackClient.getActiveGroups).to.equal('function');
			done();
		})
		
		it('should check for a valid arguments', function(done){
			expect(function () {
				slackClient.addReaction();
			}).to.throw('Error missing or invalid required argument');
			done();
		})

		it('should return api response', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/reactions.add')
				.reply(200,{ok: true});

			slackClient.addReaction('emoji','channel','timestamp', function (data) {
				expect(data).to.be.an('object');
				expect(data.ok).to.equal(true);
			});
			done();
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
					// ...
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

			slackClient.getActiveChannels(function (err, data) {
				expect(data).to.be.an('array');
				expect(data[0].name).to.equal('fun');	
			});
			done();
		});

	});
	
	
	describe('#getActiveGroups', function () {

		var response = {
			"ok": true,
			"groups": [
				{
					"id": "C024BE91L",
					"name": "special group",
					"created": 1360782804,
					"creator": "U024BE7LH"
				}
				// ...
			]
		}

		var slackClient = new SmartSlack(mockopts);

		it('exists as a public method on SmartSlack', function (done) {
			expect(typeof slackClient.getActiveGroups).to.equal('function');
			done();
		})

		it('should return an array of active Slack groups', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/groups.list')
				.reply(200, response);

			slackClient.getActiveGroups(function (err, data) {
				expect(data).to.be.an('array');
				expect(data[0].name).to.equal('special group');
			});
			done();
		});

	});


	describe('#getChannelByName', function () {

		var slackClient = new SmartSlack(mockopts);

		slackClient.channels = [
			{
				"id": "C024BE91L",
				"name": "fun",
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
			slackClient.getChannelByName('fun', function (err, channel) {
				expect(channel).to.be.an('object');
				expect(channel.name).to.equal('fun');
			});
			done();
		});
		
	});
	
	describe('#getChannelById', function () {

		var slackClient = new SmartSlack(mockopts);

		slackClient.channels = [
			{
				"id": "C024BE91L",
				"name": "fun",
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
			slackClient.getChannelById('fun', function (err, channel) {
				expect(channel).to.be.an('object');
				expect(channel.id).to.equal('C024BE91L');
			});
			done();
		});
	});
	
	describe('#getGroupById', function () {

		var slackClient = new SmartSlack(mockopts);

		slackClient.groups = [ { id: 'G0BC7NYJ0',
								name: 'groupname',
								is_group: true,
						      } ]

		it('exists as public method on SmartSlack', function (done) {
			expect(typeof slackClient.getGroupById).to.equal('function');
			done();
		});
		
		it('should check for a valid group id argument', function(done){
			expect(function () {
				slackClient.getGroupById();
			}).to.throw('Error missing or invalid required argument');
			done();
		})
		
		it('should return a group object', function (done) {
			slackClient.getGroupById('G0BC7NYJ0', function (err, group) {
				expect(group).to.be.an('object');
				expect(group.name).to.equal('groupname');
			});

			done();
		});
	});
	
	describe('#getLastChannelMessage', function () {

		var slackClient = new SmartSlack(mockopts);
		
		var response = {
			"ok": true,
			"latest": "1358547726.000003",
			"messages": [
				{
					"type": "message",
					"ts": "1358546515.000008",
					"user": "U2147483896",
					"text": "Hello"
				}
			],
			"has_more": false
		}

		
        it('exists as public method on SmartSlack', function (done) {
			expect(typeof slackClient.getLastChannelMessage).to.equal('function');
			done();
		});
		
		it('should check for a valid channel argument', function(done){
			expect(function () {
				slackClient.getLastChannelMessage();
			}).to.throw('Error missing or invalid required argument');
			done();
		})
		
		it('should return a channel object', function (done) {
			
			var scope = nock('https://slack.com')
				.post('/api/channels.history')
				.reply(200, response);
				
			var channel = slackClient.getLastChannelMessage('C024BE91L', function(data) {
				expect(data).to.be.an('object');
				expect(data.ok).to.equal(true);
				expect(data.messages[0].text).to.equal('Hello');
			});
			
			done();
		})
	});
	
	describe('#getPresence', function () {

		var slackClient = new SmartSlack(mockopts);
		
		it('should require valid user {object} argument', function(done){
			
			expect(function () {
				slackClient.getPresence();
			}).to.throw('Error missing or invalid required argument');
			done();
		})

		it('should return API message response', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/users.getPresence')
				.reply(200, { ok: true, presence: 'active' });

			slackClient.getPresence('away', function (data) {
				expect(data).to.be.an('object');
				expect(data.ok).to.equal(true);
				expect(data.presence).to.equal('active');
			});
			done();
		});

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
		
		it('should check for a valid name argument', function(done){
			expect(function () {
				slackClient.getUserByName();
			}).to.throw('Error missing or invalid required argument');
			done();
		})
		
		it('should return a user object', function (done) {
			slackClient.getUserByName('john', function (err, user) {
				expect(user).to.be.an('object');
				expect(user.id).to.equal('U0BZD3JFH7');
			});

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
			    slackClient.getUserById('U0BZD3JFH7', function (err, user) {
				expect(user).to.be.an('object');
				expect(user.name).to.equal('john');
			});

			done();
		});
	});
	
	describe('#getUserList', function () {

		var response = {
			"ok": true,
			"members": [
				{
					"id": "U023BECGF",
					"name": "john",
					"deleted": false,
					"color": "9f69e7",
				}
				// ...
			]
		}

		var slackClient = new SmartSlack(mockopts);

		it('exists as a public method on SmartSlack', function (done) {
			expect(typeof slackClient.getUsersList).to.equal('function');
			done();
		})

		it('should return an array of active Slack users', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/users.list')
				.reply(200, response);

			slackClient.getUsersList(function (data) {
				expect(data).to.be.an('array');
				expect(data[0].name).to.equal('john');
			});
			done();
		});

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
	
	describe('#onRtmEvent', function () {

		var slackClient = new SmartSlack(mockopts);

		it('exists as a method on SmartSlack', function (done) {
			expect(typeof slackClient._onRtmEvent).to.equal('function');
			done();
		})

	});
	
	describe('#postMessage', function () {

		var slackClient = new SmartSlack(mockopts);
		slackClient.user = {name: 'botname'};
		
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

			slackClient.postMessage('123456','message',function (err, data) {
				expect(data).to.be.an('object');
				expect(data.ok).to.equal(true);
				expect(data.channel).to.equal('C024BE91L');
			});
			done();
		});

	});
	
	describe('#postMessageToChannel', function () {

		var slackClient = new SmartSlack(mockopts);
		slackClient.user = {name: 'botname'};
		
		it('should require username and text arguments', function(done){
			
			expect(function () {
				slackClient.postMessageToChannel();
			}).to.throw('Error missing or invalid required argument');
			done();
		})

		it('should return error entity name not found', function (done) {

			slackClient.postMessageToGroup('channel', 'message',function (err, data) {
				expect(err).to.be.an('string');
				expect(err).to.equal('Error entity name not found');
			});
			done();
		});

	});
	
	describe('#postMessageToGroup', function () {

		var slackClient = new SmartSlack(mockopts);
		slackClient.user = {name: 'botname'};
		
		it('should require username and text arguments', function(done){
			
			expect(function () {
				slackClient.postMessageToGroup();
			}).to.throw('Error missing or invalid required argument');
			done();
		})

		it('should return error entity name not found', function (done) {

			slackClient.postMessageToGroup('group', 'message',function (err, data) {
				expect(err).to.be.an('string');
				expect(err).to.equal('Error entity name not found');
			});
			done();
		});

	});
	
	describe('#postMessageToUser', function () {

		var slackClient = new SmartSlack(mockopts);
		slackClient.user = {name: 'botname'};
		
		it('should require username and text arguments', function(done){
			
			expect(function () {
				slackClient.postMessageToUser();
			}).to.throw('Error missing or invalid required argument');
			done();
		})

		it('should return error entity name not found', function (done) {

			slackClient.postMessageToUser('user','message',function (err, data) {
				expect(err).to.be.an('string');
				expect(err).to.equal('Error entity name not found');
				//expect(data.channel).to.equal('D0B65PJRH');
			});
			done();
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
				});
			done();
		});
	    
	})
	
	describe('#setPresence', function () {

		var slackClient = new SmartSlack(mockopts);
		
		it('should require valid presence {string} argument', function(done){
			
			expect(function () {
				slackClient.setPresence();
			}).to.throw('Error missing or invalid required argument');
			done();
		})

		it('should return message response', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/users.setPresence')
				.reply(200, {
					"ok": true,
				});

			slackClient.setPresence('away', function (data) {
				expect(data).to.be.an('object');
				expect(data.ok).to.equal(true);
			});
			done();
		});

	});
	
	describe('#_canResolve', function () {

		var slackClient = new SmartSlack(mockopts);

		it('should return a boolean', function (done) {
			slackClient._canResolve(function (value) {
				expect(value).to.equal(true);
			});
			done();
		})

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
			});
			done();
		});

	});

});