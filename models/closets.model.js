var mongoose = require('mongoose');
var closetSchema = require('../schemas/closet.schema.js');
var Closet = mongoose.model('closets', closetSchema);
var validator = require('../helpers/validators');
var errorCodes = require('../helpers/app.constants').errorCodes;
var uuid = require('node-uuid');
var userModel = require('../models/users.model');

/*
create closet api
*/
var createCloset = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "createCloset > callback must be a function"});
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

    userModel.findUserById(params.userId,function(error,userResult){
        if (error) {
            return callback(error);
        }else if(userResult){
            var data = new Closet({
                _id : uuid.v1(),
                imageUrl : params.imageUrl,
                category : params.category,
                brand : params.brand,
                price : params.price,
                season : params.season,
                status : "available",
                note : params.note,
                ownerId : params.userId 
            });

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


var getMyClosets = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "getMyClosets > callback must be a function"});
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
    Closet
        .find(query,exclude)
        .populate('ownerId', '-facebookId -email -deviceId -lastLogin -createdTs -modifiedTs -__v')
        .exec(function(error,closets){
            if (error){
                return callback(error);
            }
            return callback(error,closets);
    });
};

var removeCloset = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "removeCloset > callback must be a function"});
    }

    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user Id",
            param : "userId"
        });
    }

     if (!validator.isUuid(params.closetId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid closet Id",
            param : "closetId"
        });
    }
    var query = {
        _id : params.closetId,
        ownerId : params.userId
    }
    Closet.findOne(query).exec(function(error,record){
        if(error){
            return callback(error);
        }else if (record){
            Closet.remove({_id:record._id}).exec(function(removeErr,removeUpdate){
                if(removeErr){
                    return callback(removeErr);
                }
                return callback(removeErr,{message:"Record removed successfully."});
            });
        }else{
            return callback({
                error : errorCodes.DB_NO_MATCHING_DATA,
                message : "No such record found.",
                param : query
            });
        }
    });
};
    

var getClosetById = function(params,callback){
     if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "getClosetById > callback must be a function"});
    }

    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user Id",
            param : "userId"
        });
    }

    if (!validator.isUuid(params.closetId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid closet Id",
            param : "closetId"
        });
    }
    
    var query = {
        _id : params.closetId,
        ownerId : params.userId
    }
    var exclude = "-__v";
     Closet
        .findOne(query,exclude)
        .populate('ownerId', '-facebookId -email -deviceId -lastLogin -createdTs -modifiedTs -__v')
        .exec(function(error,closet){
            if (error){
                return callback(error);
            }else if(closet){
                return callback(error,closet);
            }else{
                return callback({
                    error:errorCodes.DB_NO_MATCHING_DATA,
                    message:"No such record found.",
                    param:query
                });
            }
            
    });
}

var updateClosetDetails = function(params,callback){
     if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "updateClosetDetails > callback must be a function"});
    }

    if (!validator.isUuid(params.ownerId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user Id",
            param : "userId"
        });
    }

    if (!validator.isUuid(params.closetId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid closet Id",
            param : "closetId"
        });
    }

    

    var closet = {};
    if(params.category && params.category!="" && typeof params.category === 'string'){
        closet.category = params.category;
    }

    if(params.brand && params.brand != "" && typeof params.brand === 'string'){
        closet.brand = params.brand;
    }

    if(params.price && typeof params.price === "number"){
        if (!validator.isNumber(params.price)) {
            return callback({
                error : errorCodes.DEF_VALIDATION_ERROR,
                message : "Invalid price value",
                param : "price"
            });
        }else{
            closet.price = params.price;
        }
    }

    if(params.season && typeof param.season === 'string'){
        closet.season = params.season;
    }
    if(params.status && typeof param.status === 'string'){
        closet.status = params.status;
    }
    if(params.note && typeof param.note === 'string'){
        closet.note = params.note;
    }

    Closet
    .findOneAndUpdate({_id:params.closetId,ownerId:params.ownerId},{$set:closet},{new:true})
    .populate('ownerId', '-facebookId -email -deviceId -lastLogin -createdTs -modifiedTs -__v')
    .exec(function(error,updatedResult){
        if(error){
            return callback(error);
        }else if(updatedResult){
            return callback(error,updatedResult);
        }else{
           return callback({
                error : errorCodes.DB_NO_MATCHING_DATA,
                message : "No such record found.",
                param : query
            }); 
        }
    });
}; 

module.exports = {
    createCloset : createCloset,
    getMyClosets : getMyClosets,
    removeCloset : removeCloset,
    getClosetById : getClosetById,
    updateClosetDetails : updateClosetDetails
};
