var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;

var packingSchema = new Schema({
    "_id": String,
    "title": {type: String, required: true},
    "fromDate": { type: Date, required: true},
    "toDate": { type: Date, required: true},
    "ownerId": { type: String,ref: 'users', required: true },
    "closets" :{type:Schema.Types.Mixed,ref: 'closets',required: false},
    "looks":{type:Schema.Types.Mixed,ref: 'looks',required: false},
    "createdTs": { type: Date, required: false, "default": Date.now },
    "modifiedTs": { type: Date, required: false, "default": Date.now }
});

packingSchema.pre('save', function(next) {
    this.modifiedTs = new Date();
    next();
});

module.exports = packingSchema;