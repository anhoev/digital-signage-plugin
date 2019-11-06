<template>
  <v-layout row style="height: calc(100vh - 48px);">
    <v-flex shrink
            style="border-right: 1px solid #ddd; max-width: 300px; max-height: calc(100vh - 50px); overflow: auto; background: #fff">
      <v-list dense two-line avatar>
        <template v-for="(item, index) in sortedDevices"
        >
          <v-list-tile
              :key="item._id"
              :class="{'selected-playlist':isSelected(item)}"
              @click="selectItem(item)"
          >
            <v-list-tile-avatar>
              <i class="fas fa-mobile-alt" style="font-size: 1.5em; position: relative"
                 :style="{opacity: item.isRegistered ? 1 : 0.5}">
                <i class="fas fa-question" v-if="!item.isRegistered"
                   style="position: absolute; top: 50%; left: 50%; font-size: 10px; margin-top: -6.5px; margin-left: -4px"></i>
              </i>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title v-if="item.isRegistered">{{item.name}}</v-list-tile-title>
              <v-list-tile-title v-else>Unregistered Device</v-list-tile-title>
              <v-list-tile-sub-title>{{item.resolution}} <span
                  v-if="!item.isRegistered">(Code: {{item.deviceCode}})</span>
                <span v-else>(ver. {{item.appVersionCode}})</span>
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
    <v-flex v-if="selectedDevices"
            style="border-left: 1px solid #ddd; flex: 1; min-width: 0; max-height: calc(100vh - 50px); overflow: auto"
            :key="selectedDevices._id">
      <v-layout row wrap>
        <v-flex shrink md12 v-if="error">
          <v-card-title>{{error}}</v-card-title>
          <v-card-title v-if="lastOnline">last online: {{lastOnline.date}}</v-card-title>
        </v-flex>
        <v-card-title v-if="connecting && !error">Connecting to device...
        </v-card-title>
        <v-flex md12 v-else-if="selectedDevices && selectedDevices.isRegistered">
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
            <v-tab
                ripple
            >
              Schedule
            </v-tab>
            <v-tab
                ripple
            >
              Device Control
            </v-tab>
            <v-tab
                ripple
            >
              Device Logs
            </v-tab>
            <v-layout justify-end align-center style="color: #fff">
              <div class="mx-2 pa-2">
                <v-btn flat @click="showModalRegister=true">Edit device info</v-btn>
              </div>
              <div class="pa-2">
                Free storage: {{toMegabytes(freeStorage.free)}} / {{toMegabytes(freeStorage.total)}}
                (MB)
              </div>
            </v-layout>
          </v-tabs>
          <v-tabs-items v-model="active" style="width: 100%; max-height: calc(100vh - 100px); overflow: auto">
            <v-tab-item
            >
              <v-card>
                <v-list>
                  <template v-for="(item, index) in files">
                    <v-list-tile
                        :key="item"
                        avatar
                        class="py-2"
                        style="width: 100%"
                    >
                      <v-list-tile-avatar>
                        <i class="far fa-folder grid-icon"></i>
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>name: {{item}}</v-list-tile-title>
                        <v-list-tile-sub-title class="red--text"
                                               v-if="isFileNotInAnyPlaylist(item)">
                          This media is not in any playlist
                        </v-list-tile-sub-title>
                      </v-list-tile-content>
                      <v-list-tile-action>
                        <v-btn icon ripple @click="deleteFile(item)">
                          <v-icon color="grey lighten-1">delete</v-icon>
                        </v-btn>
                      </v-list-tile-action>
                    </v-list-tile>
                    <v-divider v-if="index!==files.length-1"/>
                  </template>
                </v-list>
              </v-card>
            </v-tab-item>
            <v-tab-item>
              <v-card style="width: 100%">
                <v-expansion-panel v-if="Array.isArray(playlist)">
                  <v-expansion-panel-content v-for="item in playlist" :key="item.name">
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
                          <v-layout row>
                            <v-btn icon ripple
                                   @click.prevent.stop="deletePlaylist(item)">
                              <v-icon color="grey lighten-1">delete</v-icon>
                            </v-btn>
                          </v-layout>
                        </v-list-tile-action>
                      </v-list-tile>
                      <v-divider></v-divider>
                    </template>
                    <v-card>
                      <v-list>
                        <template v-for="(cItem, index) in item.content"
                        >
                          <v-list-tile
                              v-if="cItem.media"
                              avatar
                              :key="cItem.media.path"
                              class="py-2"
                              style="width: 100%"
                          >
                            <v-list-tile-avatar size="100">
                              <thumbnail :item="cItem.media"></thumbnail>
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                              <v-list-tile-title>name: {{cItem.media.name}}
                              </v-list-tile-title>
                              <v-list-tile-sub-title class="red--text"
                                                     v-if="isFileNotExists(cItem.media.name + cItem.media.ext)">
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
                    <template v-slot:header class.native="pa-2">
                      <v-list-tile
                          class="py-2"
                          style="width: 100%"
                      >
                        <v-list-tile-content>
                          <v-list-tile-title>Schedule Name: {{model.name}}</v-list-tile-title>
                          <v-list-tile-sub-title>
                            Time: from {{model.activeFrom}} to {{model.activeTo}}
                          </v-list-tile-sub-title>
                        </v-list-tile-content>
                        <v-list-tile-action>
                          <v-layout row>
                            <v-btn icon ripple
                                   @click.prevent.stop="deleteSchedule(model)">
                              <v-icon color="grey lighten-1">delete</v-icon>
                            </v-btn>
                          </v-layout>
                        </v-list-tile-action>
                      </v-list-tile>
                      <v-divider></v-divider>
                    </template>
                    <v-card>
                      <v-list>
                        <template v-for="(cItem, index) in model.weekdaySchedule"
                        >
                          <v-list-tile
                              :key="index"
                              class="py-2"
                              style="width: 100%"
                          >
                            <v-list-tile-content>
                              <v-list-tile-title> {{cItem.playlist.name}}

                              </v-list-tile-title>
                              <v-list-tile-sub-title>
                                {{cItem.weekdays.join(', ')}}, {{cItem.from}} -
                                {{cItem.to}}{{cItem.in==='next day'? '(Next Day)':''}} :
                              </v-list-tile-sub-title>
                            </v-list-tile-content>
                          </v-list-tile>
                          <v-divider
                              v-if="index!==model.weekdaySchedule.length-1"></v-divider>
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
                    <div style="height: 20px; background: #03a9f4"
                         :style="{width: ((freeStorage.total-freeStorage.free)/freeStorage.total*100) + '%'}"></div>
                  </div>
                </div>
                <v-btn @click="deleteDeviceData" color="red" class="white--text">
                  Delete all device data
                </v-btn>
                <div class="pa-2"
                     :class="needUpdate?'orange--text':'green--text'">
                  App version on device: {{selectedDevices.appVersionCode}}
                  <v-btn v-if="needUpdate" @click="updateApp" flat>
                    Update
                  </v-btn>
                </div>
                <div class="pa-2" v-if="currentVersion">
                  Current version: {{currentVersion}}
                </div>
                <v-layout row wrap>
                  <div class="pa-2" style="margin: auto 0; flex-basis: 300px">
                    Date: {{selectedDevices.currentDate || 'not fetched'}}
                  </div>
                  <v-layout>
                    <v-btn @click="getDeviceDate" flat color="primary">
                      Get current date
                    </v-btn>
                    <v-btn @click="setDeviceTimeZone" flat color="primary" :disabled="disabledSetTimezoneBtn">
                      Set time zone
                    </v-btn>
                  </v-layout>
                </v-layout>
                <v-layout row wrap>
                  <div class="pa-2" style="margin: auto 0; flex-basis: 300px">
                    Location Services: {{selectedDevices.locationServicesProviders || 'not fetched'}}
                  </div>
                  <v-layout>
                    <v-btn @click="getLocationServicesStatus" flat color="primary">
                      Get status
                    </v-btn>
                    <v-btn @click="setLocationService" flat color="primary" :disabled="disabledSetLocationSvcBtn">
                      Enable location services
                    </v-btn>
                  </v-layout>
                </v-layout>
                <map-maker v-if="selectedDevices.coordinates"
                           :lat="selectedDevices.coordinates.latitude"
                           :lng="selectedDevices.coordinates.longitude"></map-maker>
              </v-card>
            </v-tab-item>
            <v-tab-item>
              <v-expansion-panel expand v-model="panel">
                <v-expansion-panel-content :value="true">
                  <template v-slot:header>
                    <div class="headline">App Logs</div>
                  </template>
                  <v-card>
                    <v-card-title>
                      <v-btn @click="getLogList" color="primary">list logs</v-btn>
                      <v-btn @click="clearLog">Clear Logs</v-btn>
                      <v-select v-model="selectedLog" :items="logs" label="Select log" class="pa-2"
                                hide-details></v-select>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-textarea v-model="selectedLogContent" ref="log" :loading="loadingLog" label="Log"
                                box hide-details clearable
                    >
                      <template v-slot:append>
                        <v-icon style="cursor: pointer;" @click="showLogAsDialog(selectedLogContent)">launch</v-icon>
                      </template>
                    </v-textarea>
                    <v-card-actions>
                      <v-btn @click="sendGetLogEvent" v-if="selectedLog" color="primary" flat>Get Log</v-btn>
                      <v-spacer></v-spacer>
                      <v-btn @click="copyLog" flat>Copy</v-btn>
                      <v-btn flat color="primary" v-if="downloadLink" :href="downloadLink" download="log.txt">Download
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-expansion-panel-content>
                <v-expansion-panel-content>
                  <template v-slot:header>
                    <div class="headline">Start Logs</div>
                  </template>
                  <v-card>
                    <v-textarea v-model="startLog" box hide-details label="Log">
                      <template v-slot:append>
                        <v-icon style="cursor: pointer;" @click="showLogAsDialog(startLog)">launch</v-icon>
                      </template>
                    </v-textarea>
                    <v-card-actions>
                      <v-btn @click="getStartLog" color="primary" flat>get start logs</v-btn>
                      <v-btn @click="clearStartLog" flat>clear start logs</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-expansion-panel-content>
                <v-expansion-panel-content>
                  <template v-slot:header>
                    <div class="headline">Memory Logs</div>
                  </template>
                  <v-card>
                    <v-textarea v-model="memoryLog" box hide-details label="Log">
                      <template v-slot:append>
                        <v-icon style="cursor: pointer;" @click="showLogAsDialog(memoryLog)">launch</v-icon>
                      </template>
                    </v-textarea>
                    <v-card-actions>
                      <v-btn @click="getMemoryLog" color="primary" flat>get memory logs</v-btn>
                      <v-btn @click="clearMemoryLog" flat>clear memory logs</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-tab-item>
          </v-tabs-items>
        </v-flex>
        <v-flex v-else-if="selectedDevices && !selectedDevices.isRegistered">
          <div class="pa-5">
            Device is not registered
            <v-btn @click="showModalRegister = true" depressed>Register</v-btn>
            <div class="ma-5"></div>
            <div style="max-width: 700px" v-if="selectedDevices.coordinates">
              <map-maker :lat="selectedDevices.coordinates.latitude"
                         :lng="selectedDevices.coordinates.longitude"></map-maker>
            </div>
          </div>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-dialog v-model="showLogDialog" width="1000">
      <v-card>
        <v-card-text>
          <v-textarea box hide-details label="Log" v-model="logDialogText" class="logDialog" ref="logDialog"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn flat color="primary" @click="copyDialogLog">copy</v-btn>
          <v-btn flat color="primary" @click="downloadDialogLog">download</v-btn>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="showLogDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showModalRegister" width="700" v-if="selectedDevices">
      <v-card pa-3>
        <v-card-title>Device is not registered, please register</v-card-title>
        <v-card-text>
          <g-field :fields="gfield" :model="selectedDevices"></g-field>
        </v-card-text>
        <v-card-actions>
          <v-btn flat @click="onSaveDevice">Save</v-btn>
          <v-btn flat @click="showModalRegister=false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>


<script>
  import io from 'socket.io-client';
  import axios from 'axios';

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
      error: '',
      connecting: false,
      active: null,
      playlist: [],
      onlineDevices: [],
      lastOnline: null,
      schedule: [],
      freeStorage: {},
      showModalRegister: false,
      currentVersion: '',
      logs: [],
      startLog: '',
      memoryLog: '',
      selectedLog: '',
      selectedLogContent: '',
      loadingLog: false,
      downloadLink: '',
      panel: [true, false, false],
      dateHint: '',
      showLogDialog: false,
      logDialogText: ''
    }),
    props: {
      source: String
    },
    watch: {
      onlineDevices(newValue, oldValue) {
        newValue.forEach((item) => {
          if (this.selectedDevices && oldValue.indexOf(item) === -1 && item === this.selectedDevices._id) {
            this.selectItem(this.selectedDevices);
          }
        });
      }
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
      },
      needUpdate() {
        return Number(this.selectedDevices.appVersionCode) < Number(this.currentVersion);
      },
      disabledSetTimezoneBtn() {
        return !this.selectedDevices.currentDate || this.selectedDevices.currentDate.includes('CEST')
      },
      disabledSetLocationSvcBtn() {
        return !this.selectedDevices.locationServicesProviders || this.selectedDevices.locationServicesProviders === 'High accuracy'
      }
    },
    methods: {
      showLogAsDialog(text) {
        this.logDialogText = text;
        this.showLogDialog = true;
      },
      copyDialogLog() {
        console.log(this.$refs.logDialog);
        this.$refs.logDialog.$refs.input.select();
        document.execCommand('copy');
      },
      downloadDialogLog() {
        const blob = new Blob([this.logDialogText], {type: 'text/plain'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'log.txt';
        a.click();
      },
      copyLog() {
        console.log(this.$refs.log);
        this.$refs.log.$refs.input.select();
        document.execCommand('copy');
      },
      async clearLog() {
        try {
          await axios.post(cms.baseUrl + 'digital/p2p', {
            event: 'APP_LISTENER_CLEAR_LOG',
            deviceId: this.selectedDevices._id
          });
          this.selectedLogContent = '';
          this.downloadLink = '';
        } catch (e) {
          console.error(e);
        }
      },
      async updateApp() {
        try {
          const {data} = await axios.post(cms.baseUrl + 'digital/p2p', {
            event: 'APP_LISTENER_UPDATE',
            deviceId: this.selectedDevices._id
          });
          if (data && data.data) {
            alert(data.data);
          } else {
            alert('check for update success, device is downloading new version');
          }
        } catch (e) {
          console.error(e);
        }
      },
      async getLogList() {
        const {data: {data: logList}} = await axios.post(cms.baseUrl + 'digital/p2p', {
          event: 'APP_LISTENER_GET_LOG_LIST',
          deviceId: this.selectedDevices._id
        });
        this.logs = logList;
      },
      async sendGetLogEvent() {
        try {
          this.selectedLogContent = '';
          this.downloadLink = '';
          await axios.post(cms.baseUrl + 'digital/p2p', {
            event: 'APP_LISTENER_GET_LOG',
            deviceId: this.selectedDevices._id,
            data: this.selectedLog
          });
        } catch (e) {
          this.loadingLog = false;
          console.error(e)
        }
      },
      async getStartLog() {
        this.startLog = '';
        await axios.post(cms.baseUrl + 'digital/p2p', {
          event: 'APP_LISTENER_PUSH_START_LOG',
          deviceId: this.selectedDevices._id,
        })
      },
      async clearStartLog() {
        try {
          await axios.post(cms.baseUrl + 'digital/p2p', {
            event: 'APP_LISTENER_CLEAR_START_LOG',
            deviceId: this.selectedDevices._id
          });
          this.startLog = '';
        } catch (e) {
          console.error(e);
        }
      },
      async getMemoryLog() {
        this.memoryLog = '';
        await axios.post(cms.baseUrl + 'digital/p2p', {
          event: 'APP_LISTENER_PUSH_MEMORY_LOG',
          deviceId: this.selectedDevices._id,
        })
      },
      async clearMemoryLog() {
        try {
          await axios.post(cms.baseUrl + 'digital/p2p', {
            event: 'APP_LISTENER_CLEAR_MEMORY_LOG',
            deviceId: this.selectedDevices._id
          });
          this.memoryLog = '';
        } catch (e) {
          console.error(e);
        }
      },
      async deleteDeviceData() {
        try {
          await axios.post(cms.baseUrl + 'digital/p2p', {
            event: 'APP_ACTION_DELETE_DEVICE_DATA',
            deviceId: this.selectedDevices._id
          });
          this.selectItem(this.devices.find(i => i._id === this.selectedDevices._id));
        } catch (e) {
          console.error(e);
        }
      },
      toMegabytes(n) {
        return Math.floor(n / 1048576);
      },
      async onSaveDevice() {
        const data = {
          name: this.selectedDevices.name,
          os: this.selectedDevices.os,
          'os-version': this.selectedDevices['os-version'],
          model: this.selectedDevices.model,
          location: this.selectedDevices.location,
          isRegistered: true
        };
        try {
          await cms.getModel('Device').findByIdAndUpdate(this.selectedDevices._id, data);
          this.getDevices();
          this.showModalRegister = false;
          await axios.post(cms.baseUrl + 'digital/p2p', {
            event: 'APP_ACTION_CHANGE_DEVICE_REGISTERED',
            deviceId: this.selectedDevices._id
          });
        } catch (e) {
          console.error(e)
        }
      },
      isOnline(device) {
        return this.onlineDevices.indexOf(device._id) > -1;
      },
      isSelected(item) {
        if (!this.selectedDevices) {
          return false;
        }
        return this.selectedDevices._id === item._id;
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
        this.$options.socket = io.connect(cms.baseUrl + 'file-manager-web', {
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
        this.$options.socket.on('WEB_EVENT_LOG_SEND', ({status, data}) => {
          if (status === 'finished') {
            this.loadingLog = false;
            const blob = new Blob([this.selectedLogContent], {type: 'text/plain'});
            this.downloadLink = window.URL.createObjectURL(blob);
          } else if (status === 'sending') {
            this.loadingLog = true;
            this.selectedLogContent += data;
          } else {
            this.loadingLog = false;
          }
        });
        this.$options.socket.on('WEB_EVENT_PUSH_START_LOG', ({status, data}) => {
          if (status !== 'finished') {
            this.startLog += data;
          }
        });
        this.$options.socket.on('WEB_EVENT_PUSH_MEMORY_LOG', ({status, data}) => {
          if (status !== 'finished') {
            this.memoryLog += data;
          }
        });
      },
      async getDevices() {
        const Model = cms.getModel('Device');
        this.devices = await Model.find({});
        if (this.selectedDevices) {
          this.selectItem(this.devices.find(i => i._id === this.selectedDevices._id));
        }
      },
      async selectItem(item) {
        this.files = [];
        this.connecting = true;
        this.error = null;
        this.logs = [];
        this.startLog = '';
        this.selectedLog = '';
        this.selectedLogContent = '';
        this.downloadLink = '';
        const Model = cms.getModel('Device');
        const res = await Model.findById(item._id);
        this.selectedDevices = res;

        // if (!item.isRegistered) {
        //   this.showModalRegister = true;
        // }
        this.$options.socket.emit('WEB_LISTENER_VIEW_DEVICE', res._id);
        this.$options.socket.emit('WEB_LISTENER_GET_LIST_FILE', res._id, async (err, files) => {
          if (err) {
            this.error = err;
            this.lastOnline = await cms.getModel('ConnectionHistory').findOne({device: this.selectedDevices._id}).sort('-date')
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
        try {
          const {data: {data: schedule}} = await axios.post(cms.baseUrl + 'digital/p2p', {
            event: 'APP_ACTION_PUSH_SCHEDULE',
            deviceId: item._id
          });
          this.schedule = schedule;
          const {data: {data: freeStorage}} = await axios.post(cms.baseUrl + 'digital/p2p', {
            event: 'APP_ACTION_PUSH_DEVICE_STORAGE',
            deviceId: item._id
          });
          this.freeStorage = freeStorage;
        } catch (e) {
          console.error(e);
        }
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
      async deleteSchedule(item) {
        try {
          const {data: {data: schedule}} = await axios.post(`${cms.baseUrl}digital/p2p`, {
            event: 'APP_ACTION_DELETE_SCHEDULE',
            deviceId: this.selectedDevices._id,
            data: item._id
          });
          this.schedule = this.schedule.filter(i => i._id !== item._id);
        } catch (e) {
          console.error(e);
        }
      },
      activePlaylist(item) {
        this.$options.socket.emit('WEB_LISTENER_SET_ACTIVE_PLAYLIST', this.selectedDevices._id, item.id, (err, playlist) => {
          if (err) {
            alert(err);
          } else {
            alert('set playlist success');
          }
        });
      },
      async getCurrentVersion() {
        const SystemConfig = cms.getModel('SystemConfig');
        const res = await SystemConfig.findOne();
        const MY_APP_DISTRIBUTION_GROUP = res.DistributionGroup;
        const MY_APP_SECRET_KEY = res.SecretKey;
        const MY_API_TOKEN = res.ApiToken;
        if (MY_APP_DISTRIBUTION_GROUP && MY_APP_SECRET_KEY && MY_API_TOKEN) {
          try {
            const app = await axios.get(`https://api.appcenter.ms/v0.1/public/sdk/apps/${MY_APP_SECRET_KEY}/distribution_groups/${MY_APP_DISTRIBUTION_GROUP}/releases/latest`,
                {
                  headers: {
                    'X-API-Token': MY_API_TOKEN
                  }
                });
            this.currentVersion = app.data.version;
          } catch (e) {
            console.log(e);
          }
        }
      },
      async getDeviceDate() {
        try {
          const {data: {data: deviceDate}} = await axios.post(cms.baseUrl + 'digital/p2p', {
            event: 'APP_LISTENER_GET_DEVICE_DATE',
            deviceId: this.selectedDevices._id
          });
          this.$set(this.selectedDevices, 'currentDate', deviceDate);
        } catch (e) {
          console.error(e)
        }
      },
      async setDeviceTimeZone() {
        try {
          await axios.post(cms.baseUrl + 'digital/p2p', {
            event: 'APP_ACTION_SET_TIME_ZONE',
            deviceId: this.selectedDevices._id
          })
        } catch (e) {
          console.error(e);
        }
      },
      async setLocationService() {
        try {
          await axios.post(cms.baseUrl + 'digital/p2p', {
            event: 'APP_ACTION_SET_LOCATION_SERVICES',
            deviceId: this.selectedDevices._id
          })
        } catch (e) {
          console.error(e);
        }
      },
      async getLocationServicesStatus() {
        const {data: {data: locationServiceProviders}} = await axios.post(cms.baseUrl + 'digital/p2p', {
          event: 'APP_ACTION_GET_LOCATION_SERVICES_STATUS',
          deviceId: this.selectedDevices._id
        });
        this.$set(this.selectedDevices, 'locationServicesProviders', locationServiceProviders);
      }
    },
    mounted() {
      this.connectSocket();
      this.getDevices();
      this.getCurrentVersion();
    },
    beforeDestroy() {
      this.$options.socket && this.$options.socket.close();
    }
  };
</script>

<style lang="scss">
  .selected-playlist {
    background-color: #03a9f4;
    color: #fff !important;

    .v-list__tile__title {
      transition: none !important;
    }

    .v-list__tile__sub-title {
      color: #fff !important;
    }
  }

  .online {
    color: #40bf5e
  }

  .offline {
    color: #c14444
  }

  .v-textarea textarea {
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 12px;
  }

  .logDialog textarea {
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 12px;
    height: 70vh;
  }
</style>

