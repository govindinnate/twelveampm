var mongoose = require('mongoose');
var lookSchema = require('../schemas/look.schema.js');
var Look = mongoose.model('look',lookSchema);
var validator = require('../helpers/validators');
var errorCodes = require('../helpers/app.constants').errorCodes;
var uuid = require('node-uuid');
var userModel = require('../models/users.model');
var closetModel = require('../models/closets.Model')

var createLook = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "createLook > callback must be a function"});
    }

    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user Id",
            param : "userId"
        });
    }
    if (!validator.isUrl(params.imageUrl)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid URL type",
            param : "imageUrl"
        });
    }

    if(params.tags){
        if (!validator.isArray(params.tags)) {
            return callback({
                error : errorCodes.DEF_VALIDATION_ERROR,
                message : "Tags field should be an array.",
                param : "Tags"
            });
        }
    }
    userModel.findUserById(params.userId,function(error,userResult){
        if(error){
            return callback(error);
        }else if(userResult){
            var data = new Look({
                _id : uuid.v1(),
                imageUrl : params.imageUrl,
                tags : params.tags,
                ownerId : params.userId 
            });

            if (params.occasion && typeof params.occasion === 'string') {
                data.occasion = params.occasion;
            }

            if(params.season && typeof params.season === 'string'){
                data.season = params.season;
            }

            if(params.note && typeof params.note === 'string'){
                data.note = params.note;
            }

            data.save(function(error,result){
                if(error){
                    return callback(error);
                }
                return callback(error,result);
            })
        }else{
            return callback({
                error : errorCodes.DB_NO_MATCHING_DATA,
                message : "User doesn't exists.",
                param : params.userId
            });
        }
    });
};


var getMyLooks = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "getMyLooks > callback must be a function"});
    }

    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user Id",
            param : "userId"
        });
    }

    var query = {
        ownerId : params.userId,
    }
    var exclude = "-__v";
    Look
        .find(query,exclude)
        .populate('ownerId', '-facebookId -email -deviceId -lastLogin -createdTs -modifiedTs -__v')
        .exec(function(error,closets){
            if (error){
                return callback(error);
            }
            return callback(error,closets);
    });
};

var removeLook = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "removeLook > callback must be a function"});
    }

    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user Id",
            param : params.userId
        });
    }

     if (!validator.isUuid(params.lookId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid look Id",
            param : params.lookId
        });
    }
    var query = {
        _id : params.lookId,
        ownerId : params.userId
    }
    Look.findOne(query).exec(function(error,record){
        if(error){
            return callback(error);
        }else if (record){
            Look.remove({_id:record._id}).exec(function(removeErr,removeUpdate){
                if(removeErr){
                    return callback(removeErr);
                }
                return callback(removeErr,{message:"Look removed successfully."});
            });
        }else{
            return callback({
                error : errorCodes.DB_NO_MATCHING_DATA,
                message : "No such record found.",
                param : query
            });
        }
    });
}

var getLookById = function(params,callback){
     if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "getLookById > callback must be a function"});
    }

    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user Id",
            param : params.userId
        });
    }

    if (!validator.isUuid(params.lookId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid look Id",
            param : params.lookId
        });
    }
    
    var query = {
        _id : params.lookId,
        ownerId : params.userId
    }
    var exclude = "-__v";
    Look
        .findOne(query,exclude)
        .populate('ownerId', '-facebookId -email -deviceId -lastLogin -createdTs -modifiedTs -__v')
        .exec(function(error,look){
            if (error){
                return callback(error);
            }
            return callback(error,look);
    });
}

var updatelookDetails = function(params,callback){
     if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "updatelookDetails > callback must be a function"});
    }

    if (!validator.isUuid(params.ownerId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user Id",
            param : "userId"
        });
    }

    if (!validator.isUuid(params.lookId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid look Id",
            param : "lookId"
        });
    }

    var details = {};
    if(params.occasion && typeof params.occasion === 'string'){
        details.occasion = params.occasion;
    }

    if(params.season && typeof params.season === 'string'){
        details.season = params.season;
    }
    
    if(params.note && typeof params.note === 'string'){
        details.note = params.note;
    }

    if(params.tags){
        if (!validator.isArray(params.tags)) {
            return callback({
                error : errorCodes.DEF_VALIDATION_ERROR,
                message : "tags field should be an array.",
                param : "tags"
            });
        }else{
            details.tags = params.tags;
        }
    }

    var query = {
        _id : params.lookId,
        ownerId : params.ownerId
    }
    var exclude = "-__v";
    Look
    .findOneAndUpdate({_id:params.lookId,ownerId:params.ownerId},{$set:details},{new:true})
    .populate('ownerId', '-facebookId -email -deviceId -lastLogin -createdTs -modifiedTs -__v')
    .exec(function(error,updatedResult){
        if(error){
            return callback(error);
        }else if(updatedResult){
            return callback(error,updatedResult);
        }else{
           return callback({
                error : errorCodes.DEF_VALIDATION_ERROR,
                message : "No such record found",
                param : "ownerId/lookId"
            }); 
        }
    });
}; 

module.exports = {
    createLook : createLook,
    getMyLooks : getMyLooks,
    removeLook : removeLook,
    getLookById : getLookById,
    updatelookDetails : updatelookDetails
};
