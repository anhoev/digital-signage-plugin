const admin = require('firebase-admin');
const { getLatestCount } = require('../counter/counter.service');

const cms = global.cms;
const Device = cms.getModel('Device');

module.exports.getList = async function () {
  return Device.find({});
};

module.exports.register = async function (info) {
  return new Promise((resolve, reject) => {
    Device.findOne({ token: info.token })
      .then(res => {
        if (res) {
          Device.findOneAndUpdate({ token: info.token }, info, { upsert: true, new: true })
            .then(resolve).catch(reject);
        } else {
          getLatestCount('Device')
            .then((counter) => {
              Device.create({
                ...info, deviceCode: counter
              })
                .then(resolve)
                .catch(reject);
            })
            .catch((err => {
              reject(err);
            }));
        }
      });
  });
};

module.exports.pushMessage = async function (tokens, data) {
  const message = {
    data: { files: JSON.stringify(data), type: 'file' },
    tokens: tokens
  };
  return admin.messaging().sendMulticast(message);
};
