var _ = require('lodash');

var Cache = function Cache() {

    this.startTime = _.now();
    this.data = {};

    if (Cache.caller != Cache.getInstance) {
        throw new Error("This object cannot be instanciated");
    }

    this.defaults = function (data) {
        _.defaults(this.data, data);
    }

    this.uptime = function () {
        var days = (((_.now() - this.startTime) / 1000.0) / 60) / 24
        var uptime = days + ' days';
        return uptime;
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

