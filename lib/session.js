var _ = require('lodash');

var Session = function Session() {

    this.startTime = _.now();
    this.creator = 'Phillip Henslee <ph2@ph2.us';
    this.data = {};

    if (Session.caller != Session.getInstance) {
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

Session.instance = null;
/**
 * Session getInstance
 * @return Session class
 */
Session.getInstance = function () {
    if (this.instance === null) {
        this.instance = new Session();
    }
    return this.instance;
}

module.exports = Session.getInstance();

