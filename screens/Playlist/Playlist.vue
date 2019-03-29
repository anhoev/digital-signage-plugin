<template>
    <v-layout row wrap style="height: 100%">
        <v-dialog v-model="dialogPushToDevice" width="500">
            <v-card>
                <v-card-title
                        class="headline grey lighten-2"
                        primary-title
                >
                    Push to device
                </v-card-title>
                <v-list subheader style="width: 100%">
                    <v-radio-group v-model="selectedDevices" style="width: 100%" class="radio-group">
                        <v-list-tile
                                v-for="(item, index) in devices"
                                :key="item.path"
                                class="pa-2"
                                fill-width
                        >

                            <v-list-tile-content>
                                <v-list-tile-title>name: {{item.name}}</v-list-tile-title>
                                <v-list-tile-sub-title>model: {{item.model}}</v-list-tile-sub-title>


                            </v-list-tile-content>

                            <v-list-tile-action>
                                <v-radio
                                        :value="item._id"
                                ></v-radio>
                            </v-list-tile-action>
                        </v-list-tile>
                    </v-radio-group>
                </v-list>
                <v-divider></v-divider>
                <v-list two-line subheader v-if="progress && progress.length>0">
                    <v-list-tile
                            v-for="item in progress"
                            :key="item.path"
                            avatar
                            class="py-2"
                            @click=""
                    >
                        <v-list-tile-avatar>
                            <i class="far fa-file grid-icon"></i>
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>name: {{item.name}}</v-list-tile-title>
                            <v-list-tile-sub-title>

                                <div style="width: 80%; height: 10px; border-radius: 5px; background: #ddd; overflow: hidden">
                                    <div style="height: 100%; background-color: #03a9f4"
                                         :style="{width: item.progress*100 + '%'}"></div>
                                </div>
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            color="primary"
                            flat
                            @click="pushNotify"
                    >
                        PUSH
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-flex md9>
            <v-container fluid>
                <v-layout row wrap v-if="selectedPlaylist">
                    <v-flex md12>
                        <v-btn @click="dialogPushToDevice=true">Push</v-btn>
                    </v-flex>
                    <v-flex shrink md6>
                        <v-card style="width: 500px">
                            <v-list style="width: 100%;"
                            >
                                <v-list-tile
                                        fill-width
                                        v-for="item in selectedPlaylist.content"
                                        :key="item.path"
                                        avatar
                                        class="py-2"
                                        @click=""
                                >
                                    <v-list-tile-avatar>
                                        <i class="far fa-folder grid-icon" v-if="item.media.type==='directory'"></i>
                                        <i class="far fa-file grid-icon" v-else></i>
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

        </v-flex>
        <v-flex md3 style="border-left: 1px solid #ddd;">
            <v-layout row wrap>
                <v-list dense style="width: 100%"
                >
                    <v-list-tile v-for="item in playlist" @click="selectItem(item)"
                                 :class="{'selected-playlist':isSelected(item)}">
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
  import io from 'socket.io-client';

  export default {
    name: 'Playlist',
    data: () => ({
      drawer: true,
      drawerRight: true,
      right: null,
      left: null,
      playlist: [],
      selectedPlaylist: null,
      devices: [],
      selectedDevices: null,
      dialogPushToDevice: false,
      progress: []
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
        console.log(this.selectedDevices);
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
        this.$options.socket.emit('WEB_LISTENER_PUSH_PLAYLIST_TO_DEVICE', this.selectedDevices, this.selectedPlaylist._id, a => {
          console.log(a);
        });
      },
      getDevices() {
        const Model = cms.getModel('Device');
        Model.find({}).then((res) => {
          console.log(res);
          this.devices = res;
        });
      },
      connectSocket() {
        this.$options.socket = io.connect(`ws://${location.hostname}:8888/file-manager-web`);
        this.$options.socket.on('WEB_EVENT_PLAYLIST_PROGRESS', res => {
          this.progress = res;
        });
      }
    },
    mounted() {
      this.getPlaylist();
      this.getDevices();
      this.connectSocket();
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

<style>
    .radio-group .v-input__control {
        width: 100%
    }
</style>
