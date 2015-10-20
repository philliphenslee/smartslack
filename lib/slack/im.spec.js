var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var im = require('./im');
var errors = require('../errors');
var Cache = require('../cache');
var slackTypes = require('./types');


describe('im', function () {


    before(function () {
        var cache = Cache;
        cache.data = {};
        cache.data.channels = [{ id: 'C0A1B2C3D4', name: 'general' }]
    });

    // function get(name, callback)
    describe('#open', function () {

        it('exists as method on im', function (done) {
            expect(typeof im.open).to.equal('function');
            done();
        })

        it('should throw and error without a valid callback', function (done) {
            expect(function () {
                im.open(null, null);
            }).to.throw('callback must be a function');
            done();
        });

        it('should return an error to callback if missing required string argument', function (done) {

            im.open(null, function (err, results) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('missing or invalid required argument(s)');
            });
            done();
        });
    });
});