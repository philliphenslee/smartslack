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

    this.add = function (data) {
        _.extend(this.data, data);
    }

    this.uptime = function () {
        var uptime = '';
        var seconds = ((_.now() - this.startTime) / 1000.0)
        var minutes = Math.round((seconds / 60));
        var hours = Math.round((minutes / 60));
        var days = Math.round((hours / 24));

        if (seconds < 3600000) {

            uptime = minutes + ' minutes';
            return uptime;
        }
        if (hours < 24) {
            return uptime = hours + ' hours';
        } else {
            return uptime = days + ' days';
        }
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

