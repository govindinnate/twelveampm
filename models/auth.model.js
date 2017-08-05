var mongoose = require('mongoose');
var UsersSchema = require('../schemas/users.schema.js');
var User = mongoose.model('users', UsersSchema);
var errorCodes = require('../helpers/app.constants').errorCodes;
var validator = require('../helpers/validators');
var userModel = require('../models/users.model');
var request = require('request');
var jwt    = require('jsonwebtoken'); 

/*
User verification
*/

var verifyFacebookUserAccessToken = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "verifyFacebookUserAccessToken > callback must be a function"});
    }

    if(params.facebookId && params.accessToken){
        var path = 'https://graph.facebook.com/me?access_token='+params.accessToken;
        request(path,function(error,response,body) {
		    if(error){
                return callback(error);
            }else{
                var data = JSON.parse(body);
                
                var query = {
                    facebookId : data.id,
                }
                userModel.findandCreateNewUser(query,function(error,userResult){
                    if(error){
                        return callback(error);
                    }
                    var user = userResult.user.toObject();
                    delete user.__v;
                    var result = {};
                    result.user = user;
                    result.token = __generateToken(result.user);
                    result.isNewProfile = userResult.isNewProfile;
                    result.isVerified = true;
                    return callback(error,result);
                });
            }
        });
    }
};
    
function __generateToken (user){
    token = jwt.sign(user, process.env.SECRET_KEY, {
        expiresIn: 60480000 // expires in 700 days
    });
    return token;
}

module.exports = {
    verifyFacebookUserAccessToken : verifyFacebookUserAccessToken
};