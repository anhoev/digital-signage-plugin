<template>
    <v-layout row="" style="height: 100%">
        <v-flex shrink="" style="border-right: 1px solid #ddd; max-width: 300px; max-height: calc(100vh - 50px); overflow: auto; background: #fff">
            <v-list dense="" two-line="" avatar="">
                <template v-for="(item, index) in sortedDevices">
                    <v-list-tile :key="item._id" :class="{'selected-playlist':isSelected(item)}" @click="selectItem(item)">
                        <v-list-tile-avatar>
                            <i class="fas fa-mobile-alt" style="font-size: 1.5em; position: relative" :style="{opacity: item.isRegistered ? 1 : 0.5}">
                                <i class="fas fa-question" v-if="!item.isRegistered" style="position: absolute; top: 50%; left: 50%; font-size: 10px; margin-top: -6.5px; margin-left: -4px"></i>
                            </i>
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title v-if="item.isRegistered">{{item.name}}</v-list-tile-title>
                            <v-list-tile-title v-else="">Unregistered Device</v-list-tile-title>
                            <v-list-tile-sub-title>{{item.resolution}} <span v-if="!item.isRegistered">(Code: {{item.deviceCode}})</span>
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                        <v-list-tile-action>
                            <i class="fas fa-circle" :class="isOnline(item)?'online':'offline'"></i>
                        </v-list-tile-action>
                    </v-list-tile>
                    <v-divider v-if="index!==sortedDevices.length-1" style="opacity: 0.5; margin: 0 20px"></v-divider>
                </template>

            </v-list>
        </v-flex>
        <v-flex style="border-left: 1px solid #ddd; flex: 1; min-width: 0">
            <v-layout row="" wrap="">
                <v-flex shrink="" md12="" v-if="error">
                    <v-card-title>{{error}}</v-card-title>
                    <v-card-title v-if="lastOnline">last online: {{lastOnline.date}}</v-card-title>
                </v-flex>
                <v-card-title v-if="connecting &amp;&amp; !error">Connecting to device...
                </v-card-title>
                <v-flex md12="" v-else-if="!error &amp;&amp; selectedDevices &amp;&amp; selectedDevices.isRegistered">
                    <v-tabs v-model="active" color="cyan" dark="" slider-color="yellow">
                        <v-tab ripple="">
                            File Manager

                        </v-tab>
                        <v-tab ripple="">
                            Playlist
                        </v-tab>
                        <v-tab ripple="">
                            Schedule
                        </v-tab>
                        <v-tab ripple="">
                            Device Control
                        </v-tab>
                        <v-layout justify-end="" align-center="" style="color: #fff">
                            <div class="mx-2 pa-2">
                                <v-btn flat="" @click="showModalRegister=true">Edit device info</v-btn>
                            </div>
                            <div class="pa-2">
                                Free storage: {{toMegabytes(freeStorage.free)}} / {{toMegabytes(freeStorage.total)}}
                                (MB)
                            </div>
                        </v-layout>
                    </v-tabs>
                    <v-tabs-items v-model="active">
                        <v-tab-item>
                            <v-card style="width: 100%">
                                <v-list>
                                    <template v-for="(item, index) in files">
                                        <v-list-tile :key="item" avatar="" class="py-2" style="width: 100%">
                                            <v-list-tile-avatar>
                                                <i class="far fa-folder grid-icon"></i>
                                            </v-list-tile-avatar>
                                            <v-list-tile-content>
                                                <v-list-tile-title>name: {{item}}</v-list-tile-title>
                                                <v-list-tile-sub-title class="red--text" v-if="isFileNotInAnyPlaylist(item)">
                                                    This media is not in any playlist
                                                </v-list-tile-sub-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-btn icon="" ripple="" @click="deleteFile(item)">
                                                    <v-icon color="grey lighten-1">delete</v-icon>
                                                </v-btn>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                        <v-divider v-if="index!==files.length-1">
                                    </v-divider></template>
                                </v-list>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item>
                            <v-card style="width: 100%">
                                <v-expansion-panel v-if="Array.isArray(playlist)">
                                    <v-expansion-panel-content v-for="item in playlist" :key="item.name">
                                        <template v-slot:header="" class.native="pa-2">
                                            <v-list-tile class="py-2" style="width: 100%">
                                                <v-list-tile-content>
                                                    <v-list-tile-title>name: {{item.name}}
                                                    </v-list-tile-title>
                                                </v-list-tile-content>
                                                <v-list-tile-action>
                                                    <v-layout row="">
                                                        <v-btn icon="" ripple="" @click.prevent.stop="deletePlaylist(item)">
                                                            <v-icon color="grey lighten-1">delete</v-icon>
                                                        </v-btn>
                                                    </v-layout>
                                                </v-list-tile-action>
                                            </v-list-tile>
                                            <v-divider></v-divider>
                                        </template>
                                        <v-card>
                                            <v-list>
                                                <template v-for="(cItem, index) in item.content">
                                                    <v-list-tile v-if="cItem.media" avatar="" :key="cItem.media.path" class="py-2" style="width: 100%">
                                                        <v-list-tile-avatar size="100">
                                                            <thumbnail :item="cItem.media"></thumbnail>
                                                        </v-list-tile-avatar>
                                                        <v-list-tile-content>
                                                            <v-list-tile-title>name: {{cItem.media.name}}
                                                            </v-list-tile-title>
                                                            <v-list-tile-sub-title class="red--text" v-if="isFileNotExists(cItem.media.name + cItem.media.ext)">
                                                                This file is not existed in device's storage
                                                            </v-list-tile-sub-title>
                                                        </v-list-tile-content>
                                                    </v-list-tile>
                                                    <v-divider v-if="index!==item.content.length-1"></v-divider>
                                                </template>
                                            </v-list>
                                        </v-card>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item>
                            <v-card style="width: 100%">
                                <v-expansion-panel v-if="Array.isArray(playlist)">
                                    <v-expansion-panel-content v-for="model in schedule" :key="model._id">
                                        <template v-slot:header="" class.native="pa-2">
                                            <v-list-tile class="py-2" style="width: 100%">
                                                <v-list-tile-content>
                                                    <v-list-tile-title>Schedule Name: {{model.name}}</v-list-tile-title>
                                                    <v-list-tile-sub-title>
                                                        Time: from {{model.activeFrom}} to {{model.activeTo}}
                                                    </v-list-tile-sub-title>
                                                </v-list-tile-content>
                                                <v-list-tile-action>
                                                    <v-layout row="">
                                                        <v-btn icon="" ripple="" @click.prevent.stop="deleteSchedule(model)">
                                                            <v-icon color="grey lighten-1">delete</v-icon>
                                                        </v-btn>
                                                    </v-layout>
                                                </v-list-tile-action>
                                            </v-list-tile>
                                            <v-divider></v-divider>
                                        </template>
                                        <v-card>
                                            <v-list>
                                                <template v-for="(cItem, index) in model.weekdaySchedule">
                                                    <v-list-tile :key="index" class="py-2" style="width: 100%">
                                                        <v-list-tile-content>
                                                            <v-list-tile-title> {{cItem.playlist.name}}

                                                            </v-list-tile-title>
                                                            <v-list-tile-sub-title>
                                                                {{cItem.weekdays.join(', ')}}, {{cItem.from}} -
                                                                {{cItem.to}}{{cItem.in==='next day'? '(Next Day)':''}} :
                                                            </v-list-tile-sub-title>
                                                        </v-list-tile-content>
                                                    </v-list-tile>
                                                    <v-divider v-if="index!==model.weekdaySchedule.length-1"></v-divider>
                                                </template>
                                            </v-list>
                                        </v-card>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-card>
                        </v-tab-item>
                        <v-tab-item>
                            <v-card>
                                <div class="pa-2">
                                    Free storage: {{toMegabytes(freeStorage.free)}} / {{toMegabytes(freeStorage.total)}}
                                    (MB)
                                    <div style="width: 200px; height: 20px; border-radius: 10px; overflow: hidden; background: #ddd">
                                        <div style="height: 20px; background: #03a9f4" :style="{width: (freeStorage.free/freeStorage.total*100) + '%'}"></div>
                                    </div>
                                </div>

                                <v-btn @click="deleteDeviceData">
                                    Delete all device data
                                </v-btn>
                                <map-maker v-if="selectedDevices.coordinates" :lat="selectedDevices.coordinates.latitude" :lng="selectedDevices.coordinates.longitude"></map-maker>
                            </v-card>
                        </v-tab-item>
                    </v-tabs-items>
                </v-flex>
                <v-flex v-else-if="selectedDevices &amp;&amp; !selectedDevices.isRegistered">
                    <div class="pa-5">
                        Device is not register
                        <v-btn @click="showModalRegister = true" depressed="">Register</v-btn>
                        <div class="ma-5"></div>
                        <div style="max-width: 700px" v-if="selectedDevices.coordinates">
                            <map-maker :lat="selectedDevices.coordinates.latitude" :lng="selectedDevices.coordinates.longitude"></map-maker>
                        </div>
                    </div>
                </v-flex>
            </v-layout>
        </v-flex>
        <v-dialog v-model="showModalRegister" width="700" v-if="selectedDevices">
            <v-card pa-3="">
                <v-card-title>Device is not registered, please register</v-card-title>
                <v-card-text>
                    <g-field :fields="gfield" :model="selectedDevices"></g-field>
                </v-card-text>
                <v-card-actions>
                    <v-btn flat="" @click="onSaveDevice">Save</v-btn>
                    <v-btn flat="" @click="showModalRegister=false">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>
<script>
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _socket = _interopRequireDefault(require("socket.io-client"));

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'DeviceManager',
  data: () => ({
    drawer: true,
    drawerRight: true,
    right: null,
    left: null,
    files: [],
    selectedDevices: null,
    devices: [],
    error: '',
    connecting: false,
    active: null,
    playlist: [],
    onlineDevices: [],
    lastOnline: null,
    schedule: [],
    freeStorage: {},
    showModalRegister: false
  }),
  props: {
    source: String
  },
  computed: {
    sortedDevices() {
      return [...this.devices].sort((a, b) => {
        // console.log(this.onlineDevices.includes(b._id) - this.onlineDevices.includes(a._id));
        return this.onlineDevices.includes(b._id) - this.onlineDevices.includes(a._id) || a.isRegistered || false - b.isRegistered || false;
      });
    },

    gfield() {
      const filterList = ['token', 'resolution', 'deviceCode', 'isRegistered'];
      return cms.Types.Device.form.filter(i => !filterList.includes(i.key));
    }

  },
  methods: {
    deleteDeviceData() {
      _axios.default.post(cms.baseUrl + 'digital/p2p', {
        event: 'APP_ACTION_DELETE_DEVICE_DATA',
        deviceId: this.selectedDevices._id
      }).then(res => {
        this.selectItem(this.devices.find(i => i._id === this.selectedDevices._id));
      }).catch(err => {
        console.log(err);
      });
    },

    toMegabytes(n) {
      return Math.floor(n / 1048576);
    },

    onSaveDevice() {
      const data = {
        name: this.selectedDevices.name,
        os: this.selectedDevices.os,
        'os-version': this.selectedDevices['os-version'],
        model: this.selectedDevices.model,
        location: this.selectedDevices.location,
        isRegistered: true
      };
      cms.getModel('Device').findByIdAndUpdate(this.selectedDevices._id, data).then(res => {
        this.getDevices().then(() => {
          this.selectItem(this.devices.find(i => i._id === this.selectedDevices._id));
        });
        this.showModalRegister = false;

        _axios.default.post(cms.baseUrl + 'digital/p2p', {
          event: 'APP_ACTION_CHANGE_DEVICE_REGISTERED',
          deviceId: this.selectedDevices._id
        }).then(res => {
          console.log(res);
        }).catch(err => {
          console.log(err);
        });
      });
    },

    isOnline(device) {
      return this.onlineDevices.indexOf(device._id) > -1;
    },

    isSelected(item) {
      if (!this.selectedDevices) {
        return false;
      }

      return this.selectedDevices === item;
    },

    isFileNotInAnyPlaylist(name) {
      return !this.playlist.some(playlist => {
        return playlist.content.some(item => item.media && item.media.name + item.media.ext === name);
      });
    },

    isFileNotExists(name) {
      return !this.files.includes(name);
    },

    connectSocket() {
      this.$options.socket = _socket.default.connect(cms.baseUrl + 'file-manager-web', {
        query: {
          token: localStorage.getItem('__token')
        }
      });
      this.$options.socket.emit('WEB_LISTENER_GET_ONLINE_DEVICE');
      this.$options.socket.on('WEB_EVENT_LIST_FILE', files => {
        console.log('hello');
        this.files = files;
      });
      this.$options.socket.on('WEB_EVENT_LIST_PLAYLIST', playlist => {
        this.playlist = playlist;
      });
      this.$options.socket.on('WEB_EVENT_LIST_ONLINE_DEVICE', data => {
        this.onlineDevices = data;
      });
    },

    async getDevices() {
      const Model = cms.getModel('Device');
      this.devices = await Model.find({});
    },

    selectItem(item) {
      this.selectedDevices = item; // if (!item.isRegistered) {
      //   this.showModalRegister = true;
      // }

      this.files = [];
      this.connecting = true;
      this.error = null;
      this.$options.socket.emit('WEB_LISTENER_VIEW_DEVICE', item._id);
      this.$options.socket.emit('WEB_LISTENER_GET_LIST_FILE', item._id, (err, files) => {
        if (err) {
          this.error = err;
          cms.getModel('ConnectionHistory').findOne({
            device: this.selectedDevices._id
          }).sort('-date').then(res => {
            this.lastOnline = res;
          });
        } else {
          this.files = files;
        }

        this.connecting = false;
      });
      this.$options.socket.emit('WEB_LISTENER_GET_PLAYLIST', item._id, (err, playlist) => {
        console.log(playlist);

        if (!err) {
          this.playlist = playlist;
        }
      });

      _axios.default.post(cms.baseUrl + 'digital/p2p', {
        event: 'APP_ACTION_PUSH_SCHEDULE',
        deviceId: item._id
      }).then(res => {
        console.log(res);
        this.schedule = res.data.data;
      }).catch(err => {
        console.log(err);
      });

      _axios.default.post(cms.baseUrl + 'digital/p2p', {
        event: 'APP_ACTION_PUSH_DEVICE_STORAGE',
        deviceId: item._id
      }).then(res => {
        console.log(res);
        this.freeStorage = res.data.data;
      }).catch(err => {
        console.log(err);
      });
    },

    deleteFile(item) {
      this.$options.socket.emit('WEB_LISTENER_DELETE_FILE', this.selectedDevices._id, item, (err, files) => {
        if (err) {
          alert(err);
        } else {
          this.files = files;
          alert('delete success');
        }
      });
    },

    deletePlaylist(item) {
      this.$options.socket.emit('WEB_LISTENER_DELETE_PLAYLIST', this.selectedDevices._id, item.id, (err, playlist) => {
        if (err) {
          alert(err);
        } else {
          this.playlist = playlist;
          alert('delete success');
        }
      });
    },

    deleteSchedule(item) {
      _axios.default.post(`${cms.baseUrl}digital/p2p`, {
        event: 'APP_ACTION_DELETE_SCHEDULE',
        deviceId: this.selectedDevices._id,
        data: item._id
      }).then(res => {
        this.schedule = res.data.data;
      }).catch(err => {
        console.log(err);
      });
    },

    activePlaylist(item) {
      this.$options.socket.emit('WEB_LISTENER_SET_ACTIVE_PLAYLIST', this.selectedDevices._id, item.id, (err, playlist) => {
        if (err) {
          alert(err);
        } else {
          alert('set playlist success');
        }
      });
    }

  },

  mounted() {
    this.connectSocket();
    this.getDevices();
  },

  beforeDestroy() {
    this.$options.socket && this.$options.socket.close();
  }

};
exports.default = _default;
</script> 
<style scoped>.selected-playlist {
  background-color: #03a9f4;
  color: #fff !important; }
  .selected-playlist .v-list__tile__title {
    transition: none !important; }
  .selected-playlist .v-list__tile__sub-title {
    color: #fff !important; }

.online {
  color: #40bf5e; }

.offline {
  color: #c14444; }
</style>
