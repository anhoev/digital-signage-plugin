<template>
    <div style="margin-bottom: -15px">
        <!--        {{model}}-->
        <div>Schedule Name: {{model.name}}</div>
        <div>Time: from {{model.activeFrom}} to {{model.activeTo}}</div>
        <div>Weekday schedule:</div>
        <div v-for="item in model.weekdaySchedule">
            {{item.weekdays.join(', ')}}, {{item.from}} - {{item.to}}{{item.in==='next day'? '(Next Day)':''}} :
            {{item.playlist.name}}
        </div>
        <v-btn @click="show=true" flat color="orange">Push</v-btn>
        <v-dialog v-model="show" width="600">
            <push-to-device v-if="show" :isolate="true" @push-notify="pushSchedule"></push-to-device>
        </v-dialog>
    </div>
</template>

<script>
  import axios from 'axios';

  export default {
    name: 'Schedule',
    props: ['model'],
    data() {
      return {
        show: false
      };
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
        socket.emit('WEB_LISTENER_PUSH_SCHEDULE', devices, this.model._id, a => console.log(a));
      }
    }
  };
</script>

<style scoped>

</style>
