/**
 * @author HaiNL
 * @description video service
 */

const fs = require('fs');
let path = require('path');
const _ = require('lodash');
const cms = global['cms'];
const config = require('../../config/environment');
const fileService = require('../../common/services/file.service');
const notifyService = require('../../common/services/notify.service');
// const registrationToken = require('../../common/constants/consts').REGISTRATION_TOKEN;
const dirtree = require('directory-tree');
const Content = global.cms.getModel('Content');

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

function onEachFile(item) {
  item.path = path.relative(config.imageStore, item.path);
}

exports.handlerUpload = async function (outputPatch, pathFile) {
  const maxSize = config.split_size;
  const namebase = path.basename(pathFile);

  fileService.splitFile(pathFile, maxSize, outputPatch, async (err) => {
    if (err) {
      throw err;
    }
    const ext = path.extname(namebase);
    const param = {
      name: path.basename(namebase, path.extname(namebase)),
      path: path.relative(config.imageStore, pathFile),
      parts: [],
      ext
    };
    fs.readdirSync(outputPatch)
      .forEach((fileName) => {
        param.parts.push(fileName);
      });
    const newVideo = await Content.findOneAndUpdate({
      path: param.path
    }, {
      $set: param
    }, {
      upsert: true
    })
      .exec();
    if (newVideo) {
      let payload = {
        notification: {
          title: 'Hello',
          body: 'You '
        }
      };
      const registrationToken = 'eADtxI5Ucbo:APA91bElAdY13pXYq4v-W-GeyoUtZiodjmVL3JJtGCs4KaGYa4ahH7qB8Zoet8LlqqMf03jHeQ0gV-RAuDYmc-EF7Ncl9568kqD_gu2J_pyBCe7SUFPSnEFbFKLxJDON0cyN0zpRCxcz';
      notifyService.push(registrationToken, payload)
        .catch(err => console.log(err));
    }
    return newVideo;
  });
};

exports.getDirectoryTree = function () {
  return dirtree(path.join(config.imageStore), { exclude: /\.parts/ }, onEachFile, onEachFile);
};

exports.newFolder = function (_path, name) {
  fs.mkdirSync(path.join(config.imageStore, _path, name));
};

exports.deleteFile = function (_path) {
  const unlinkPath = path.join(config.imageStore, _path);
  return Promise.all([
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
      Content.findOneAndRemove({ path: _path })
    ]
  );
};
