const Job = cms.getModel('Job');

module.exports.createJob = function (deviceId, type) {
  return Job.create({
    device: deviceId,
    type,
    status: 'running',
    begin: new Date()
  });
};

module.exports.findJob = function findJob(deviceId, status) {
  return Job.findOne({ device: deviceId, status }).sort({ 'date': -1 });
};
