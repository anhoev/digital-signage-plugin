const ContentHistory = cms.getModel('ContentHistory');
const Device = cms.getModel('Device');

module.exports.addContentHistory = async function (data, deviceToken) {
  const deviceId = await Device.findOne({ token: deviceToken });
  const insertData = data.map(item => {
    return {
      ...item,
      device: deviceId
    };
  });
  return ContentHistory.insertMany(insertData);
};
