<template>
    <div style="flex-direction: row; display: flex; flex: 1; min-height: 600px; height: 100%">

        <v-content permanent>
            <v-container fluid class="pa-0">
                <v-layout row wrap>
                    <v-flex shrink md12 v-if="error">
                        <v-card-title>{{error}}</v-card-title>
                    </v-flex>
                    <v-card-title v-if="connecting && !error">Connecting to device...
                    </v-card-title>
                    <v-flex md12 v-else-if="!error && selectedDevices">
                        <v-tabs
                                v-model="active"
                                color="cyan"
                                dark
                                slider-color="yellow"
                        >
                            <v-tab
                                    ripple
                            >
                                File Manager

                            </v-tab>
                            <v-tab
                                    ripple
                            >
                                Playlist
                            </v-tab>
                        </v-tabs>
                        <v-tabs-items v-model="active">
                            <v-tab-item
                            >
                                <v-card style="width: 100%">
                                    <v-list>
                                        <v-list-tile
                                                v-for="item in files"
                                                :key="item.path"
                                                avatar
                                                class="py-2"
                                                style="width: 100%"
                                        >
                                            <v-list-tile-avatar>
                                                <i class="far fa-folder grid-icon"></i>
                                            </v-list-tile-avatar>
                                            <v-list-tile-content>
                                                <v-list-tile-title>name: {{item}}</v-list-tile-title>
                                            </v-list-tile-content>
                                            <v-list-tile-action>
                                                <v-btn icon ripple @click="deleteFile(item)">
                                                    <v-icon color="grey lighten-1">delete</v-icon>
                                                </v-btn>
                                            </v-list-tile-action>
                                        </v-list-tile>
                                    </v-list>
                                </v-card>
                            </v-tab-item>
                            <v-tab-item>
                                <v-card style="width: 100%">

                                    <v-expansion-panel>
                                        <v-expansion-panel-content v-for="item in playlist">
                                            <template v-slot:header class.native="pa-2">
                                                <v-list-tile
                                                        class="py-2"
                                                        style="width: 100%"
                                                >
                                                    <v-list-tile-content>
                                                        <v-list-tile-title>name: {{item.name}}
                                                        </v-list-tile-title>
                                                    </v-list-tile-content>
                                                    <v-list-tile-action>
                                                        <v-btn icon ripple @click.prevent.stop="deletePlaylist(item)">
                                                            <v-icon color="grey lighten-1">delete</v-icon>
                                                        </v-btn>
                                                    </v-list-tile-action>
                                                </v-list-tile>
                                            </template>
                                            <v-card>
                                                <v-list>
                                                    <v-list-tile
                                                            v-for="cItem in item.content"
                                                            avatar
                                                            class="py-2"
                                                            style="width: 100%"
                                                    >
                                                        <v-list-tile-avatar>
                                                            <i class="far fa-folder grid-icon"></i>
                                                        </v-list-tile-avatar>
                                                        <v-list-tile-content>
                                                            <v-list-tile-title>name: {{cItem.media.name}}
                                                            </v-list-tile-title>
                                                        </v-list-tile-content>
                                                    </v-list-tile>
                                                </v-list>
                                            </v-card>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                </v-card>
                            </v-tab-item>
                        </v-tabs-items>
                    </v-flex>

                </v-layout>
            </v-container>
        </v-content>
        <v-navigation-drawer permanent style="border-left: 1px solid #ddd;">
            <v-list dense>
                <v-list-tile
                        v-for="item in devices" @click="selectItem(item)"
                        :class="{'selected-playlist':isSelected(item)}"
                >
                    <v-list-tile-content>
                        <v-list-tile-title>{{item.name}}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>

<script>

  import io from 'socket.io-client';

  export default {
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
      active: null,
      playlist: []
    }),
    props: {
      source: String
    },
    methods: {
      isSelected(item) {
        if (!this.selectedDevices) {
          return false;
        }
        return this.selectedDevices === item;
      },
      connectSocket() {
        this.socket = io.connect(`ws://${location.hostname}:8888/file-manager-web`);
        this.socket.on('WEB_EVENT_LIST_FILE', files => {
          this.files = files;
        });
        this.socket.on('WEB_EVENT_LIST_PLAYLIST', playlist => {
          this.playlist = playlist;
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
        this.socket.emit('WEB_LISTENER_VIEW_DEVICE', item._id);
        this.socket.emit('WEB_LISTENER_GET_LIST_FILE', item._id, (err, files) => {
          if (err) {
            this.error = err;
          } else {
            console.log(files);
            this.files = files;
          }
          this.connecting = false;
        });
        this.socket.emit('WEB_LISTENER_GET_PLAYLIST', item._id, (err, playlist) => {
          console.log(playlist);
          this.playlist = playlist;
        });
      },
      pushNotify() {
        fetch(cms.baseUrl + 'digital/playlist/push', {
          method: 'POST',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: this.selectedPlaylist._id })
        })
          .then(res => {
            return res.json();
          })
          .then(data => {
            alert(`Push success, number of failure: ${data.failureCount}`);
          })
          .catch(err => {
            console.log(err);
          });
      },
      deleteFile(item) {
        this.socket.emit('WEB_LISTENER_DELETE_FILE', this.selectedDevices._id, item, (err, files) => {
          if (err) {
            alert(err);
          }
          this.files = files;
        });
      },
      deletePlaylist(item) {
        this.socket.emit('WEB_LISTENER_DELETE_PLAYLIST', this.selectedDevices._id, item._id, (err, playlist) => {
          if (err) {
            alert(err);
          }
          this.playlist = playlist;
        });
      }
    },
    mounted() {
      this.connectSocket();
      this.getDevices();
    }
  };
</script>

<style scoped lang="scss">
    .selected-playlist {
        background-color: #03a9f4;
        color: #fff;

        .v-list__tile__title {
            transition: none !important;

        }
    }
</style>
