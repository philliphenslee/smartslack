var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

describe('cache', function () {

    it('should be a singleton', function (done) {
        var cache1 = require('./cache');
        var cache2 = require('./cache');
        expect(cache1).to.equal(cache2);
        done();
    });
});