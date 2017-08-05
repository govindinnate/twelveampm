var express = require('express');
var router = express.Router();
var packingModel = require('../models/packing.model');
var errorHandler = require('../helpers/error_handler');
var successHandler = require('../helpers/success_handler');
var errorCodes = require('../helpers/app.constants').errorCodes;
var validator = require('../helpers/validators');
var uuid = require('node-uuid');
var Q = require('q');

router.post('/createPacking',function(req,res){
    req.checkBody('title', 'title is mandatory.').isNotEmpty();
    req.checkBody('fromDate','fromDate is mandatory.').isNotEmpty();
    req.checkBody('toDate','toDate is mandatory').isNotEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return errorHandler.sendFormattedError(res,errors);
    }
    var query = {
        title : req.currentUser._id,
        fromDate : req.param('fromDate'),
        toDate : req.param('toDate'),
        ownerId : req.currentUser._id
    };

    packingModel.createPacking(query,function(error,result){
        if(error) {
            errorHandler.sendFormattedError(res,error)
        } else {
            successHandler.sendFormattedSuccess(res,result);
        }
    });
});

router.post('/addLooks',function(req,res){
    req.checkBody('looks', 'looks field should be an array.').isUuidArray();
    req.checkBody('packingId','Invalid packing Id').isUuid();
    var query = {
        userId : req.currentUser._id,
        packingId : req.param('packingId'),
        looksArray : req.param('looks')
    };
    packingModel.addLooks(query,function(error,result){
        if(error) {
            errorHandler.sendFormattedError(res,error)
        } else {
            successHandler.sendFormattedSuccess(res,result);
        }
    });
});

router.post('/addClosets',function(req,res){
    req.checkBody('Closets', 'Closets field should be an array.').isUuidArray();
    req.checkBody('packingId','Invalid packing Id').isUuid();
    var query = {
        userId : req.currentUser._id,
        packingId : req.param('packingId'),
        closetsArray : req.param('Closets')
    };
    packingModel.addClosets(query,function(error,result){
        if(error) {
            errorHandler.sendFormattedError(res,error)
        } else {
            successHandler.sendFormattedSuccess(res,result);
        }
    });
});

router.get('/editPacking',function(req,res){
    req.checkQuery('packingId','Invalid packing Id').isUuid();
    req.checkBody('title', 'title is mandatory.').isNotEmpty();
    req.checkBody('fromDate','fromDate is mandatory.').isNotEmpty();
    req.checkBody('toDate','toDate is mandatory').isNotEmpty();
	var errors = req.validationErrors();
    if (errors) {
        return errorHandler.sendFormattedError(res, errors);
    }
    var query = {
        userId : req.currentUser._id,
        packingId : req.param('packingId'),
        title : req.param('title'),
        fromDate : req.param('fromDate'),
        toDate : req.param('toDate')
    };

    packingModel.editPacking(query,function(error,result){
        if(error) {
            errorHandler.sendFormattedError(res,error)
        } else {
            successHandler.sendFormattedSuccess(res,result);
        }
    });
});

router.post('/deletePacking',function(req,res){
    req.checkBody('packingId','Invalid packing Id');
    var errors = req.validationErrors();
    if(errors){
        return errorHandler.sendFormattedError(res,errors);
    }
    var query = {
        packingId : req.param('packingId'),
        ownerId : req.currentUser._id
    }

    packingModel.deletePacking(query,function(error,result){
        if(error) {
            errorHandler.sendFormattedError(res,error)
        } else {
            successHandler.sendFormattedSuccess(res,result);
        }
    });
});

module.exports = router;