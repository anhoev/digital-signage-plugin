const Playlist = cms.getModel('Playlist');
const _ = require('lodash');
const admin = require('firebase-admin');

module.exports.pushPlaylist = function (playlistId) {
  return Playlist.findById(playlistId).populate('content.media').populate('device').then(res => {
    const pushData = _.pick(res, ['content', 'id', 'name']);

    const message = {
      data: { playlist: JSON.stringify(pushData), type: 'playlist' },
      tokens: res.device.map(i => i.token)
    };
    return admin.messaging().sendMulticast(message);
  });
};
