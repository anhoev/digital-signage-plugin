const deviceService = require('./devices.service');
const Content = cms.getModel('Content');
const Joi = require('joi');
const _ = require('lodash');

module.exports.getList = function (req, res) {
  deviceService.getList()
    .then(data => {
      res.status(200).json({ data });
    })
    .catch(err => {
      res.status(400).json({ err });
    });
};

const DeviceSchema = Joi.object().keys({
  token: Joi.string().required(),
  resolution: Joi.string(),
  model: Joi.string(),
  name: Joi.string(),
  os: Joi.string(),
  'os-version': Joi.string(),
  coordinates: Joi.object().keys({
    longitude: Joi.number(),
    latitude: Joi.number()
  }),
  appVersionCode: [Joi.string(), Joi.number()]
});

//legacy API
module.exports.register = function (req, res) {

  const info = {};
  for (let key in req.body) {
    if (key === 'osVersion') {
      info['os-version'] = req.body.osVersion;
    } else {
      info[key] = req.body[key];
    }
  }

  const validate = DeviceSchema.validate(info);
  if (validate.error) {
    return res.status(400).json({ error: validate.error });
  }

  deviceService.register(info)
    .then(data => {
      res.status(200).json({ data });
    })
    .catch(err => {
      res.status(400).json({ err });
    });
};

module.exports.fetchDeviceInfo = async function (req, res) {
  try {
    const token = req.body['token'];
    const existingDevice = await deviceService.fetchDeviceInfo(token);
    res.status(200).json(existingDevice);
  } catch (e) {
    res.status(400).json({e})
  }
};

module.exports.pushDeviceInfo = async function ({body: rawDeviceInfo}, res) {
  const deviceInfo = _.assign(_.omit(rawDeviceInfo, ['osVersion']), {'os-version': rawDeviceInfo.osVersion});
  const validate = DeviceSchema.validate(deviceInfo);
  if (validate.error) {
    res.status(500).send(validate.error);
  }
  await deviceService.pushDeviceInfo(deviceInfo);
  res.send();
};

module.exports.pushMessage = function (req, res) {
  const files = req.body.files;
  const tokens = req.body.token;
  Content.find({ path: { $in: files } })
    .then(data => {
      return deviceService.pushMessage(tokens, data);
    })
    .then((r) => res.status(200).json(r))
    .catch(err => res.status(400).json({ err }));
};

