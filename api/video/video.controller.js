const fs = require('fs');
const uploadService = require('./video.service');
const fileService = require('../../common/services/file.service');
const config = require('../../config/environment');
const path = require('path');

exports.detail = function (req, res) {
  res.json({
    success: 200
  });
};

exports.upload = async function (req, res, next) {
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

function generatePartsFolderName(_path) {
  const fileNameWithOutExtension = path.basename(_path, path.extname(_path));
  const dirName = path.dirname(_path);
  if (dirName === '.') {
    const partFolderName = ['', fileNameWithOutExtension].join('_');
    return path.join(config.imageStore, '.parts', partFolderName);
  } else {
    const dirnameReplace = dirName.split(path.sep); // "a/b/c" =>[a,b,c]
    const partFolderName = [...dirnameReplace, fileNameWithOutExtension].join('_');
    return path.join(config.imageStore, '.parts', partFolderName);
  }
}

exports.delete = async function (req, res) {
  const _path = req.query.path;
  const unlinkPath = path.join(config.imageStore, _path);
  const MediaFile = global.cms.getModel('MediaFile');
  Promise.all([
      new Promise((resolve, reject) => {
        fs.unlink(unlinkPath, (err) => {
          if (err) {
            reject(err);
          } else {
            const pathParts = generatePartsFolderName(_path);
            fileService.removeFolder(pathParts).then(() => {
              resolve();
            }).catch(err => {
              reject(err);
            });
          }
        });
      }),
      MediaFile.findOneAndRemove({ path: _path })
    ]
  ).then((res) => {
    res.status(200).json({ ok: 'ok' });
  }).catch(err => {
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

exports.getDirectories = async function (req, res) {
  const params = req.query;
  let directoriesAfterSort;
  let directories = await uploadService.list(params);
  if (directories) {
    directoriesAfterSort = fileService.sortDirectories(directories);
  }
  return res.json({
    directories: directoriesAfterSort
  });
};

exports.announce = async function (req, res) {
  const registrationToken = 'eADtxI5Ucbo:APA91bElAdY13pXYq4v-W-GeyoUtZiodjmVL3JJtGCs4KaGYa4ahH7qB8Zoet8LlqqMf03jHeQ0gV-RAuDYmc-EF7Ncl9568kqD_gu2J_pyBCe7SUFPSnEFbFKLxJDON0cyN0zpRCxcz';
  var payload = {
    notification: {
      title: 'Hello',
      body: 'You ',
      subtitle: 'title'
    }
  };

  fileService.notify(registrationToken, payload).then(success => {
    console.log('success', success);
    res.json({
      data: 'done'
    });
  }).catch(err => {
    res.json({
      data: 'fail'
    });
  });

};
