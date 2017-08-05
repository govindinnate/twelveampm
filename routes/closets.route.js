var express = require('express');
var router = express.Router();
var closetModel = require('../models/closets.model');
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

var uploadCloset = function(req,res,next) {
    var files = req.files;
    var availableFiles = {};
    var userId = req.currentUser._id;

    console.log(files);

    if (files) {
        if (files.closet && files.closet.name) {
            // this will restrict only one image at time
            var fileExt = util.getExtension(files.closet.name);
            var mediaType = "image";

            if (validator.isImage(fileExt)) {
                var fileId = uuid.v1();
                var fileName =  fileId + "_closet" +  "." +  fileExt;
                var localDir = files.closet.path;
                var s3Dir = "media/" + mediaType + "/closet" + "/";

                var imgWorkerData = {
                    localDir: localDir,
                    s3Dir: s3Dir,
                    originalName: files.closet.originalFilename,
                    fileType: files.closet.type,
                    fileId: fileId,
                    fileName: fileName,
                    userId: userId,
                    s3FilePath : s3Dir + fileName
                };
                availableFiles.closet = imgWorkerData;
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

router.post('/createCloset', multipartMiddleware,uploadCloset, function(req,res){
    req.checkBody('category', 'category field is mandatory').isNotEmpty();
    req.checkBody('price','price should be numeric value').optional().isNumber();
    var errors = req.validationErrors();
    if (errors) {
        return errorHandler.sendFormattedError(res, errors);
    }

    if (req.availableFiles.closet) {
        var imageData = req.availableFiles.closet;
        var p1 = s3helper.storeFile(imageData.localDir, imageData.s3FilePath,"image");
        Q.all([p1])
            .then(function(result){
            var data = req.body;
            data.userId = req.currentUser._id;
            data.imageUrl = process.env.S3URL + imageData.s3FilePath;
            closetModel.createCloset(data,function(error,result){
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
            message: "You need to upload an image"
        });
    }
});

router.get('/getMyClosets',function(req,res){

	var errors = req.validationErrors();
    if (errors) {
        return errorHandler.sendFormattedError(res, errors);
    }
    var query = {
        userId : req.currentUser._id
    };

    closetModel.getMyClosets(query,function(error,result){
        if(error) {
            errorHandler.sendFormattedError(res,error)
        } else {
            successHandler.sendFormattedSuccess(res,result);
        }
    });
});

router.post('/removeCloset',function(req,res){
    req.checkBody('closetId', 'Invalid closet Id').isUuid();
	var errors = req.validationErrors();
    if (errors) {
        return errorHandler.sendFormattedError(res, errors);
    }
    var query = {
        userId : req.currentUser._id,
        closetId : req.param('closetId')
    };

    closetModel.removeCloset(query,function(error,result){
        if(error) {
            errorHandler.sendFormattedError(res,error)
        } else {
            successHandler.sendFormattedSuccess(res,result);
        }
    });
});


router.get('/getClosetById',function(req,res){
    req.checkQuery('closetId','Invalid closet Id').isUuid();
	var errors = req.validationErrors();
    if (errors) {
        return errorHandler.sendFormattedError(res, errors);
    }
    var query = {
        userId : req.currentUser._id,
        closetId : req.param('closetId')
    };

    closetModel.getClosetById(query,function(error,result){
        if(error) {
            errorHandler.sendFormattedError(res,error)
        } else {
            successHandler.sendFormattedSuccess(res,result);
        }
    });
});

router.post('/updateClosetDetails',function(req,res){
    req.checkBody('closetId','Invalid Closet Id');
    var errors = req.validationErrors();
    if(errors){
        return errorHandler.sendFormattedError(res,errors);
    }
    var query = {
        ownerId : req.currentUser._id,
        closetId : req.param('closetId'),
        category : req.param('category'),
        brand : req.param('brand'),
        season : req.param('season'),
        price : req.param('price'),
        status : req.param('status'),
        note : req.param('note')
    }

    closetModel.updateClosetDetails(query,function(error,result){
        if(error) {
            errorHandler.sendFormattedError(res,error)
        } else {
            successHandler.sendFormattedSuccess(res,result);
        }
    });
});

module.exports = router;