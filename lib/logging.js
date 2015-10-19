var bole = require('bole');


module.exports = function configure() {
    var outputs;

    if (true)
    {
         var prettystream = require('bistre')({time: true}); // pretty
         prettystream.pipe(process.stdout);
         outputs = { level: 'debug', stream: prettystream };

    } else {

        outputs = {level: 'error', stream: process.stdout }
    }

    bole.output(outputs);
};

//process.env.NODE_ENV === 'dev'