const { getLatestCount } = require('../counter/counter.service');
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
