var express = require('express');
var router = express.Router();
var authModel = require('../models/auth.model');
var errorHandler = require('../helpers/error_handler');
var successHandler = require('../helpers/success_handler');
var validator = require('../helpers/validators');


router.get('/', function(req, res) {
    res.json({ message: 'Welcome to the TWELVE AM:PM API center !!!'});
});

/**
 * Route to validate the given facebook Authentication-token for user details
 */
router.post('/login', function(req,res){
    //validate access-token 
    req.checkBody('accessToken', 'facebook access token is mandatory').isNotEmpty();
    req.checkBody('facebookId','facebook Id is mandatory').isNotEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return errorHandler.sendFormattedError(res,errors);
    }
    var inputdata = {
        facebookId : req.param('facebookId'),
        accessToken : req.param('accessToken')
    };
    
    authModel.verifyFacebookUserAccessToken(inputdata,function(error,result){
        if (error) {
            return errorHandler.sendFormattedError(res,error);
        }
        return successHandler.sendFormattedSuccess(res,result);
    });
});

module.exports = router;