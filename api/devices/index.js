const express = require('express');
const router = express.Router();
const deviceController = require('./devices.controller');

router.get('/', deviceController.getList);
router.post('/register', deviceController.register);
router.post('/push', deviceController.pushDeviceInfo);
router.post('/fetch', deviceController.fetchDeviceInfo);

router.post('/testhook', (req, res) => {
  console.log(req.body);
  console.log(req);
  res.status(200).json({ ok: 'ok' });
});
router.get('/testhook', (req, res) => {
  console.log(req);
});
module.exports = router;
