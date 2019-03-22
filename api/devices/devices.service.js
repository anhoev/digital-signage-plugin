const admin = require('firebase-admin');

const cms = global.cms;

module.exports.getList = async function () {
  const Devices = cms.getModel('Devices');
  return Devices.find({});
};

module.exports.register = async function (info) {
  const Devices = cms.getModel('Devices');
  return Devices.create(info);
};

module.exports.pushMessage = async function (tokens, data) {
  console.log(data);
  const message = {
    data: { files: JSON.stringify(data) },
    tokens: tokens
  };
  return admin.messaging().sendMulticast(message);
};
