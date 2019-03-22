/**
 * @author HaiNL
 * @description video service
 */

const fs = require('fs');
let path = require('path');
const _ = require('lodash');
const cms = global['cms'];
const config = require('../../config/environment');
const Videos = require('./video.model');
const fileService = require('../../common/services/file.service');
const notifyService = require('../../common/services/notify.service');
// const registrationToken = require('../../common/constants/consts').REGISTRATION_TOKEN;
const dirtree = require('directory-tree');

exports.create = async function (_param) {
  const newVideo = new Videos(_param);
  return await newVideo.save();
};

exports.list = async function (_params) {
  const optionFind = {
    $and: []
  };
  if (optionFind.$and.length === 0) {
    Reflect.deleteProperty(optionFind, '$and');
  }
  return await Videos
    .find(optionFind, _params)
    .exec();
};

exports.handlerUpload = async function (outputPatch, pathFile) {
  const maxSize = config.split_size;
  const namebase = path.basename(pathFile);

  fileService.splitFile(pathFile, maxSize, outputPatch, async (err) => {
    if (err) {
      throw err;
    }
    const ext = path.extname(namebase);
    const param = {
      video: path.basename(namebase, path.extname(namebase)),
      path: path.relative(config.imageStore, pathFile),
      parts: [],
      ext
    };
    fs.readdirSync(outputPatch)
      .forEach((fileName) => {
        param.parts.push(fileName);
      });
    const MediaFile = cms.getModel('MediaFile');
    const newVideo = await MediaFile.findOneAndUpdate({
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

function onEachFile(item) {
  item.path = path.relative(config.imageStore, item.path);
}

exports.getDirectoryTree = function () {
  return dirtree(path.join(config.imageStore), { exclude: /\.parts/ }, onEachFile, onEachFile);
};

exports.newFolder = function (_path, name) {
  fs.mkdirSync(path.join(config.imageStore, _path, name));
};
