const path = require('path');

module.exports.upload = function (req, res) {
  if (Object.keys(req.files).length === 0) {
    return res.status(400).json({ err: 'file is required' });
  }
  const pathFile = path.join(req.query.toPath || '', req.namebase);
  const name = path.basename(req.namebase, path.extname(req.namebase));
  const ext = path.extname(req.namebase);
  const fullName = path.basename(req.namebase);
  res.status(200).json({ path: pathFile, name, ext, fullName });
};
