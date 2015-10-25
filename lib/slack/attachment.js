'use strict';
function SlackAttachment(title) {
    this.fields = [];
    this.title = title;
    this.fallback = undefined;
    this.text = undefined;
    this.pretext = undefined;
    this.color = undefined;
}

SlackAttachment.prototype.addField = function (title, value, short) {
    var newField = {};
    newField.title = title;
    newField.value = value;
    newField.short = short;
    this.fields.push(newField);
};
module.exports = SlackAttachment;
