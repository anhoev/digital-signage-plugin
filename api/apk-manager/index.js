const express = require('express');
const router = express.Router();
const apkController = require('./apkManager.controller');

router.post('/', apkController.update);
router.get('/', apkController.get);
router.get('/appcenter', apkController.getAppCenterUpdate);

module.exports = router;
