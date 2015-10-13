var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var SmartSlack = require('../lib/index.js');

describe('SmartSlack', function () {

	it('should require an options object', function (done) {

		expect(function () {
			new SmartSlack();
		}).to.throw('Error missing required argument object options');

		done();

	});

	it('the options should include a valid token', function (done) {

		expect(function () {
			
			// Invalid token  
			var options = {token: 'xxb-11751627585-DYeBN3Zs2yqMrdfmQQWTPUW'};
			new SmartSlack(options);
		}).to.throw('Error invalid access token, please provide a valid token.');

		done();
	});

});