const express = require('express');
const router = express.Router();

const fileController = require('./file-manager.controller');
const upload = require('../../common/services/upload.service');

const optionUpload = upload.uploadBase.uploadFileBase.fields([
  { name: 'video', maxCount: 1 }
]);

router.post('/upload', optionUpload, fileController.upload);

module.exports = router;
