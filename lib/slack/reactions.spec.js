var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var reactions = require('./reactions');
var errors = require('../errors');
var Cache = require('../cache');
var slackTypes = require('./types');


describe('reactions', function () {


    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.groups = [{ id: 'G0A1B2C3D4', name: 'private-group' }]
        cache.data.hostname = 'slack.com';
    });

    // function get(name, callback)
    describe('#add', function () {

        it('should return an error to callback if missing required string argument', function (done) {

            reactions.add(null,null,null,function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });
    });
    after(function () {
        cache = null;
    });
});