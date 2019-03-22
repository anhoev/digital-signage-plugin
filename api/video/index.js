const express = require('express');
const router = express.Router();

const videoController = require('./video.controller');
const upload = require('../../common/services/upload.service');

const optionUpload = upload.uploadBase.uploadFileBase.fields([
  { name: 'video', maxCount: 1 },
  { name: 'toPath', maxCount: 1 }
]);

router.get('/', videoController.detail);
router.post('/upload', optionUpload, videoController.upload, videoController.announce);
router.delete('/delete', videoController.delete);
router.delete('/delete-folder', videoController.deleteFolder);
router.get('/directories', videoController.getDirectories);
router.get('/folders', videoController.getFolder);
router.post('/new-folder', videoController.newFolder);

module.exports = router;
