<template>
    <v-app id="inspire">
        Hello
        <p>{{files}}</p>
        <p> {{playlist}}
        </p>
        <v-btn>Connect</v-btn>
    </v-app>
</template>

<script>

  import io from 'socket.io-client';

  export default {
    name: 'DeviceManager',
    data: () => ({
      files: ['1234', '12445222', '123123333', '1231231111', '12341234', '13214123'],
      playlist: []
    }),
    props: {
      source: String
    },
    methods: {
      connectSocket() {
        this.socket = io.connect(`http://localhost:8888/file-manager-app?token=eMQOOK5pJTo:APA91bFDPeXeiYtgPfgdbUPslCl9di0hJkgV_xrUkgiVEdkD92CKFyy0G4AwM9u4bLDRRKBkogaaEv4MmEnrprPK494pV2QEHnGESqME3yHmkraijRuY_Xen9txoie_cI5Si-6aX3P4d`);
        this.socket.on('APP_ACTION_PUSH_FILES', (fn) => {
          // DO READ FILE AND callback with files list ex: ['movie1.mp4', 'movie2.mp4']
          fn(null, this.files);
        });

        this.socket.on('APP_ACTION_DELETE_FILE', (name, fn) => {
          this.files = this.files.filter(item => item !== name);
          // DO DELETE FILE AND callback with files list ex: ['movie1.mp4', 'movie2.mp4']
          console.log(this.files);
          fn(null, this.files);
        });

        this.socket.on('APP_ACTION_PUSH_PLAYLIST', (fn) => {
          fn(null, this.playlist);
        });

        this.socket.on('APP_ACTION_DELETE_PLAYLIST', (_id, fn) => {
          console.log('hello');
          this.playlist = this.playlist.filter(item => item._id !== _id);
          fn(null, this.playlist);
        });
      }
    },
    mounted() {
      this.connectSocket();
      // this.getDevices();
      const Model = cms.getModel('Playlist');
      Model.find({}).populate('content.media').select('-device')
        .then((res => {
          this.playlist = res;
        }));
    }
  };
</script>

<style scoped>

</style>
