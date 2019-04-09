<template>
    <v-layout row="" style="height: 100%">
        <v-flex shrink="" style="border-right: 1px solid #ddd; width: 300px">
            <v-list dense="">
                <v-list-tile v-for="item in devices" @click="selectItem(item)" :key="item._id" :class="{'selected-playlist':isSelected(item)}">
                    <v-list-tile-content>
                        <v-list-tile-title>{{item.name}}</v-list-tile-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <i class="fas fa-circle" :class="isOnline(item)?'online':'offline'"></i>
                    </v-list-tile-action>
                </v-list-tile>
            </v-list>
        </v-flex>
        <v-flex grow="" style="border-left: 1px solid #ddd;">
            <v-layout row="" wrap="">
                <v-flex shrink="" md12="" v-if="error">
                    <v-card-title>{{error}}</v-card-title>
                    <v-card-title v-if="lastOnline">last online: {{ lastOnline.date}}</v-card-title>
                </v-flex>
                <v-card-title v-if="connecting &amp;&amp; !error">Connecting to device...
                </v-card-title>
                <v-flex md12="" v-else-if="!error &amp;&amp; selectedDevices">
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
                                                        <v-btn ripple="" @click.prevent.stop="activePlaylist(item)">
                                                            Active
                                                        </v-btn>
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
                                                    <v-list-tile avatar="" :key="cItem.media.path" class="py-2" style="width: 100%">
                                                        <v-list-tile-avatar>
                                                            <i class="far fa-folder grid-icon"></i>
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

                            <!--                            <v-list>-->
                            <!--                                <template v-for="(model, index) in schedule">-->
                            <!--                                    <v-list-tile-->
                            <!--                                            :key="model._id"-->
                            <!--                                            avatar-->
                            <!--                                            class="py-2"-->
                            <!--                                            style="width: 100%"-->
                            <!--                                    >-->
                            <!--                                        <v-list-tile-content>-->
                            <!--                                            <v-list-tile-title>Schedule Name: {{model.name}}</v-list-tile-title>-->
                            <!--                                            <v-list-tile-sub-title>-->
                            <!--                                                Time: from {{model.activeFrom}} to {{model.activeTo}}-->
                            <!--                                            </v-list-tile-sub-title>-->
                            <!--                                            <v-list-tile-sub-title>-->
                            <!--                                                Weekday schedule:-->
                            <!--                                            </v-list-tile-sub-title>-->
                            <!--                                        </v-list-tile-content>-->
                            <!--                                    </v-list-tile>-->
                            <!--                                    <v-divider v-if="index!==files.length-1" />-->
                            <!--                                </template>-->
                            <!--                            </v-list>-->


                        </v-tab-item>
                    </v-tabs-items>
                </v-flex>
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
    schedule: []
  }),
  props: {
    source: String
  },
  methods: {
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
        return playlist.content.some(item => item.media.name + item.media.ext === name);
      });
    },

    isFileNotExists(name) {
      return !this.files.includes(name);
    },

    connectSocket() {
      this.$options.socket = _socket.default.connect(cms.baseUrl + 'file-manager-web');
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

    getDevices() {
      const Model = cms.getModel('Device');
      Model.find({}).then(res => {
        console.log(res);
        this.devices = res;
      });
    },

    selectItem(item) {
      this.selectedDevices = item;
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
  color: #fff; }
  .selected-playlist .v-list__tile__title {
    transition: none !important; }

.online {
  color: #40bf5e; }

.offline {
  color: #c14444; }
</style>
