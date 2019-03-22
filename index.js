const videoApi = require('./api/video');
const configApi = require('./api/config');
const deviceApi = require('./api/devices');
const path = require('path');

module.exports = cms => {
  cms.app.use('/digital/video', videoApi);
  cms.app.use('/digital/config', configApi);
  cms.app.use('/digital/devices', deviceApi);
  cms.app.use('/video', cms.express.static(path.join(__dirname, '../../', 'upload')));
};
