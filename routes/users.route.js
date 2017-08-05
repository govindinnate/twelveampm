var express = require('express');
var router = express.Router();
var Sync = require('sync');
var userModel = require('../models/users.model');
var authModel = require('../models/auth.model');
var errorHandler = require('../helpers/error_handler');
var successHandler = require('../helpers/success_handler');
var errorCodes = require('../helpers/app.constants').errorCodes;
var validator = require('../helpers/validators');
var uuid = require('node-uuid');
var util = require('../helpers/util');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var s3helper = require('../helpers/aws.s3.helper');
var Q = require('q');

router.post('/updateUserProfile', function(req,res){
    var data = req.body;
    data.userId = req.currentUser._id;
    userModel.updateUserProfile(data,function(error,result){
        if (error) {
            return errorHandler.sendFormattedError(res,error);
        }
        return successHandler.sendFormattedSuccess(res,result);
    });
});

var uploadProfileImage = function(req, res, next) {
    var files = req.files;
    var availableFiles = {};
    var userId = req.currentUser._id;

    if (files) {
        if (files.profileImage && files.profileImage.name) {
            // this will restrict only one image at time
            var fileExt = util.getExtension(files.profileImage.name);
            var mediaType = "image";

            if (validator.isImage(fileExt)) {
                var fileId = uuid.v1();
                var fileName =  fileId + "_profileImage" +  "." +  fileExt;
                var localDir = files.profileImage.path;//__dirname + "/../uploads/chatmedia/" + mediaType + "/";
                var s3Dir = "media/" + mediaType + "/profileImage" + "/";

                var imgWorkerData = {
                    localDir: localDir,
                    s3Dir: s3Dir,
                    originalName: files.profileImage.originalFilename,
                    fileType: files.profileImage.type,
                    fileId: fileId,
                    fileName: fileName,
                    userId: userId,
                    s3FilePath : s3Dir + fileName
                };
                // Store only the file name, folder path to the file will be appended from config
                availableFiles.profileImage = imgWorkerData;
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

router.post('/uploadProfileImage', multipartMiddleware, uploadProfileImage, function(req,res) {

    if (req.availableFiles.profileImage) {
        var imageData = req.availableFiles.profileImage;
        var p1 = s3helper.storeFile(imageData.localDir, imageData.s3FilePath,"image");
        Q.all([p1])
            .then(function(result){
                var params = {
                    userId : imageData.userId,
                    profileImage : process.env.S3URL + imageData.s3FilePath
                }
                userModel.updateImage(params,function(error,result){
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

module.exports = router;