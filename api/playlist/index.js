const express = require('express');
const router = express.Router();
const playListController = require('./playlist.controller');

router.post('/push', playListController.pushPlaylist);

module.exports = router;
