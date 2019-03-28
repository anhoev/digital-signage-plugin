const _ = require('lodash');
const Joi = require('joi');
const Device = cms.getModel('Device');
const ConnectionHistory = cms.getModel('ConnectionHistory');

const EVENT = {
  APP_ACTION_DELETE_FILE: 'APP_ACTION_DELETE_FILE',
  APP_ACTION_PUSH_FILES: 'APP_ACTION_PUSH_FILES',
  APP_ACTION_PUSH_PLAYLIST: 'APP_ACTION_PUSH_PLAYLIST',
  APP_ACTION_DELETE_PLAYLIST: 'APP_ACTION_DELETE_PLAYLIST',
  APP_ACTION_SET_ACTIVE_PLAYLIST: 'APP_ACTION_SET_ACTIVE_PLAYLIST',
  WEB_LISTENER_DELETE_FILE: 'WEB_LISTENER_DELETE_FILE',
  WEB_LISTENER_GET_LIST_FILE: 'WEB_LISTENER_GET_LIST_FILE',
  WEB_LISTENER_GET_PLAYLIST: 'WEB_LISTENER_GET_PLAYLIST',
  WEB_LISTENER_DELETE_PLAYLIST: 'WEB_LISTENER_DELETE_PLAYLIST',
  WEB_LISTENER_SET_ACTIVE_PLAYLIST: 'WEB_LISTENER_SET_ACTIVE_PLAYLIST',
  WEB_EVENT_LIST_FILE: 'WEB_EVENT_LIST_FILE',
  WEB_EVENT_LIST_PLAYLIST: 'WEB_EVENT_LIST_PLAYLIST',
  WEB_EVENT_LIST_ONLINE_DEVICE: 'WEB_EVENT_LIST_ONLINE_DEVICE',
  WEB_LISTENER_VIEW_DEVICE: 'WEB_LISTENER_VIEW_DEVICE',
  WEB_LISTENER_GET_ONLINE_DEVICE: 'WEB_LISTENER_GET_ONLINE_DEVICE',
  ERROR: 'ERROR'
};


const contentSchema = Joi.object().keys({
  _id: Joi.string().required(),
  name: Joi.string(),
  type: Joi.string(),
  status: Joi.boolean(),
  ext: Joi.string(),
  path: Joi.string(),
  parts: Joi.array().items(Joi.string()),
  tag: Joi.array()
});

const playlistSchema = Joi.object().keys({
  content: Joi.array().items(Joi.object().keys({ media: contentSchema, duration: Joi.number() })),
  _id: Joi.string(),
  name: Joi.string()
});

const arrayPlaylistSchema = Joi.array().items(playlistSchema);

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
  const data = {
    device: socket.device._id,
    date: new Date(),
    type: status ? 'online' : 'offline'
  };
  ConnectionHistory.create(data);
  // Device.findOneAndUpdate({ _id: socket.device._id }, { online: status }).then(res => console.log(res)).catch(err => console.log(err));
}

module.exports = cms => {
  const appNamespace = cms.io.of('/file-manager-app');
  const webNamespace = cms.io.of('/file-manager-web');
  const onlineDevices = {};

  appNamespace.use(socketAppMiddleware);
  appNamespace.on('connection', function (socket) {
    onlineDevices[socket.device._id] = socket;
    webNamespace.emit(EVENT.WEB_EVENT_LIST_ONLINE_DEVICE, Object.keys(onlineDevices));

    changeStatusDevice(socket, true);

    socket.on('disconnect', () => {
      changeStatusDevice(socket, false);
      delete onlineDevices[socket.device._id];
      webNamespace.emit(EVENT.WEB_EVENT_LIST_ONLINE_DEVICE, Object.keys(onlineDevices));
      console.log('disconnected');
    });
  });

  webNamespace.on('connection', function (socket) {

    socket.on(EVENT.WEB_LISTENER_GET_ONLINE_DEVICE, () => {
      socket.emit(EVENT.WEB_EVENT_LIST_ONLINE_DEVICE, Object.keys(onlineDevices));
    });

    socket.on(EVENT.WEB_LISTENER_VIEW_DEVICE, deviceId => {
      socket.leaveAll();
      socket.join(`files${deviceId}`);
    });

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
          deviceSocket.emit(EVENT.APP_ACTION_DELETE_FILE, name, (err, data) => {
            onDone(err, data);
            socket.broadcast.in(`files${deviceId}`).emit(EVENT.WEB_EVENT_LIST_FILE, data);
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
          deviceSocket.emit(EVENT.APP_ACTION_PUSH_PLAYLIST, (err, playlist) => {
            if (err) {
              callbackOnViewPlaylist(err);
            } else {
              const isValid = arrayPlaylistSchema.validate(playlist, { allowUnknown: true });
              if (isValid.error) {
                console.log('error on receive playlist', isValid.error.message);
                callbackOnViewPlaylist(isValid.error.message);
              } else {
                callbackOnViewPlaylist(null, playlist);
              }
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
          deviceSocket.emit(EVENT.APP_ACTION_DELETE_PLAYLIST, playlistId, (err, playlist) => {
            if (err) {
              callbackOnDeletePlaylist(err);
            } else {
              callbackOnDeletePlaylist(null, playlist);
              socket.broadcast.in(`files${deviceId}`).emit(EVENT.WEB_EVENT_LIST_PLAYLIST, playlist);
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

    socket.on(EVENT.WEB_LISTENER_SET_ACTIVE_PLAYLIST, (deviceId, playlistId, callbackOnDeletePlaylist) => {
      if (deviceId && playlistId) {
        const deviceSocket = onlineDevices[deviceId];
        if (deviceSocket) {
          deviceSocket.emit(EVENT.APP_ACTION_SET_ACTIVE_PLAYLIST, playlistId, (err, playlist) => {
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
