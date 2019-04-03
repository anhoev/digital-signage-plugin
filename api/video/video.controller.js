const fs = require('fs');
const uploadService = require('./video.service');
const fileService = require('../../common/services/file.service');
const config = require('../../config/environment');
const path = require('path');

exports.upload = async function (req, res, next) {
  if (Object.keys(req.files).length === 0) {
    return res.status(400).json({ err: 'file is required' });
  }
  const pathFile = path.join(config.imageStore, req.query.toPath || '', req.namebase);
  uploadService.handlerUpload(req.pathPar, pathFile)
    .then(err => {
      // if (err) //#endregion
      //   return
      // next();
      res.send('success');
    })
    .catch(err => {
      return res.status(400).json({ err: err });
    });
};

exports.delete = async function (req, res) {
  const _path = req.query.path;
  uploadService.deleteFile(_path)
    .then((res) => {
      res.status(200).json({ ok: 'ok' });
    })
    .catch(err => {
      res.status(400).json({ err });
    });
};

exports.deleteFolder = async function (req, res) {
  const _path = req.query.path;
  const removePath = path.join(config.imageStore, _path);

  fs.rmdir(removePath, (err) => {
    if (err) {
      res.status(400).json({ err });
    } else {
      res.status(200).json({ ok: 'ok' });
    }
  });
};

exports.getFolder = async function (req, res, next) {
  const tree = uploadService.getDirectoryTree();
  res.status(200).json({ tree });
};
exports.newFolder = async function (req, res, next) {
  try {
    uploadService.newFolder(req.body.path, req.body.name);
    res.status(200).json({ ok: 'ok' });
  } catch (e) {
    res.status(400).json({ err: e });
  }
};
