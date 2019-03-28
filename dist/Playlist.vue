<template>
    <v-app id="inspire">
        <v-navigation-drawer fixed="" app="" permanent="">
            <v-list dense="">
                <v-list-tile v-for="item in playlist" @click="selectItem(item)" :class="{'selected-playlist':isSelected(item)}">
                    <v-list-tile-content>
                        <v-list-tile-title>{{item.name}}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-toolbar color="blue-grey" dark="" fixed="" app="">
            <v-toolbar-title>Playlist</v-toolbar-title>
            <v-spacer></v-spacer>
            <!--<v-toolbar-side-icon @click.stop="drawerRight = !drawerRight"></v-toolbar-side-icon>-->
        </v-toolbar>
        <v-content>
            <v-container fluid="">
                <v-layout row="" wrap="" v-if="selectedPlaylist">

                    <v-flex md12="">
                        <v-btn @click="dialogPushToDevice=true">Push</v-btn>
                    </v-flex>
                    <v-flex shrink="" md6="">
                        <v-card style="width: 500px">
                            <v-list>
                                <v-list-tile v-for="item in selectedPlaylist.content" :key="item.path" avatar="" class="py-2" @click="">
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
                    <!--<v-flex shrink md6>-->
                    <!--<v-card style="width: 500px">-->
                    <!--<v-list>-->
                    <!--<v-list-tile-->
                    <!--v-for="item in selectedPlaylist.device"-->
                    <!--:key="item.path"-->
                    <!--class="py-2"-->
                    <!--@click=""-->
                    <!--&gt;-->
                    <!--<v-list-tile-content>-->
                    <!--<v-list-tile-title>name: {{item['name']}}</v-list-tile-title>-->
                    <!--<v-list-tile-sub-title>os: {{item['os']}}</v-list-tile-sub-title>-->
                    <!--</v-list-tile-content>-->
                    <!--</v-list-tile>-->
                    <!--</v-list>-->
                    <!--</v-card>-->
                    <!--</v-flex>-->
                </v-layout>
            </v-container>
        </v-content>
        <v-dialog v-model="dialogPushToDevice" width="500">
            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title="">
                    Push to device
                </v-card-title>
                <v-list subheader="">

                    <v-list-tile v-for="(item, index) in devices" :key="item.path" class="pa-2">

                        <v-list-tile-content>
                            <v-list-tile-title>name: {{item['name']}}</v-list-tile-title>
                            <v-list-tile-sub-title>model: {{item.model}}</v-list-tile-sub-title>


                        </v-list-tile-content>

                        <v-list-tile-action>
                            <v-checkbox @change="changeDevice($event, item.token)"></v-checkbox>
                        </v-list-tile-action>
                    </v-list-tile>
                </v-list>
                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat="" @click="pushNotify">
                        PUSH
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>
<script>
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
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
    dialogPushToDevice: false
  }),
  props: {
    source: String
  },
  methods: {
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

    pushNotify() {
      console.log(JSON.stringify({
        id: this.selectedPlaylist._id,
        devices: this.devices
      }));
      fetch(cms.baseUrl + 'digital/playlist/push', {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: this.selectedPlaylist._id,
          devices: this.devices
        })
      }).then(res => {
        return res.json();
      }).then(data => {
        alert(`Push success, number of failure: ${data.failureCount}`);
      }).catch(err => {
        console.log(err);
      });
    },

    getDevices() {
      const Model = cms.getModel('Device');
      Model.find({}).then(res => {
        console.log(res);
        this.devices = res;
      });
    }

  },

  mounted() {
    this.getPlaylist();
    this.getDevices();
  }

};
exports.default = _default;
</script> 
<style scoped>.selected-playlist {
  background-color: #03a9f4;
  color: #fff; }
  .selected-playlist .v-list__tile__title {
    transition: none !important; }
</style>
