'use strict';
var _ = require('lodash');
/**
 * Escape message text for Slack
 * @param {string} text The slack message text
 * @returns {string} text The escaped message text
 */
function slackEscape(text) {
    var char = [['&', '&amp;'], ['<', '&lt;'], ['>', '&gt;']];
    _.each(char, function (i) {
        text = text.replace(i[0], i[1]);
    });
    return text;
}

module.exports = {
    escape: slackEscape
};