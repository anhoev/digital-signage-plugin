<template>
    <v-layout row="" wrap="" style="height: 100%">
        <v-dialog v-model="dialogPushToDevice" width="500">
            <push-to-device :devices="devices" :online-devices="onlineDevices" @push-notify="pushNotify">
        </push-to-device></v-dialog>
        <v-dialog v-model="trackProgressModel" width="1200">
            <div style="height: 90vh; background: #fff; overflow: auto">
                <progress-tracking v-if="trackProgressModel">
            </progress-tracking></div>
        </v-dialog>
        <v-flex md9="">
            <v-container fluid="">
                <v-layout row="" wrap="" v-if="selectedPlaylist">
                    <v-flex md12="">
                        <v-btn @click="dialogPushToDevice=true">Push</v-btn>
                    </v-flex>
                    <v-flex shrink="" md6="">
                        <v-card style="width: 500px">
                            <v-list style="width: 100%;">
                                <v-list-tile fill-width="" v-for="item in selectedPlaylist.content" :key="item.path" avatar="" class="py-2" @click="">
                                    <v-list-tile-avatar>
                                        <i class="far fa-folder grid-icon" v-if="item.media.type==='directory'"></i>
                                        <i class="far fa-file grid-icon" v-else=""></i>
                                    </v-list-tile-avatar>
                                    <v-list-tile-content>
                                        <v-list-tile-title>name: {{item.media.name}}</v-list-tile-title>
                                        <v-list-tile-sub-title>path: {{item.media.path}}</v-list-tile-sub-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                            </v-list>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-flex>
        <v-flex md3="" style="border-left: 1px solid #ddd;">
            <v-layout row="" wrap="">
                <v-list dense="" style="width: 100%">
                    <v-list-tile v-for="item in playlist" @click="selectItem(item)" :key="item._id" :class="{'selected-playlist':isSelected(item)}">
                        <v-list-tile-content>
                            <v-list-tile-title>{{item.name}}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-layout>
        </v-flex>
    </v-layout>
</template>
<script>
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _socket = _interopRequireDefault(require("socket.io-client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'Playlist',
  data: () => ({
    drawer: true,
    drawerRight: true,
    right: null,
    left: null,
    playlist: [],
    selectedPlaylist: null,
    devices: [],
    selectedDevices: [],
    onlineDevices: [],
    dialogPushToDevice: false,
    trackProgressModel: false,
    progress: []
  }),
  props: {
    source: String
  },
  methods: {
    isOnline(device) {
      return this.onlineDevices.indexOf(device._id) > -1;
    },

    isSelected(item) {
      if (!this.selectedPlaylist) {
        return false;
      }

      return this.selectedPlaylist._id === item._id;
    },

    changeDevice(event, token) {
      if (event === true) {
        const isExist = this.selectedDevices.includes(token);

        if (!isExist) {
          this.selectedDevices.push(token);
        }
      } else {
        this.selectedDevices = this.selectedDevices.filter(i => i !== token);
      }
    },

    getPlaylist() {
      const Model = cms.getModel('Playlist');
      Model.find({}).then(res => this.playlist = res);
    },

    selectItem(item) {
      const Model = cms.getModel('Playlist');
      Model.findById(item._id).populate('content.media').populate('device').then(res => {
        this.selectedPlaylist = res;
      });
    },

    pushNotify(selectedDevices) {
      this.$options.socket.emit('WEB_LISTENER_PUSH_PLAYLIST_TO_DEVICE', selectedDevices, this.selectedPlaylist._id, err => {
        this.$confirm(`Push to device success${err ? `, number of error: ${err.length}` : ''}`, {
          buttons: [{
            text: 'track progress',
            value: true,
            color: 'primary',
            onClick: () => this.trackProgressModel = true
          }, {
            text: 'close',
            value: true,
            color: 'primary'
          }]
        });
      });
    },

    getDevices() {
      const Model = cms.getModel('Device');
      Model.find({}).then(res => {
        console.log(res);
        this.devices = res;
      });
    },

    connectSocket() {
      this.$options.socket = _socket.default.connect(`ws://${location.hostname}:8888/file-manager-web`);
      this.$options.socket.on('WEB_EVENT_PLAYLIST_PROGRESS', res => {
        this.progress = res;
      });
      this.$options.socket.on('connect', () => {
        this.$options.socket.emit('WEB_LISTENER_GET_ONLINE_DEVICE');
      });
      this.$options.socket.on('WEB_EVENT_LIST_ONLINE_DEVICE', list => {
        this.onlineDevices = list;
      });
    }

  },

  mounted() {
    this.getPlaylist();
    this.getDevices();
    this.connectSocket();
  },

  beforeDestroy() {
    this.$options.socket && this.$options.socket.close();
  }

};
exports.default = _default;
</script> 
<style scoped>.selected-playlist {
  background-color: #03a9f4;
  color: #fff; }
  .selected-playlist .v-list__tile__title {
    transition: none !important; }

.online {
  color: #40bf5e; }

.offline {
  color: #c14444; }
</style>
<style>
    .radio-group .v-input__control {
        width: 100%
    }
</style>
