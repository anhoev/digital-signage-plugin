<template>
    <div style="padding: 15px">
        <!--        {{model}}-->
        <div class="subheading primary--text">{{model.name}}</div>
        <div class="grey--text text--darken-2">{{activeFrom}} to {{activeTo}}</div>
        <v-divider style="margin: 10px 0"></v-divider>
        <v-subheader style="padding: 0" v-for="item in model.weekdaySchedule">
            {{item.weekdays.join(', ')}}, {{item.from}} - {{item.to}}{{item.in==='next day'? '(Next Day)':''}} :
            <span v-if="item.playlist">{{item.playlist.name}}</span>
        </v-subheader>
        <v-btn style="margin: 10px 0 10px -7px" @click="show=true" flat color="orange">Push</v-btn>
        <v-dialog v-model="show" width="600">
            <push-to-device v-if="show" :isolate="true" @push-notify="pushSchedule" :model.sync="show"></push-to-device>
        </v-dialog>
        <v-dialog v-model="trackProgressModel" width="1200">
            <div style="height: 90vh; background: #fff; overflow: auto">
                <progress-tracking v-if="trackProgressModel" />
            </div>
        </v-dialog>
    </div>
</template>

<script>
  import axios from 'axios';
  import dayjs from 'dayjs';

  export default {
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
        return dayjs(this.model.activeFrom).format('DD.MM.YYYY');
      },
      activeTo() {
        return dayjs(this.model.activeTo).format('DD.MM.YYYY');
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
        const data = {
          devices: devices,
          schedule: this.model._id
        };
        socket.emit('WEB_LISTENER_PUSH_SCHEDULE', data, (err) => {
          if (err) {
            alert(err.join(', '));
          }
          this.show = false;
          this.trackProgressModel = true;
        });
      }
    }
  };
</script>

<style scoped>

</style>
