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

        it('exists as method on reactions', function (done) {
            expect(typeof reactions.add).to.equal('function');
            done();
        })


        it('should return an error to callback if missing required string argument', function (done) {

            reactions.add(null,null,null,function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });
    });
    // function get(name, callback)
    describe('#getReactions', function () {

        it('exists as method on reactions', function (done) {
            expect(typeof reactions.getReactions).to.equal('function');
            done();
        })


        it('should return an error to callback if missing required string argument', function (done) {

            reactions.add(null,null,null,function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });
    });
    // function get(name, callback)
    describe('#getList', function () {

        it('exists as method on reactions', function (done) {
            expect(typeof reactions.getList).to.equal('function');
            done();
        })


        it('should return an error to callback if missing required string argument', function (done) {

            reactions.getList(null,function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });
    });
    // function get(name, callback)
    describe('#remove', function () {

        it('exists as method on reactions', function (done) {
            expect(typeof reactions.remove).to.equal('function');
            done();
        })


        it('should return an error to callback if missing required string argument', function (done) {

            reactions.remove(null,null,function (err, result) {
                expect(err).to.not.equal(null);
                expect(err.message).to.equal('must supply valid argument(s)');
            });
            done();
        });
    });
    after(function () {
        cache = null;
    });
});