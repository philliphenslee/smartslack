'use strict';

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var errors = require('../lib/errors');
var Attachment = require('./../lib/slack/attachment');

describe('Attachment', function () {

    it('should validate required argument', function (done) {
        expect(function () {
            new Attachment(null);
        }).to.throw('must supply valid argument(s)');
        done();
    });
    it('should return an attachment instance', function (done) {
        var attachment = new Attachment('The attachment text');
        expect(attachment).to.be.an('object');
        expect(attachment.text).to.equal('The attachment text');
        done();
    });

    describe('#addField', function () {

        it('should validate required argument', function (done) {
            expect(function () {
                var attachment = new Attachment('The attachment text');
                attachment.addField(null);
            }).to.throw('must supply valid argument(s)');
            done();
        });

        it('should add a field object', function (done) {
            var attachment = new Attachment('The attachment text');
            attachment.addField('title', 'value', true);
            expect(attachment.fields.length).to.equal(1);
            done();
        });
    });
});