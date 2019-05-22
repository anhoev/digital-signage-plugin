const videoApi = require('./api/video');
const configApi = require('./api/config');
const deviceApi = require('./api/devices');
const playListApi = require('./api/playlist');
const apkApi = require('./api/apk-manager');
const fileApi = require('./api/file-manager');
const contentHistoryApi = require('./api/content-history');
const fileSocket = require('./api/socket/filemanager.socket');
const path = require('path');

module.exports = cms => {
  cms.app.use('/digital/video', videoApi);
  cms.app.use('/digital/file', fileApi);
  cms.app.use('/digital/apk-manager', apkApi);
  cms.app.use('/digital/config', configApi);
  cms.app.use('/digital/devices', deviceApi);
  cms.app.use('/digital/playlist', playListApi);
  cms.app.use('/digital/content-history', contentHistoryApi);
  cms.app.use('/video', cms.express.static(cms.storage));
  cms.use(fileSocket);
};
