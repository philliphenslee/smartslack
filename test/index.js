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
			}).to.throw('Invalid access token, please provide a valid token.');

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

			slackClient.authTest(function (err, data) {
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

        it('should validate passed arguments', function(done) {
            slackClient.apiTest(null, function(err,result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

		it('should return the passed test arguments', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/api.test')
				.reply(200, {
					ok: true,
					args: { foo: 'bar' }
				});

			slackClient.apiTest('api.test', function (err, data) {
				expect(data).to.be.an('object');
				expect(data.args.foo).to.equal('bar');
			});
			done();
		});
	});

	describe('#addReaction', function () {

		var slackClient = new SmartSlack(mockopts);

		it('exists as a public method on SmartSlack', function (done) {
			expect(typeof slackClient.addReaction).to.equal('function');
			done();
		})
        it('should validate passed arguments', function(done) {
            slackClient.addReaction(null, function(err,result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

		it('should return api response', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/reactions.add')
				.reply(200,{ok: true});

			slackClient.addReaction('emoji','channel','timestamp', function (err, data) {
				expect(data).to.be.an('object');
				expect(data.ok).to.equal(true);
			});
			done();
		});
	});

    describe('#getChannel', function () {

		var slackClient = new SmartSlack(mockopts);

		slackClient.channels = [
			{
				"id": "C024BE91L",
				"name": "fun",
			},
		]

		it('exists as public method on SmartSlack', function (done) {
			expect(typeof slackClient.getChannel).to.equal('function');
			done();
		});

        it('should validate passed arguments', function(done) {
            slackClient.getChannel(null, function(err,result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

		it('should return a channel object', function (done) {
			slackClient.getChannel('fun', function (err, result) {
				expect(result).to.be.an('object');
				expect(result.name).to.equal('fun');
			});
			done();
		});

	});

	describe('#getChannelList', function () {

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
			expect(typeof slackClient.getChannel).to.equal('function');
			done();
		})

		it('should return an array of active Slack channels', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/channels.list')
				.reply(200, response);

			slackClient.getChannelList(function (err, data) {
				expect(data).to.be.an('array');
				expect(data[0].name).to.equal('fun');
			});
			done();
		});

	});

    describe('#getGroup', function () {

		var slackClient = new SmartSlack(mockopts);

		slackClient.groups = [
			{
				"id": "G024BE91L",
				"name": "special-group",
			},
		]

		it('exists as public method on SmartSlack', function (done) {
			expect(typeof slackClient.getGroup).to.equal('function');
			done();
		});

        it('should validate passed arguments', function(done) {
            slackClient.getGroup(null, function(err,result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

		it('should return a group object', function (done) {
			slackClient.getGroup('special-group', function (err, result) {
				expect(result).to.be.an('object');
				expect(result.id).to.equal('G024BE91L');
			});
			done();
		});

	});


	describe('#getGroupList', function () {

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
			expect(typeof slackClient.getGroupList).to.equal('function');
			done();
		})

		it('should return an array of active Slack groups', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/groups.list')
				.reply(200, response);

			slackClient.getGroupList(function (err, data) {
				expect(data).to.be.an('array');
				expect(data[0].name).to.equal('special group');
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

         it('should validate passed arguments', function(done) {
            slackClient.getLastChannelMessage(null, function(err,result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

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

    describe('#getImChannelId', function () {

		var slackClient = new SmartSlack(mockopts);

        slackClient.ims = [ { id: 'D0BN0UDLG',
                              is_im: true,
                              user: 'U023BECGF'}
                          ]
        slackClient.users = [
				{
					"id": "U023BECGF",
					"name": "john"
				}
				// ...
			]

		it('exists as public method on SmartSlack', function (done) {
			expect(typeof slackClient.getImChannelId).to.equal('function');
			done();
		});

        it('should validate passed arguments', function(done) {
            slackClient.getImChannelId(null, function(err,result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

		it('should return a channel object', function (done) {
			slackClient.getImChannelId('john', function (err, result) {
				expect(result).to.be.an('string');
				expect(result).to.equal('D0BN0UDLG');
			});
			done();
		});

	});

    describe('#getUser', function () {

		var slackClient = new SmartSlack(mockopts);

		slackClient.users = [ { id: 'U0BZD3JFH7',
                                name: 'john',
                                real_name: 'John Doe',
                                presence: 'away' }
                            ]

		it('exists as public method on SmartSlack', function (done) {
			expect(typeof slackClient.getUser).to.equal('function');
			done();
		});

         it('should validate passed arguments', function(done) {
            slackClient.getUser(null, function(err,result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

		it('should return a user object', function (done) {
			slackClient.getUser('john', function (err, user) {
				expect(user).to.be.an('object');
				expect(user.id).to.equal('U0BZD3JFH7');
			});

			done();
		})
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
			expect(typeof slackClient.getUserList).to.equal('function');
			done();
		})

		it('should return an array of active Slack users', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/users.list')
				.reply(200, response);

			slackClient.getUserList(function (data) {
				expect(data).to.be.an('array');
				expect(data[0].name).to.equal('john');
			});
			done();
		});

	});

    describe('#getUserPresence', function () {

		var slackClient = new SmartSlack(mockopts);

        it('should validate passed arguments', function (done) {
            slackClient.getUserPresence(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

		it('should return API message response', function (done) {

			var scope = nock('https://slack.com')
				.post('/api/users.getPresence')
				.reply(200, { ok: true, presence: 'active' });

			slackClient.getUserPresence('user', function (data) {
				expect(data).to.be.an('object');
				expect(data.ok).to.equal(true);
				expect(data.presence).to.equal('active');
			});
			done();
		});

	});

	describe('#login', function () {

		var response = {
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

		it('should have web socket url', function (done) {
		  expect(slackClient._socketUrl).to.equal('ws://localhost');
		  done();
		})

	});

	describe('#openIm', function() {

		var slackClient = new SmartSlack(mockopts);

        it('should validate passed arguments', function (done) {
            slackClient.openIm(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

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

	});

    describe('#postMessage', function () {

		var slackClient = new SmartSlack(mockopts);
		slackClient.user = {name: 'botname'};

        it('should validate passed arguments', function (done) {
            slackClient.postMessage(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

         it('should return the api response', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/chat.postMessage')
                .reply(200, { ok: true,
                              channel: 'D0BMZB9V3',
                             });

            slackClient.postMessage('channel','message', function (err, results) {
                expect(results).to.be.an('object');
                expect(results.ok).to.equal(true);
            });
            done();
        });

	});

    describe('#postDirectMessage', function () {

		var slackClient = new SmartSlack(mockopts);
        slackClient.user = {name: 'botname'};
		slackClient.ims = [ { id: 'D0BN0UDLG',
                              is_im: true,
                              user: 'U023BECGF'}
                          ]
        slackClient.users = [
				{
					"id": "U023BECGF",
					"name": "john"
				}
				// ...
			]

        it('should validate passed arguments', function (done) {
            slackClient.postDirectMessage(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

         it('should return the api response', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/chat.postMessage')
                .reply(200, { ok: true,
                              channel: 'D0BMZB9V3',
                             });

            slackClient.postDirectMessage('john','message', function (err, results) {
                expect(results).to.be.an('object');
                expect(results.ok).to.equal(true);
            });
            done();
        });

	});


	describe('#setPresence', function () {

		var slackClient = new SmartSlack(mockopts);

         it('should validate passed arguments', function(done) {
            slackClient.setPresence('invalidstatus', function(err,result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
         });

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

    describe('#sendToChannel', function () {

        var slackClient = new SmartSlack(mockopts);

        it('should validate passed arguments', function (done) {
            slackClient.sendToChannel(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

    });

    describe('#sendToGroup', function () {

        var slackClient = new SmartSlack(mockopts);

        it('should validate passed arguments', function (done) {
            slackClient.sendToGroup(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

    });

    describe('#sendToUser', function () {

        var slackClient = new SmartSlack(mockopts);

        it('should validate passed arguments', function (done) {
            slackClient.sendToUser(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

    });

    describe('#_apiCall', function () {

        var slackClient = new SmartSlack(mockopts);

        it('should validate passed arguments', function (done) {
            slackClient._apiCall(null, function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('Missing or invalid required argument(s)');
            });
            done();
        });

        it('should return the passed test arguments', function (done) {

            var scope = nock('https://slack.com')
                .post('/api/api.test')
                .reply(200, {
                    ok: false,
                    error: 'Slack API Error!',
                    args: { foo: 'bar' }
                });

            slackClient.apiTest('api.test', function (data) {
                expect(data).to.be.an('object');
                expect(data.ok).to.equal(false);
            });
            done();
        });

    });

});