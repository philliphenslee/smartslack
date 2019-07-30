'use strict';

var _ = require('lodash');

var errors = require('./errors');
/**
 * Singleton Cache object, for storing the session data
 * @Class Cache
 * @constructor
 * @property {object} data The root object
 */
var Cache = function Cache() {

    this.data = {};

    this.defaults = function (data) {
        _.defaults(this.data, data);
    };

    this.add = function (data) {
        _.extend(this.data, data);
    };

    this.search = function (slackType, search, callback) {
        var result = null;
        var attribute;

        // Should we search by id, email, or name
        switch (search) {
            case ((search.match(/^([CGU]0)/)) ? search : undefined):
                attribute = 'id';
                break;
            case ((search.match(/(\S+@\S+\.\S+)/)) ? search : undefined):
                attribute = 'email';
                break;
            default:
                attribute = 'name';
                break;
        }

        if (attribute === 'email') {

            _.forEach(this.data.users, function (user) {
                if (user.profile.email === search) {
                    result = user;
                }
            });

        } else {
            _.filter(this.data[slackType], function(item){
                if (item[attribute] === search) {
                  result = item;
                }
            });

        }

        if (result == null) {
            return callback(new Error(errors.item_not_found));
        }
        callback(null, result);
    };
};

Cache.instance = null;
/**
 * Cache getInstance
 * @return Cache class
 */
Cache.getInstance = function () {
    if (this.instance === null) {
        this.instance = new Cache();
    }
    return this.instance;
};

module.exports = Cache.getInstance();


