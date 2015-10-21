var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var nock = require('nock');

var Cache = require('./cache');
var slackType = require('./slack/types');

describe('cache', function () {



    it('should be a singleton', function (done) {
        var cache1 = require('./cache');
        var cache2 = require('./cache');
        expect(cache1).to.equal(cache2);
        done();
    });

    // function get(name, callback)
    describe('#search', function () {

        var cache = Cache;
        cache.data.users = [
            {
                "id": "U0BC6D9V1",
                "name": "john",
                "deleted": false,
                "status": null,
                "color": "9f69e7",
                "real_name": "John Doe",
                "tz": "America/Chicago",
                "tz_label": "Central Daylight Time",
                "tz_offset": -18000,
                "profile": {
                    "first_name": "John",
                    "last_name": "Doe",
                    "title": "Just a slack user",
                    "skype": "",
                    "phone": "111-111-111",
                    "real_name": "John Doe",
                    "real_name_normalized": "John Doe",
                    "email": "john@somedomain.com"}
                }]


     it('it should return a user by e-mail address', function (done) {
      cache.search(slackType.USER,'john@somedomain.com', function name(err, result) {
          expect(result.name).to.equal('john');
      })
      done();
     });
     it('it should return a user by name', function (done) {
      cache.search(slackType.USER,'john', function name(err, result) {
          expect(result.profile.email).to.equal('john@somedomain.com');
      })
      done();
     });
     it('it should return a user by user id', function (done) {
      cache.search(slackType.USER,'U0BC6D9V1', function name(err, result) {
          expect(result.profile.real_name).to.equal('John Doe');
      })
      done();
     });
   });
});