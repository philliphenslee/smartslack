var _ = require('lodash');

var errors = require('./errors');

var Cache = function Cache() {

    if (Cache.caller != Cache.getInstance) {
        throw new Error("This object cannot be instanciated");
    }

    this.data = {};

    this.defaults = function (data) {
        _.defaults(this.data, data);
    }

    this.add = function (data) {
        _.extend(this.data, data);
    }

    this.search = function(slackType, search, callback) {
        var result=null;
        var attribute;
        
        // Are we looking for a channel, group, or user by id or name
        search.match(/^([CGU]0)/) ? attribute = 'id' : attribute = 'name';

        result = _.find(this.data[slackType], { [attribute]: search });

        if (_.isNull(result)){
            return callback(new Error(errors.item_not_found))
        }
        callback(null, result);
    }
}

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
}

module.exports = Cache.getInstance();

