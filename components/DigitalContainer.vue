<template>
    <v-app id="inspire">
        <v-toolbar color="indigo" dark fixed app>
            <v-btn icon v-show="stack.length>=1" @click.prevent="goBack">
                <v-icon>arrow_back</v-icon>
            </v-btn>
            <v-btn icon @click="getDirectory">
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
            <!--<v-btn @click="dialogPushToDevice2=true; ">-->
            <!--PUSh2-->
            <!--</v-btn>-->
        </v-toolbar>
        <v-content>
            <v-container fluid fill-height>
                <v-layout>
                    <v-flex md8>
                        <v-breadcrumbs :items="breadCrumbs" divider="-">
                            <template v-slot:item="{item}">
                                <div>{{ item }}</div>
                            </template>
                            <template v-slot:divider>
                                <v-icon>chevron_right</v-icon>
                            </template>
                        </v-breadcrumbs>
                        <folder-renderer
                                v-if="current" :items="current.children" @select="select"
                                @remove-file="removeFile"
                                @remove-folder="removeFolder"
                                @select-file="selectFile"></folder-renderer>
                    </v-flex>
                    <v-flex md4>
                        <v-card>
                            <v-toolbar color="light-blue" dark>
                                <v-toolbar-title>SelectedFile</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-btn @click="dialogPushToDevice=true">
                                    PUSH TO DEVICE
                                </v-btn>
                            </v-toolbar>

                            <v-list two-line subheader>
                                <v-list-tile
                                        v-for="item in selected"
                                        :key="item.path"
                                        avatar
                                        class="py-2"
                                        @click=""
                                >
                                    <v-list-tile-avatar>
                                        <i class="far fa-folder grid-icon" v-if="item.type==='directory'"></i>
                                        <i class="far fa-file grid-icon" v-else></i>
                                    </v-list-tile-avatar>
                                    <v-list-tile-content>
                                        <v-list-tile-title>name: {{item.name}}</v-list-tile-title>
                                        <v-list-tile-sub-title>path: {{item.path}}</v-list-tile-sub-title>
                                    </v-list-tile-content>

                                    <v-list-tile-action>
                                        <v-btn icon ripple @click="selected = selected.filter(i=>i!==item)">
                                            <v-icon color="grey lighten-1">delete</v-icon>
                                        </v-btn>
                                    </v-list-tile-action>
                                </v-list-tile>

                                <v-flex v-if="selected.length===0" pa-2>
                                    No selected items
                                </v-flex>
                            </v-list>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
        <v-dialog v-model="dialogPushToDevice" width="500">
            <v-card>
                <v-card-title
                        class="headline grey lighten-2"
                        primary-title
                >
                    Push to device
                </v-card-title>
                <v-list subheader>

                    <v-list-tile
                            v-for="(item, index) in devices"
                            :key="item.path"
                            class="pa-2"
                    >

                        <v-list-tile-content>
                            <v-list-tile-title>name: {{item['device-name']}}</v-list-tile-title>
                            <v-list-tile-sub-title>model: {{item.model}}</v-list-tile-sub-title>


                        </v-list-tile-content>

                        <v-list-tile-action>
                            <v-checkbox
                                    @change="changeDevice($event, item.token)"
                            ></v-checkbox>
                        </v-list-tile-action>
                    </v-list-tile>
                </v-list>
                <v-divider></v-divider>

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
        <v-dialog
                v-model="dialogUploadFile"
                width="300"
        >
            <v-card>
                <v-card-title
                        class="headline grey lighten-2"
                        primary-title
                >
                    UploadFile
                </v-card-title>

                <v-card-text>
                    <input type="file" ref="file" />
                </v-card-text>
                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            color="primary"
                            flat
                            @click="uploadFile(); dialogUploadFile = false"
                    >
                        Upload
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
                v-model="dialogCreateFolder"
                width="300"
        >
            <v-card>
                <v-card-title
                        class="headline grey lighten-2"
                        primary-title
                >
                    CreateFolder
                </v-card-title>

                <v-card-text>
                    <v-text-field label="Folder Name" v-model="folderName"></v-text-field>
                </v-card-text>
                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            color="primary"
                            flat
                            @click="newFolder(); dialogCreateFolder=false"
                    >
                        Create
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>

<script>
  import axios from 'axios';
  import _ from 'lodash';

  export default {
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
        selectedDevices: []
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
    methods: {
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
      getDevices() {
        fetch(cms.baseUrl + 'digital/devices')
          .then(i => i.json())
          .then(res => {
            this.devices = res.data;
          });
      },
      selectFile(item) {
        if (!this.selected.some(i => i.path === item.path)) {
          this.selected.push(item);
        }
      },
      getDirectory() {
        fetch(cms.baseUrl + 'digital/video/folders')
          .then(i => i.json())
          .then(item => {
            this.items = item.tree.children;
            // this.current = item.tree;
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
        fetch(cms.baseUrl + `digital/video/upload?toPath=${this.current.path}`, {
          method: 'POST',
          body: data
        }).then(res => this.getDirectory());
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
        if (this.selectedDevices.length === 0) {
          return alert('please select one device');
        }
        fetch(cms.baseUrl + 'digital/devices/push', {
          method: 'POST',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            files: this.selected.map(item => item.path),
            token: this.selectedDevices
          })
        }).then(() => {
          this.dialogPushToDevice = false;
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
      }
    },
    mounted() {
      this.getDirectory();
      this.getDevices();
    }
  };
</script>

<style scoped>

</style>
