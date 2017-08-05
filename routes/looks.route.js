var express = require('express');
var router = express.Router();
var lookModel = require('../models/looks.model');
var errorHandler = require('../helpers/error_handler');
var successHandler = require('../helpers/success_handler');
var errorCodes = require('../helpers/app.constants').errorCodes;
var validator = require('../helpers/validators');
var uuid = require('node-uuid');
var util = require('../helpers/util');
var Q = require('q');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var s3helper = require('../helpers/aws.s3.helper');

var uploadLook = function(req,res,next) {
    var files = req.files;
    var availableFiles = {};
    var userId = req.currentUser._id;
    if (files) {
        if (files.look && files.look.name) {
            // this will restrict only one image at time
            var fileExt = util.getExtension(files.look.name);
            var mediaType = "image";

            if (validator.isImage(fileExt)) {
                var fileId = uuid.v1();
                var fileName =  fileId + "_look" +  "." +  fileExt;
                var localDir = files.look.path;
                var s3Dir = "media/" + mediaType + "/look" + "/";

                var imgWorkerData = {
                    localDir: localDir,
                    s3Dir: s3Dir,
                    originalName: files.look.originalFilename,
                    fileType: files.look.type,
                    fileId: fileId,
                    fileName: fileName,
                    userId: userId,
                    s3FilePath : s3Dir + fileName
                };
                availableFiles.look = imgWorkerData;
            } else {
                return errorHandler.sendFormattedError(res, {
                    code: errorCodes.DEF_VALIDATION_ERROR,
                    message: "Not an valid image file"
                });
            }
        }
    }
    req.availableFiles = availableFiles;
    next();
};

router.post('/createLook', multipartMiddleware,uploadLook, function(req,res){
if (req.availableFiles.look) {
        var imageData = req.availableFiles.look;
        var p1 = s3helper.storeFile(imageData.localDir, imageData.s3FilePath,"image");
        Q.all([p1])
            .then(function(result){
            var data = req.body;
            data.userId = req.currentUser._id;
            data.imageUrl = process.env.S3URL + imageData.s3FilePath;
            lookModel.createLook(data,function(error,result){
                if (error) {
                    return errorHandler.sendFormattedError(res,error);
                }
                return successHandler.sendFormattedSuccess(res,result);
            });
        })
        .catch(function(error){
            return errorHandler.sendFormattedError(res,error);
        })
        .done();
    } else {
        return errorHandler.sendFormattedError(res, {
            code: errorCodes.DEF_VALIDATION_ERROR,
            message: "You need to upload an image."
        });
    }
});

router.get('/getMyLooks',function(req,res){
    var query = {
        userId : req.currentUser._id
    };
console.log(query);

    lookModel.getMyLooks(query,function(error,result){
        if(error) {
            errorHandler.sendFormattedError(res,error)
        } else {
            successHandler.sendFormattedSuccess(res,result);
        }
    });
});

router.post('/removeLook',function(req,res){
    req.checkBody('lookId', 'Invalid look Id').isUuid();
	var errors = req.validationErrors();
    if (errors) {
        return errorHandler.sendFormattedError(res, errors);
    }
    var query = {
        userId : req.currentUser._id,
        lookId : req.param('lookId')
    };

    lookModel.removeLook(query,function(error,result){
        if(error) {
            errorHandler.sendFormattedError(res,error)
        } else {
            successHandler.sendFormattedSuccess(res,result);
        }
    });
});

router.get('/getLookById',function(req,res){
    req.checkQuery('lookId','Invalid look Id').isUuid();
	var errors = req.validationErrors();
    if (errors) {
        return errorHandler.sendFormattedError(res, errors);
    }
    var query = {
        userId : req.currentUser._id,
        lookId : req.param('lookId')
    };

    lookModel.getLookById(query,function(error,result){
        if(error) {
            errorHandler.sendFormattedError(res,error)
        } else {
            successHandler.sendFormattedSuccess(res,result);
        }
    });
});

router.post('/updatelookDetails',function(req,res){
    req.checkBody('lookId','Invalid look Id');
    var errors = req.validationErrors();
    if(errors){
        return errorHandler.sendFormattedError(res,errors);
    }
    var query = {
        ownerId : req.currentUser._id,
        lookId : req.param('lookId'),
        occasion : req.param('occasion'),
        season : req.param('season'),
        note : req.param('note'),
        tags : req.param('tags')
    }

    lookModel.updatelookDetails(query,function(error,result){
        if(error) {
            errorHandler.sendFormattedError(res,error)
        } else {
            successHandler.sendFormattedSuccess(res,result);
        }
    });
});

module.exports = router;