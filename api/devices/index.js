const express = require('express');
const router = express.Router();
const deviceController = require('./devices.controller');

router.get('/', deviceController.getList);
router.post('/register', deviceController.register);
router.post('/push', deviceController.pushMessage);

module.exports = router;
