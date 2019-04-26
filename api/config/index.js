const express = require('express');
const router = express.Router();
const configCtrl = require('./config.controller');

router.get('/data', configCtrl.common);

module.exports = router;
