<template>
    <v-app id="inspire">
        <v-navigation-drawer fixed="" app="" permanent="">
            <v-list dense="">
                <v-list-tile v-for="item in playlist" @click="selectItem(item)">
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
                        <v-btn @click="pushNotify">Push</v-btn>
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
                    <v-flex shrink="" md6="">
                        <v-card style="width: 500px">
                            <v-list>
                                <v-list-tile v-for="item in selectedPlaylist.device" :key="item.path" class="py-2" @click="">
                                    <v-list-tile-content>
                                        <v-list-tile-title>name: {{item['name']}}</v-list-tile-title>
                                        <v-list-tile-sub-title>os: {{item['os']}}</v-list-tile-sub-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                            </v-list>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
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
    selectedPlaylist: null
  }),
  props: {
    source: String
  },
  methods: {
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
    }

  },

  mounted() {
    this.getPlaylist();
  }

};
exports.default = _default;
</script> 
<style scoped>

</style>
