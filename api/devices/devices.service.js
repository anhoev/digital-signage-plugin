const admin = require('firebase-admin');

const cms = global.cms;
const Device = cms.getModel('Device');

module.exports.getList = async function () {
  return Device.find({});
};

module.exports.register = async function (info) {
  return Device.create(info);
};

module.exports.pushMessage = async function (tokens, data) {
  console.log(data);
  const message = {
    data: { files: JSON.stringify(data) },
    tokens: tokens
  };
  return admin.messaging().sendMulticast(message);
};
