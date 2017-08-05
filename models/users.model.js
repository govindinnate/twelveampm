var mongoose = require('mongoose');
var UsersSchema = require('../schemas/users.schema.js');
var User = mongoose.model('users', UsersSchema);
var validator = require('../helpers/validators');
var errorCodes = require('../helpers/app.constants').errorCodes;
var uuid = require('node-uuid');


var findandCreateNewUser = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "findandCreateNewUser > callback must be a function"});
    }
    
    var query = {
        facebookId : params.facebookId
    };
    var exclude = '-__v';
    User.findOne(query,exclude).exec(function(err,userResult){
        if (err) {
            return callback(err);
        } else if (userResult){
            
            userResult.lastLogin = new Date();
            userResult.save(function(error,userData){
                return callback(error,{user:userData,isNewProfile:false})
            });
        } else {
           //create new user
            var newUser = new User({
                _id : uuid.v1(),
                emailId : params.email,
                firstName : params.first_name,
                lastName : params.last_name,
                fullName : params.name,
                gender : params.gender,
                facebookId : params.facebookId
            });

            newUser.lastLogin = new Date();
            newUser.save(function(error,userData){
                return callback(error, { user : userData, isNewProfile: true});
            });
        }
    });
};

var updateUserProfile = function(params,callback){

    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "updateUserProfile > callback must be a function"});
    }

    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user id",
            param : "userId"
        });
    }

    //get the user
   findUserById(params.userId,function(error,userResult){
        if (error) {
            return callback(error);
        } else if(userResult){

            if (params.firstName && params.firstName!="" && typeof params.firstName === 'string') {
                userResult.firstName = params.firstName.trim();
            }else{
                return callback({
                    error : errorCodes.DEF_VALIDATION_ERROR,
                    message : "firstName field can not be empty",
                    param : "firstName"
                }); 
            }

            if (typeof params.lastName === 'string') {
                userResult.lastName = params.lastName.trim();
            }

            if (params.firstName && params.lastName && typeof params.firstName === 'string' && typeof params.lastName === 'string'){
                userResult.fullName = params.firstName.trim()+" "+params.lastName.trim();
            }

            if(params.deviceId && params.deviceId!="" && typeof params.deviceId === 'string'){
                userResult.deviceId = params.deviceId;
            }

            if (validator.isValidEmail(params.email)){
                userResult.email = params.email;
            }

            if (params.profileImage && validator.isUrl(params.profileImage)){
                userResult.profileImage = params.profileImage;
            }

            userResult.save(function(err,updatedUser){
                if (err) {
                    return callback(err, updatedUser)
                } else {
                    updatedUser = updatedUser.toObject();
                    delete updatedUser.__v;
                    return callback(null,{user:updatedUser});
                }
            });
        } else {
            return callback({
                error : errorCodes.DB_NO_MATCHING_DATA,
                message : "User doesn't exists.",
                param : params.userId
            });
        }
    });
};

var updateImage = function(params,callback){
    if (typeof callback != "function") {
        throw new TypeError({message: "updateImage > callback must be a function"});
    }

    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user id",
            param : "userId"
        });
    }
    User.findOneAndUpdate({_id:params.userId},{$set:{profileImage:params.profileImage}},{new: true}).exec(function(err, user){
        if (err) {
            return callback(err);
        }
        return callback(err,user);   
    });
};

var findUserById = function(userId,callback){

    if (typeof callback != "function") {
        throw new TypeError({message: "findUserById > callback must be a function"});
    }

    if (!validator.isUuid(userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user id",
            param : "userId"
        });
    }

    User.findOne({_id:userId}).exec(function(error,userResult){
        if(error){
            return callback(error);
        }
       return callback(error,userResult);
    });

};

module.exports = {
    findandCreateNewUser : findandCreateNewUser,
    updateUserProfile : updateUserProfile,
    findUserById : findUserById,
    updateImage : updateImage
};