<template>
    <div style="margin-bottom: -15px">
        <!--        {{model}}-->
        <div class="subheading primary--text">{{model.name}}</div>
        <div class="grey--text text--darken-2">{{activeFrom}} to {{activeTo}}</div>
        <v-divider style="margin: 10px 0"></v-divider>
        <v-subheader style="padding: 0" v-for="item in model.weekdaySchedule">
            {{item.weekdays.join(', ')}}, {{item.from}} - {{item.to}}{{item.in==='next day'? '(Next Day)':''}} :
            {{item.playlist.name}}
        </v-subheader>
        <v-btn style="margin: 10px 0 10px -7px" @click="show=true" flat="" color="orange">Push</v-btn>
        <v-dialog v-model="show" width="600">
            <push-to-device v-if="show" :isolate="true" @push-notify="pushSchedule"></push-to-device>
        </v-dialog>
        <v-dialog v-model="trackProgressModel" width="1200">
            <div style="height: 90vh; background: #fff; overflow: auto">
                <progress-tracking v-if="trackProgressModel">
            </progress-tracking></div>
        </v-dialog>
    </div>
</template>
<script>
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _dayjs = _interopRequireDefault(require("dayjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'Schedule',
  props: ['model'],

  data() {
    return {
      show: false,
      trackProgressModel: false
    };
  },

  computed: {
    activeFrom() {
      return (0, _dayjs.default)(this.model.activeFrom).format('DD.MM.YYYY');
    },

    activeTo() {
      return (0, _dayjs.default)(this.model.activeTo).format('DD.MM.YYYY');
    }

  },
  methods: {
    pushSchedule(devices, socket) {
      // const device = devices[0];
      // axios.post('/digital/push-data', {
      //   event: 'APP_EVENT_RECEIVE_SCHEDULE',
      //   data: this.model,
      //   deviceId: device
      // }).then(res => {
      //   console.log(res);
      // }).catch(err => {
      //   console.log(err);
      // });
      socket.emit('WEB_LISTENER_PUSH_SCHEDULE', devices, this.model._id, a => {
        this.trackProgressModel = true;
      });
    }

  }
};
exports.default = _default;
</script> 
<style scoped>

</style>
