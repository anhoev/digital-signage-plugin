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

module.exports.splitFile = function (_path, maxSize, outputPatch, cb) {
  let maxFileSize = maxSize;
  let outputPath = outputPatch;
  let readStream = fs.createReadStream(_path);
  splitFileStream.split(readStream, maxFileSize, path.join(outputPath, path.basename(_path)), (filePaths) => {
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
    // filePaths.forEach(filePath => {
    //     // const hash = md5File.sync(parts);
    //     md5File(filePath, (err, hash) => {
    //         if (err) throw err;
    //         fs.writeFileSync(`${filePath}.md5`, hash, 'utf-8');
    //     })
    // });
    // return cb();
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
