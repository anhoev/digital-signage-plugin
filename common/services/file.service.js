const fs = require('fs');
let path = require('path');
const md5File = require('md5-file');
const admin = require('firebase-admin');
const splitFileStream = require('split-file-stream');
const _ = require('lodash');

// const config = require('../../config/development');
const async = require('async');
const serviceAccount = require('../../config/another/screenadsapp-firebase-adminsdk-mty61-4b0090cf8d.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

function removeExtname(name) {
  return path.basename(`${name}`, `${path.extname(name)}`);
}

module.exports.sortDirectories = function (pathFile) {
  const str = '' + 1;
  const pad = '0000';
  const ans = pad.substring(0, pad.length - str.length) + str;
  let directories = {};
  pathFile.forEach((file) => {
    directories[removeExtname(file.video)] = [];
    file.parts = file.parts.sort(function (a, b) {
      return a - b;
    });
  });
  return Array.of(pathFile);
};

module.exports.splitFile = function (_path, maxSize, outputParts, cb) {
  let maxFileSize = maxSize;
  let readStream = fs.createReadStream(_path);
  fs.mkdirSync(outputParts);
  const basename = path.basename(outputParts);
  splitFileStream.getSplitWithGenFilePath((n) => `${outputParts}${path.sep}${basename}.split-${_.padStart(n, 4, '0')}`)(readStream, maxFileSize, (filePaths) => {
    async.each(filePaths, function (filePath, cb) {
      md5File(filePath, (err, hash) => {
        if (err) {
          return cb(err);
        }
        fs.writeFile(`${filePath}.md5`, hash, 'utf8', function (err) {
          if (err) {
            return cb(err);
          }
          return cb();
        });
      });
    }, function (err) {
      if (err) {
        return cb(err);
      }
      return cb();
    });
  });
};
module.exports.notify = async function (registrationToken, payload) {
  console.log(registrationToken, payload);
  return admin.messaging().sendToDevice(registrationToken, payload);
};

module.exports.removeFolder = function (dirPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        Promise.all(files.map(item => {
          return new Promise((resolve, reject) => {
            fs.unlink(path.join(dirPath, item), (err) => {
              if (err) {
                reject(err);
              }
              resolve();
            });
          });
        }))
          .then(
            () => {
              return fs.rmdir(dirPath, err => {
                if (err) {
                  reject(err);
                }
                resolve();
              });
            }).catch(reject);
      }
    });
  });
};

module.exports.removeUnicode = function (str) {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');

  str = str.replace(/-+-/g, '-'); //thay thế 2- thành 1-
  str = str.replace(/^\-+|\-+$/g, '');
  str = str.replace(/[^\u000A\u0020-\u007E]/g, '');

  return str;
};
