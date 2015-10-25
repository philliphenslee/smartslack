'use strict';
function SlackAttachment(title) {
    this.title = title;
    this.fallback = undefined;
    this.text = undefined;
    this.pretext = undefined;
    this.color = undefined;
}

SlackAttachment.prototype.addField = function (title, value, short) {
    var newField = {};
    newField.title = title;
    newField.valid = value;
    newField.short = short;
    this.fields = [];
    this.fields.push(newField);
};
module.exports = SlackAttachment;
