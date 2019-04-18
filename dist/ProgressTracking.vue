<template>
    <v-layout row="" wrap="" v-if="progress.length>0">
        <v-flex md3="" v-for="{job, data, device} in progress" pa-2="" :key="job._id">
            <v-card>
                <v-list subheader="">
                    <v-list-tile class="px-2 py-1">
                        <v-list-tile-content>
                            <v-list-tile-title>JOB: {{job._id}}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile class="px-2 py-1">

                        <v-list-tile-content>
                            <v-list-tile-title> Type: {{job.type}}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile v-if="device" class="px-2 py-1">
                        <v-list-tile-content>
                            <v-list-tile-title> Device: {{device.name}}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile class="px-2 py-1">
                        <v-list-tile-content>
                            <v-list-tile-title :class="getClassByStatus(job.status)"> Status: {{job.status}}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
                <v-divider></v-divider>
                <v-list two-line="" subheader="">
                    <v-list-tile v-for="item in data" :key="item.name" avatar="" class="py-2" @click="">
                        <v-list-tile-avatar>
                            <i class="far fa-file grid-icon"></i>
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title>name: {{item.name}}</v-list-tile-title>
                            <v-list-tile-sub-title>
                                <div class="progress-bar-outer" v-if="item.progress!==1">
                                    <div class="progress-bar" :style="{width: item.progress*100 + '%'}"></div>
                                </div>
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-card>
        </v-flex>
    </v-layout>
    <v-layout center="" v-else="">
        No job currently running
    </v-layout>
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
  name: 'TTTTT',

  data() {
    return {
      progress: []
    };
  },

  mounted() {
    this.$options.socket = _socket.default.connect(cms.baseUrl + 'file-manager-web', {
      query: {
        token: localStorage.getItem('__token')
      }
    });
    this.$options.socket.on('connect', () => {
      this.$options.socket.emit('WEB_LISTENER_VIEW_PROGRESS');
    });
    this.$options.socket.on('WEB_EVENT_FILE_PROGRESS', ({
      job,
      data,
      device
    }) => {
      const currentProgress = this.progress.findIndex(item => item.job._id === job._id);
      console.log(job, data);

      if (currentProgress < 0) {
        this.progress.push({
          job,
          data
        });
      } else {
        this.$set(this.progress, currentProgress, {
          job,
          data: data || this.progress[currentProgress].data,
          device: device || this.progress[currentProgress].data
        });
      }
    });
  },

  beforeDestroy() {
    if (this.$options.socket && typeof this.$options.socket.close === 'function') {
      this.$options.socket.close();
    }
  },

  methods: {
    getClassByStatus(status) {
      switch (status) {
        case 'finish':
          {
            return 'green--text';
          }

        case 'fail':
          {
            return 'red--text';
          }
      }
    }

  }
};
exports.default = _default;
</script> 
<style scoped>
    .progress-bar {
        height: 100%;
        background-color: #03a9f4;
        transition: width 300ms ease-in-out;
    }

    .progress-bar-outer {
        width: 80%;
        height: 10px;
        border-radius: 5px;
        background: #ddd;
        overflow: hidden
    }
</style>
