<template>
    <div>
        <v-layout style="background-color: #3f51b5!important; color: #fff" row="" center="">
            <v-btn icon="" v-show="stack.length>=1" @click.prevent="goBack" style="color: #fff">
                <v-icon>arrow_back</v-icon>
            </v-btn>
            <v-btn icon="" @click="getDirectory" style="color: #fff">
                <v-icon>cached</v-icon>
            </v-btn>
            <v-toolbar-title>Digital Sinage</v-toolbar-title>

            <v-spacer></v-spacer>
            <v-btn @click="dialogCreateFolder=true">
                New folder
            </v-btn>
            <v-btn @click="dialogUploadFile=true">
                Upload file
            </v-btn>
        </v-layout>
        <v-container fluid="" fill-height="">
            <v-layout>
                <v-flex md8="">
                    <v-breadcrumbs :items="breadCrumbs" divider="-">
                        <template v-slot:item="{item}">
                            <div>{{ item }}</div>
                        </template>
                        <template v-slot:divider="">
                            <v-icon>chevron_right</v-icon>
                        </template>
                    </v-breadcrumbs>
                    <folder-renderer v-if="current" :items="current.children" @select="select" @remove-file="removeFile" @remove-folder="removeFolder" @select-file="selectFile"></folder-renderer>
                </v-flex>
                <v-flex md4="">
                    <device-list @open-dialog="dialogPushToDevice=true" :selected="selected" @remove-item="removeSelected">
                    </device-list>
                </v-flex>
            </v-layout>
        </v-container>
        <v-dialog v-model="dialogPushToDevice" width="500">
            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title="">
                    Push to device
                </v-card-title>
                <v-list subheader="">

                    <v-radio-group v-model="selectedDevices" style="width: 100%" class="radio-group">
                        <v-list-tile v-for="(item, index) in devices" :key="item.path" class="pa-2">

                            <v-list-tile-content>
                                <v-list-tile-title>name: {{item.name}}</v-list-tile-title>
                                <v-list-tile-sub-title>model: {{item.model}}</v-list-tile-sub-title>


                            </v-list-tile-content>

                            <v-list-tile-action>
                                <v-radio :value="item._id"></v-radio>
                            </v-list-tile-action>
                        </v-list-tile>

                    </v-radio-group>
                </v-list>
                <v-divider></v-divider>
                <v-list two-line="" subheader="" v-if="progress &amp;&amp; progress.length>0">
                    <v-list-tile v-for="item in progress" :key="item.path" avatar="" class="py-2" @click="">
                        <v-list-tile-avatar>
                            <i class="far fa-file grid-icon"></i>
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>name: {{item.name}}</v-list-tile-title>
                            <v-list-tile-sub-title>

                                <div style="width: 80%; height: 10px; border-radius: 5px; background: #ddd; overflow: hidden">
                                    <div style="height: 100%; background-color: #03a9f4" :style="{width: item.progress*100 + '%'}"></div>
                                </div>
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat="" @click="pushNotify">
                        PUSH
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogUploadFile" width="300">
            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title="">
                    UploadFile
                </v-card-title>

                <v-card-text>
                    <input type="file" ref="file">
                </v-card-text>
                <v-divider></v-divider>
                <v-card-text>
                    <div style="width: 100%; height: 10px; border-radius: 5px; background: #ddd; overflow: hidden">
                        <div style="height: 100%; background-color: #03a9f4" :style="{width: uploadProgress*100 + '%'}"></div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat="" @click="uploadFile();">
                        Upload
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="dialogCreateFolder" width="300">
            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title="">
                    CreateFolder
                </v-card-title>

                <v-card-text>
                    <v-text-field label="Folder Name" v-model="folderName"></v-text-field>
                </v-card-text>
                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat="" @click="newFolder(); dialogCreateFolder=false">
                        Create
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
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
  name: 'App',

  data() {
    return {
      items: [],
      current: null,
      selected: [],
      stack: [],
      folderName: '',
      dialogPushToDevice: false,
      token: '',
      dialogCreateFolder: false,
      dialogUploadFile: false,
      devices: [],
      selectedDevices: null,
      progress: [],
      uploadProgress: 0
    };
  },

  computed: {
    breadCrumbs() {
      console.log(this.current);

      if (!this.current || !this.current.path) {
        // console.log('hello');
        return ['root'];
      } else {
        return ['root', ...this.current.path.split('/')];
      }
    }

  },
  watch: {
    dialogPushToDevice(value) {
      if (!value) {
        this.progress = [];
        this.$options.socket.emit('WEB_LISTENER_LEAVE_PROGRESS');
      }
    }

  },
  methods: {
    getDevices() {
      fetch(cms.baseUrl + 'digital/devices').then(i => i.json()).then(res => {
        this.devices = res.data;
      });
    },

    selectFile(item) {
      if (!this.selected.some(i => i.path === item.path)) {
        this.selected.push(item);
      }
    },

    getDirectory() {
      fetch(cms.baseUrl + 'digital/video/folders').then(i => i.json()).then(item => {
        this.items = item.tree.children; // this.current = item.tree;

        this.setCurrentItem([item.tree]);
      });
    },

    setCurrentItem(items, stack = []) {
      if (this.current) {
        return items.forEach(i => {
          if (i.type === 'directory') {
            this.setCurrentItem(i.children, [...stack, i]);
          }

          if (i.path === this.current.path) {
            this.current = i;
            this.stack = stack;
          }
        });
      } else {
        this.current = items[0];
      }
    },

    select(item) {
      if (item.type === 'directory') {
        this.stack.push(this.current);
        this.current = item;
      }
    },

    goBack() {
      if (this.stack.length >= 1) {
        this.current = this.stack.pop();
      }
    },

    uploadFile() {
      const data = new FormData();
      data.append('video', this.$refs.file.files[0]);
      console.log(_axios.default.get);

      _axios.default.post(cms.baseUrl + `digital/video/upload?toPath=${this.current.path}`, data, {
        onUploadProgress: ({
          loaded,
          total
        }) => {
          this.uploadProgress = loaded / total;
          console.log(this.uploadProgress);
        }
      }).then(res => {
        this.getDirectory();
        this.dialogUploadFile = false;
        this.uploadProgress = 0;
      }); // fetch(cms.baseUrl + `digital/video/upload?toPath=${this.current.path}`, {
      //   method: 'POST',
      //   body: data
      // });

    },

    newFolder() {
      fetch(cms.baseUrl + 'digital/video/new-folder', {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: this.current.path,
          name: this.folderName
        })
      }).then(res => this.getDirectory());
    },

    pushNotify() {
      if (!this.selectedDevices) {
        return alert('please select one device');
      }

      this.$options.socket.emit('WEB_LISTENER_PUSH_FILE_TO_DEVICE', this.selectedDevices, this.selected.map(i => i.path), (err, data) => {
        console.log(err, data);
      });
    },

    removeFile(item) {
      fetch(`${cms.baseUrl}digital/video/delete?path=${item.path}`, {
        method: 'DELETE'
      }).then(res => {
        this.selected = this.selected.filter(i => i.path !== item.path);
        this.getDirectory();
      });
    },

    removeFolder(item) {
      fetch(`${cms.baseUrl}digital/video/delete-folder?path=${item.path}`, {
        method: 'DELETE'
      }).then(res => {
        this.getDirectory();
      });
    },

    removeSelected(item) {
      this.selected = this.selected.filter(i => i !== item);
    },

    connectSocket() {
      this.$options.socket = _socket.default.connect(`ws://${location.hostname}:8888/file-manager-web`);
      console.log('connect');
      this.$options.socket.on('WEB_EVENT_FILE_PROGRESS', res => {
        this.progress = res;
      });
    }

  },

  mounted() {
    this.getDirectory();
    this.getDevices();
    this.connectSocket();
  }

};
exports.default = _default;
</script> 
<style>
    .radio-group .v-input__control {
        width: 100%
    }
</style>
