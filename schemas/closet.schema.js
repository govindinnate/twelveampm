var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;

var closetSchema = new Schema({
    "_id": String,
    "imageUrl": {type: String, required: false},
    "category": {type: String, required:false},
    "brand": {type: String, required:false},
    "price": {type: Number, required:false},
    "season":{type: String, required:false},
    "status": {type: Schema.Types.Mixed, required: false},
    "note": {type: String, required: false},
    "ownerId": { type: String,ref: 'users', required: true },
    "createdTs": { type: Date, required: false, "default": Date.now },
    "modifiedTs": { type: Date, required: false, "default": Date.now }
});

closetSchema.pre('save', function(next) {
    this.modifiedTs = new Date();
    next();
});

module.exports = closetSchema;