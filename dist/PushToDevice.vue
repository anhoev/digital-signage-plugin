<template>
    <v-card>
        <v-card-title class="headline grey lighten-2" primary-title="">
            Push to device
        </v-card-title>
        <v-list subheader="">
            <v-list-tile v-for="(item, index) in listDevices" :key="item.path" class="pa-2" two-line="" avatar="">
                <v-list-tile-avatar>
                    <v-checkbox @change="changeDevice($event, item._id)">
                </v-checkbox></v-list-tile-avatar>
                <v-list-tile-content>
                    <v-list-tile-title>name: {{item.name}}</v-list-tile-title>
                    <v-list-tile-sub-title>model: {{item.model}}</v-list-tile-sub-title>
                    <v-list-tile-sub-title>resolution: {{item.resolution}}</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                    <i class="fas fa-circle" :class="isOnline(item)?'online':'offline'"></i>
                </v-list-tile-action>
            </v-list-tile>

            <!--                    </v-radio-group>-->
        </v-list>
        <v-divider></v-divider>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" flat="" @click="$emit('push-notify', selectedDevices, $options.socket)">
                PUSH
            </v-btn>
        </v-card-actions>
    </v-card>
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
  name: 'PushToDevice',
  props: ['onlineDevices', 'devices', 'isolate'],

  data() {
    return {
      selectedDevices: [],
      localOnlineDevices: null,
      localDevices: null
    };
  },

  mounted() {
    console.log('hello', this.isolate);

    if (this.isolate) {
      console.log('get');
      this.connectSocket();
      const Device = cms.getModel('Device');
      Device.find({}).then(res => {
        this.localDevices = res;
        console.log(res);
      });
    }
  },

  computed: {
    listDevices() {
      return this.localDevices || this.devices || [];
    },

    listOnlineDevices() {
      return this.localOnlineDevices || this.onlineDevices || [];
    }

  },

  beforeDestroy() {
    this.$options.socket && this.$options.socket.close();
  },

  methods: {
    connectSocket() {
      this.$options.socket = _socket.default.connect(cms.baseUrl + 'file-manager-web');
      this.$options.socket.on('connect', () => {
        this.$options.socket.emit('WEB_LISTENER_GET_ONLINE_DEVICE');
      });
      this.$options.socket.on('WEB_EVENT_LIST_ONLINE_DEVICE', list => {
        this.localOnlineDevices = list;
      });
    },

    isOnline(device) {
      const onlineDevices = this.listOnlineDevices;
      return onlineDevices.indexOf(device._id) > -1;
    },

    changeDevice(event, id) {
      if (event === true) {
        const isExist = this.selectedDevices.includes(id);

        if (!isExist) {
          this.selectedDevices.push(id);
        }
      } else {
        this.selectedDevices = this.selectedDevices.filter(i => i !== id);
      }
    }

  }
};
exports.default = _default;
</script> 
<style scoped>

    .online {
        color: #40bf5e
    }

    .offline {
        color: #c14444
    }
</style>
