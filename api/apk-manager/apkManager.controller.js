const { getLatestCount } = require('../counter/counter.service');
const request = require('request');
module.exports.update = async function (req, res) {
  try {
    const Model = cms.getModel('ApkVersion');
    const version = await getLatestCount('ApkVersion');
    const result = await Model.findOneAndUpdate({}, { releaseVersion: version, linkDownload: req.body.linkDownload }, { upsert: true, new: true });
    res.status(200).json({ data: result });

  } catch (e) {
    res.status(400).json({ err: e });
  }

};

module.exports.get = async function (req, res) {
  try {
    const Model = cms.getModel('ApkVersion');
    const result = await Model.findOne({});
    res.status(200).json({ data: result });
  } catch (e) {
    res.status(400).json({ err: e });
  }
};
module.exports.getAppCenterUpdate = async function (req, res) {
  try {
    const SystemConfig = cms.getModel('SystemConfig');
    const { SecretKey, DistributionGroup } = await SystemConfig.findOne({});
    req.pipe(request({
      url: `https://api.appcenter.ms/v0.1/public/sdk/apps/${SecretKey}/distribution_groups/${DistributionGroup}/releases/latest`,
      headers: {
        'X-API-Token': result.ApiToken
      }
    })).pipe(res);
  } catch (e) {
    res.status(400).json({ err: e });
  }
};
