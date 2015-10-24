'use strict';
var bole = require('bole');

(function configureLogging() {
    var outputs;

    if (process.env.NODE_ENV === 'dev' || process.env.LOG_LEVEL === 'debug') {
        var prettystream = require('bistre')({time: true}); // pretty
        prettystream.pipe(process.stdout);
        outputs = {level: 'debug', stream: prettystream};

    } else {

        outputs = {level: 'error', stream: process.stdout}
    }
    bole.output(outputs);

    module.exports = function configuringLogging() {};

})(module);
