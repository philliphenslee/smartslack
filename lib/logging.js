var bole = require('bole');


module.exports = function configure() {
    var outputs;

    if (process.env.NODE_ENV === 'dev')
    {
         var prettystream = require('bistre')({time: true}); // pretty
         prettystream.pipe(process.stdout);
         outputs = { level: 'debug', stream: prettystream };

    } else {

        outputs = {level: 'info', stream: process.stdout }
    }

    bole.output(outputs);
};