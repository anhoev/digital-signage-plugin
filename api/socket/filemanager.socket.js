const Device = cms.getModel('Device');
const _ = require('lodash');

const EVENT = {
  APP_ACTION_DELETE_FILE: 'APP_ACTION_DELETE_FILE',
  APP_ACTION_PUSH_FILES: 'APP_ACTION_PUSH_FILES',
  APP_ACTION_PUSH_PLAYLIST: 'APP_ACTION_PUSH_PLAYLIST',
  APP_ACTION_DELETE_PLAYLIST: 'APP_ACTION_DELETE_PLAYLIST',
  WEB_LISTENER_DELETE_FILE: 'WEB_LISTENER_DELETE_FILE',
  WEB_LISTENER_GET_LIST_FILE: 'WEB_LISTENER_GET_LIST_FILE',
  WEB_LISTENER_GET_PLAYLIST: 'WEB_LISTENER_GET_PLAYLIST',
  WEB_LISTENER_DELETE_PLAYLIST: 'WEB_LISTENER_DELETE_PLAYLIST',
  ERROR: 'ERROR'
};

function socketAppMiddleware(socket, next) {
  const token = socket.handshake.query.token;
  if (!token) {
    socket.disconnect();
    next('token must be provide');
  } else {
    Device.findOne({ token: token })
      .then(res => {
        if (res) {
          socket.device = res;
          next();
        } else {
          socket.disconnect();
          return next('device not found');
        }
      })
      .catch(err => {
        socket.disconnect();
        next(err);
      });
  }
}

function changeStatusDevice(socket, status) {
  Device.findOneAndUpdate({ _id: socket.device._id }, { online: status }).then(res => console.log(res)).catch(err => console.log(err));
}

module.exports = cms => {
  const appNamespace = cms.io.of('/file-manager-app');
  const webNamespace = cms.io.of('/file-manager-web');
  const onlineDevices = {};

  appNamespace.use(socketAppMiddleware);
  appNamespace.on('connection', function (socket) {
    onlineDevices[socket.device._id] = socket;

    changeStatusDevice(socket, true);

    socket.on('disconnect', () => {
      changeStatusDevice(socket, false);
      delete onlineDevices[socket.device._id];
      console.log('disconnected');
    });
  });

  webNamespace.on('connection', function (socket) {
    socket.on(EVENT.WEB_LISTENER_GET_LIST_FILE, (deviceId, callbackOnViewDevice) => {
      if (deviceId) {
        const deviceSocket = onlineDevices[deviceId];
        if (deviceSocket) {
          deviceSocket.emit(EVENT.APP_ACTION_PUSH_FILES, (err, data) => {
            if (err) {
              callbackOnViewDevice(err);
            } else {
              callbackOnViewDevice(null, data);
            }
          });
          setTimeout(() => {
            callbackOnViewDevice('connect device timeout');
          }, 8000);
        } else {
          callbackOnViewDevice('device offline');
        }
      } else {
        callbackOnViewDevice('id is require');
      }
    });

    socket.on(EVENT.WEB_LISTENER_DELETE_FILE, (deviceId, name, onDone) => {
      if (deviceId && name) {
        const deviceSocket = onlineDevices[deviceId];
        if (deviceSocket) {
          deviceSocket.emit(EVENT.APP_ACTION_DELETE_FILE, name, () => {
            onDone();
          });
        } else {
          onDone('device offline');
        }
      } else {
        onDone('name and id is require');
      }
    });

    socket.on(EVENT.WEB_LISTENER_GET_PLAYLIST, (deviceId, callbackOnViewPlaylist) => {
      if (deviceId) {
        const deviceSocket = onlineDevices[deviceId];
        if (deviceSocket) {
          deviceSocket.emit(EVENT.APP_ACTION_PUSH_PLAYLIST, name, (err, playlist) => {
            if (err) {
              callbackOnViewPlaylist(err);
            } else {
              callbackOnViewPlaylist(null, playlist);
            }
          });
          setTimeout(() => {
            callbackOnViewPlaylist('connect device timeout');
          }, 8000);
        }
      } else {
        callbackOnViewPlaylist('id is require');
      }
    });

    socket.on(EVENT.WEB_LISTENER_DELETE_PLAYLIST, (deviceId, playlistId, callbackOnDeletePlaylist) => {
      if (deviceId && playlistId) {
        const deviceSocket = onlineDevices[deviceId];
        if (deviceSocket) {
          deviceSocket.emit(EVENT.APP_ACTION_DELETE_PLAYLIST, name, (err, playlist) => {
            if (err) {
              callbackOnDeletePlaylist(err);
            } else {
              callbackOnDeletePlaylist(null, playlist);
            }
          });
          setTimeout(() => {
            callbackOnDeletePlaylist('connect device timeout');
          }, 8000);
        }
      } else {
        callbackOnDeletePlaylist('device id and playlist id is require');
      }
    });
  });
};
