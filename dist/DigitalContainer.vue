<template>
    <div>
        <v-layout style="background-color: #3f51b5!important; color: #fff" row="" center="" px-3="">
            <v-btn icon="" v-show="stack.length>=1" @click.prevent="goBack" style="color: #fff">
                <v-icon>arrow_back</v-icon>
            </v-btn>
            <v-btn icon="" @click="getDirectory" style="color: #fff">
                <v-icon>cached</v-icon>
            </v-btn>
            <v-toolbar-title>Digital Signage</v-toolbar-title>

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
                    <v-layout>
                        <v-flex md9="">
                            <v-breadcrumbs :items="breadCrumbs" divider="-">
                                <template v-slot:item="{item}">
                                    <a href="#" @click.prevent="popTo(item.index)" v-if="item.index!==breadCrumbs.length-1" class="bread-crumb-section">{{ item.name
                                        }}</a>
                                    <div v-else="">{{ item.name }}</div>
                                </template>
                                <template v-slot:divider="">
                                    <v-icon>chevron_right</v-icon>
                                </template>
                            </v-breadcrumbs>
                        </v-flex>
                        <v-flex md3="" center="" justify-end="">
                            <v-btn fab="" dark="" :color="layout==='list' ? 'teal':'grey'" @click="layout='list'">
                                <v-icon dark="">list</v-icon>
                            </v-btn>
                            <v-btn fab="" dark="" :color="layout==='grid' ? 'teal':'grey'" @click="layout='grid'">
                                <v-icon dark="">widgets</v-icon>
                            </v-btn>
                        </v-flex>
                    </v-layout>
                    <folder-renderer :layout="layout" v-if="current" :items="current.children" :list-thumbnail="listThumbnail" @change-thumbnail="showChangeThumbnailDialog" @select="select" @remove-file="removeFile" @remove-folder="removeFolder" @select-file="selectFile"></folder-renderer>
                </v-flex>
                <v-flex md4="">
                    <device-list @open-dialog="dialogPushToDevice=true" :selected="selected" @remove-item="removeSelected">
                    </device-list>
                </v-flex>
            </v-layout>
        </v-container>
        <v-dialog v-model="dialogPushToDevice" width="500">
            <push-to-device v-if="dialogPushToDevice" :online-devices="onlineDevices" :devices="devices" @push-notify="pushNotify">
        </push-to-device></v-dialog>
        <v-dialog v-model="dialogUploadFile" width="300">
            <upload-file :key="dialogUploadFile" @upload="uploadFile" :progress="uploadProgress"></upload-file>
        </v-dialog>
        <v-dialog v-model="dialogCreateFolder" width="300">
            <create-folder :key="dialogCreateFolder" @create="newFolder"></create-folder>
        </v-dialog>
        <v-dialog v-model="trackProgressModel" width="1200">
            <div style="height: 90vh; background: #fff; overflow: auto">
                <progress-tracking :key="trackProgressModel">
            </progress-tracking></div>
        </v-dialog>
        <v-dialog width="1200" v-model="dialogCreateThumbnail">
            <generate-thumbnail v-if="dialogCreateThumbnail" @refresh="getDirectory" :model.sync="dialogCreateThumbnail" :thumbnail="createThumbnailInfo.thumbnail" :id="createThumbnailInfo._id" :source="createThumbnailInfo.path"></generate-thumbnail>
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

const KEY_LAYOUT = '__layout_digital';
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
      onlineDevices: [],
      selectedDevices: [],
      progress: [],
      uploadProgress: 0,
      layout: localStorage.getItem(KEY_LAYOUT) || 'list',
      trackProgressModel: false,
      dialogCreateThumbnail: false,
      createThumbnailInfo: {},
      listThumbnail: []
    };
  },

  computed: {
    breadCrumbs() {
      const home = {
        name: 'home',
        index: 0
      };

      if (!this.current || !this.current.path) {
        // console.log('hello');
        return [home];
      } else {
        return [home, ...this.current.path.split('/').map((item, index) => ({
          name: item,
          index: index + 1
        }))];
      }
    }

  },
  watch: {
    dialogPushToDevice(value) {
      if (!value) {
        this.progress = [];
        this.$options.socket.emit('WEB_LISTENER_LEAVE_PROGRESS');
      }
    },

    layout(value) {
      localStorage.setItem(KEY_LAYOUT, value);
    },

    current(value) {
      // check if current folder change, find all thumbnail of its children
      cms.getModel('Content').find({
        path: {
          $in: value.children.filter(i => i.type === 'file').map(i => i.path)
        }
      }).then(res => {
        this.listThumbnail = res || [];
      });
    }

  },
  methods: {
    popTo(number) {
      while (this.breadCrumbs.length - 1 > number) {
        this.current = this.stack.pop();
      }
    },

    showChangeThumbnailDialog(item) {
      this.dialogCreateThumbnail = true;
      this.createThumbnailInfo = {
        path: item.path,
        _id: item._id,
        thumbnail: item.thumbnail
      };
    },

    getDevices() {
      fetch(cms.baseUrl + 'digital/devices').then(i => i.json()).then(res => {
        this.devices = res.data;
      });
    },

    selectFile(item) {
      if (!this.selected.some(i => i.path === item.path)) {
        cms.getModel('Content').findOne({
          path: item.path
        }).then(res => {
          if (res) {
            this.selected.push(res);
          }
        }); // this.selected.push(item);
      }
    },

    getDirectory() {
      fetch(cms.baseUrl + 'digital/video/folders').then(i => i.json()).then(item => {
        this.items = item.tree.children; // this.current = item.tree;

        this.refreshCurrentItem([item.tree]);
      });
    },

    refreshCurrentItem(items, stack = []) {
      if (this.current) {
        return items.forEach(i => {
          if (i.type === 'directory') {
            this.refreshCurrentItem(i.children, [...stack, i]);
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

    getThumbnailSize(originalWidth, originalHeight) {
      const width = 80;
      const height = 80 * (originalHeight / originalWidth);
      return {
        width,
        height
      };
    },

    generateThumbnailFromFile(files) {
      return new Promise(resolve => {
        const url = URL.createObjectURL(files);
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const thumbnailSize = this.getThumbnailSize(img.width, img.height);
          console.log(thumbnailSize);
          canvas.width = thumbnailSize.width;
          canvas.height = thumbnailSize.height;
          context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.5));
        };

        img.src = url;
      });
    },

    uploadFile(files) {
      if (!files) {
        return alert('file is required');
      }

      const data = new FormData();
      data.append('video', files);

      _axios.default.post(cms.baseUrl + `digital/video/upload?toPath=${this.current.path}`, data, {
        onUploadProgress: ({
          loaded,
          total
        }) => {
          this.uploadProgress = loaded / total;
          console.log(this.uploadProgress);
        }
      }).then(res => {
        if (res.data.data.type.indexOf('video') > -1) {
          this.dialogCreateThumbnail = true;
          this.createThumbnailInfo = {
            path: res.data.data.path,
            _id: res.data.data._id
          };
        }

        if (res.data.data.type.indexOf('image') > -1) {
          this.generateThumbnailFromFile(files).then(base64 => {
            const Content = cms.getModel('Content');
            Content.findByIdAndUpdate(res.data.data._id, {
              thumbnail: base64
            }).then(() => {
              this.getDirectory();
            });
          });
        }

        this.getDirectory();
        this.dialogUploadFile = false;
        this.uploadProgress = 0;
      }); // fetch(cms.baseUrl + `digital/video/upload?toPath=${this.current.path}`, {
      //   method: 'POST',
      //   body: data
      // });

    },

    newFolder(folderName) {
      fetch(cms.baseUrl + 'digital/video/new-folder', {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: this.current.path,
          name: folderName
        })
      }).then(res => {
        this.dialogCreateFolder = false;
        this.getDirectory();
      }).catch(err => {
        this.dialogCreateFolder = false;
      });
    },

    pushNotify(selectedDevices) {
      if (!selectedDevices) {
        return alert('please select one device');
      }

      this.$options.socket.emit('WEB_LISTENER_PUSH_FILE_TO_DEVICE', selectedDevices, this.selected.map(i => i.path), (err, data) => {
        // if (Array.isArray(err) && err.length > 0) {
        //   alert(err.join(','));
        // } else {
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
        }); // }
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
      this.$options.socket = _socket.default.connect(cms.baseUrl + 'file-manager-web');
      console.log('connect');
      this.$options.socket.on('WEB_EVENT_FILE_PROGRESS', res => {
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

  beforeDestroy() {
    this.$options.socket && this.$options.socket.close();
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

    .bread-crumb-section {
        text-decoration: none;
    }
</style>
