const Playlist = cms.getModel('Playlist');
const _ = require('lodash');
const admin = require('firebase-admin');

module.exports.pushPlaylist = async function (playlistId, devices) {
  const res = await Playlist.findById(playlistId).populate('content.media').populate('device');
  const pushData = _.pick(res, ['content', 'id', 'name']);
  const message = {
    data: {playlist: JSON.stringify(pushData), type: 'playlist'},
    tokens: devices
  };
  return admin.messaging().sendMulticast(message);
};
