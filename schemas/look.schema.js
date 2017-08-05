var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;

var lookSchema = new Schema({
    "_id": String,
    "imageUrl": {type: String, required: false},
    "occasion": {type: String, required:false},
    "season": {type: String, required:false},
    "note": {type: String, required:false},
    "ownerId": { type: String,ref: 'users', required: true },
    "tags":{type:Schema.Types.Mixed, required: false},
    "createdTs": { type: Date, required: false, "default": Date.now },
    "modifiedTs": { type: Date, required: false, "default": Date.now }
});

lookSchema.pre('save', function(next) {
    this.modifiedTs = new Date();
    next();
});

module.exports = lookSchema;