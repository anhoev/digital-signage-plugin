/**
 * @author anonymouse
 * @description upload base service
 */

const fs = require('fs');
const del = require('del');
const path = require('path');
const multer = require('multer');
const mkdirp = require('mkdirp');

const utilService = require('./util.service');
const config = require('../../config/environment');

const splitExtNameFile = function (pathFile) {
  return path.basename(pathFile, path.extname(pathFile));
};

/**
 * @method storage folder && set name file
 */
let disStorageMultiple = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file && file.originalname) {
      file.originalname = utilService.toUrl(file.originalname, true);
    }
    const pathUpload = path.join(config.imageStore, req.query.toPath || '');
    const pathPartsMedia = config.prefixFile + file.originalname;
    const stat = fs.existsSync(pathUpload);
    if (!stat) {
      fs.mkdirSync(pathUpload);
    }
    fs.readdirSync(pathUpload).forEach((fileName) => {
      if (splitExtNameFile(pathPartsMedia) === splitExtNameFile(fileName)) {
        (async () => {
          await del([path.join(__dirname, '.parts', splitExtNameFile(file.originalname))]);
          await del([path.join(__dirname, file.originalname)]);
        })();
      }
    });
    const pathParts = path.format({
      dir: path.join(config.imageStore, '.parts'),
      base: [...req.query.toPath.split(path.sep), splitExtNameFile(pathPartsMedia)].filter(a => a).join('_')
    });
    req.pathPar = pathParts;

    mkdirp(pathParts, function (err) {
      if (err) {
        console.error(err);
      }
    });
    return cb(null, pathUpload);
  },
  filename: function (req, file, cb) {
    req.namebase = config.prefixFile + file.originalname;
    return cb(null, config.prefixFile + file.originalname);
  }
});

/**
 * @method deleteFromFile
 * @param {*} arrKey
 */
function deleteFromFile(arrKey) {
  if ('string' === typeof arrKey) {
    arrKey = [arrKey];
  }
  arrKey.forEach(key => {
    fs['unlink'](path.join(config.imageStore, key), () => {
      console.log(`Delete file success: ${key}`);
    });
  });
}

/**
 * @method removeFileUpload
 * @description remove file upload when exception api call
 * @param req
 */
function removeFileUpload(req) {
  let arrKey = [];
  for (let key in req.files) {
    for (const imageKey of req.files[key]) {
      arrKey = arrKey.concat(imageKey['filename']);
    }
  }
  deleteFromFile(arrKey);
}

exports.uploadBase = {
  uploadFileBase: multer({
    storage: disStorageMultiple
  }),
  deleteFile: deleteFromFile,
  removeFileUpload: removeFileUpload
};
