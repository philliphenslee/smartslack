'use strict';
var _ = require('lodash');

function slackEscape(data) {
    var char = [['&', '&amp;'], ['<', '&lt;'], ['>', '&gt;']];
    _.each(char, function (i) {
        data = data.replace(i[0], i[1]);
    });
    return data;
}

module.exports = {
    escape: slackEscape,
};