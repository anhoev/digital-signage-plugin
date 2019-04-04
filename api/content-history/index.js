const express = require('express');
const router = express.Router();
const ContentHistoryController = require('./content-history.controller');

router.post('/', ContentHistoryController.addContentController);

module.exports = router;
