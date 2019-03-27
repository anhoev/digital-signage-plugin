<template>
    <div style="flex-direction: row; display: flex; flex: 1; min-height: 600px; height: 100%">

        <v-content permanent="">
            <v-container fluid="" class="pa-0">
                <v-layout row="" wrap="">
                    <v-flex shrink="" md12="" v-if="error">
                        <v-card-title>{{error}}</v-card-title>
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
                        </v-tabs>
                        <v-tabs-items v-model="active">
                            <v-tab-item>
                                <v-card style="width: 100%">
                                    <v-list>
                                        <v-list-tile v-for="item in files" :key="item.path" avatar="" class="py-2" style="width: 100%">
                                            <v-list-tile-avatar>
                                                <i class="far fa-folder grid-icon"></i>
                                            </v-list-tile-avatar>
                                            <v-list-tile-content>
                                                <v-list-tile-title>name: {{item}}</v-list-tile-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-btn icon="" ripple="" @click="deleteFile(item)">
                                                    <v-icon color="grey lighten-1">delete</v-icon>
                                                </v-btn>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                    </v-list>
                                </v-card>
                            </v-tab-item>
                            <v-tab-item>
                                2
                            </v-tab-item>
                        </v-tabs-items>
                    </v-flex>

                </v-layout>
            </v-container>
        </v-content>
        <v-navigation-drawer permanent="" style="border-left: 1px solid #ddd;">
            <v-list dense="">
                <v-list-tile v-for="item in devices" @click="selectItem(item)">
                    <v-list-tile-content>
                        <v-list-tile-title>{{item.name}}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
    </div>
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
  name: 'DeviceManager',
  data: () => ({
    drawer: true,
    drawerRight: true,
    right: null,
    left: null,
    files: [],
    selectedDevices: null,
    devices: [],
    socket: null,
    error: '',
    connecting: false,
    active: null
  }),
  props: {
    source: String
  },
  methods: {
    connectSocket() {
      this.socket = _socket.default.connect(`ws://${location.hostname}:8888/file-manager-web`);
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
      this.socket.emit('WEB_LISTENER_GET_LIST_FILE', item._id, (err, files) => {
        if (err) {
          this.error = err;
        } else {
          console.log(files);
          this.files = files;
        }

        this.connecting = false;
      });
    },

    pushNotify() {
      fetch(cms.baseUrl + 'digital/playlist/push', {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: this.selectedPlaylist._id
        })
      }).then(res => {
        return res.json();
      }).then(data => {
        alert(`Push success, number of failure: ${data.failureCount}`);
      }).catch(err => {
        console.log(err);
      });
    },

    deleteFile(item) {
      this.socket.emit('WEB_LISTENER_DELETE_FILE', this.selectedDevices._id, item, err => {
        if (err) {
          alert(err);
        }

        this.selectItem(this.selectedDevices);
      });
    }

  },

  mounted() {
    this.connectSocket();
    this.getDevices();
  }

};
exports.default = _default;
</script> 
<style scoped>

</style>
