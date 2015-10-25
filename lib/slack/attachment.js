'use strict';
var errors = require('../errors');

function Attachment(text) {
    if (typeof text !== 'string') {
        throw new Error(errors.missing_required_arg);
    }
    this.fields = [];
    this.text = text;
    this.fallback = text;
    this.color = null;
    this.author_name = null;
    this.author_link = null;
    this.author_icon = null;
    this.title = null;
    this.title_link = null;
    this.image_url = null;
    this.thumb_url = null;
}

Attachment.prototype.addField = function (title, value, short) {
    if (typeof title !== 'string' && typeof value !== 'string' && typeof short !== 'boolean') {
        throw new Error(errors.missing_required_arg);
    }
    var newField = {};
    newField.title = title;
    newField.value = value;
    newField.short = short;
    this.fields.push(newField);
};
module.exports = Attachment;
