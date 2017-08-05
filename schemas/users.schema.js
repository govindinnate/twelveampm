var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;
var validator = require('../helpers/validators');

var userSchema = new Schema({
    "_id": String,
    "email": {type: String, required: false},
    "firstName": {type: String, required:false},
    "lastName": {type: String, required:false},
    "fullName": {type: String, required:false},
    "searchName":{type: String, required:false},
    "profileImage": {type: Schema.Types.Mixed, required: false},
    "facebookId": { type: String, required: true },
    "deviceId": {type: String, required: false},
    "lastLogin": { type: Date, required: false },
    "createdTs": { type: Date, required: false, "default": Date.now },
    "modifiedTs": { type: Date, required: false, "default": Date.now }
});

userSchema.index({ "searchName":"text"});

userSchema.pre('save', function(next) {
    this.modifiedTs = new Date();
    if(!(validator.isEmpty( this.firstName) && validator.isEmpty( this.lastName))) {
        //full name is for search, so save with lowercase and without space
        this.searchName = this.firstName.toLocaleLowerCase()+this.lastName.toLocaleLowerCase()
    }
    next();
});
module.exports = userSchema;