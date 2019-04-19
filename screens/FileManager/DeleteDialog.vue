<template>
    <v-card v-if="model">
        <v-card-title
                class="headline grey lighten-2"
                primary-title
        >
            Delete file {{deleteItem.name}}{{deleteItem.ext}}
        </v-card-title>
        <v-card-text>
            Are you sure want to delete this file and all of playlist and schedule contain it
        </v-card-text>
        <v-card-text>

            <v-layout row wrap>
                <v-flex subheader md6 v-if="playlist.length>0">
                    <v-list>
                        <v-subheader>Playlist</v-subheader>
                        <v-list-tile v-for="item in playlist" :key="item._id">
                            <v-list-tile-content>
                                <v-list-tile-title>{{item.name}}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                </v-flex>
                <v-flex subheader md6 v-if="schedule.length>0">
                    <v-list>
                        <v-subheader>Schedule</v-subheader>
                        <v-list-tile v-for="item in schedule" :key="item._id">
                            <v-list-tile-content>
                                <v-list-tile-title>{{item.name}}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                </v-flex>
            </v-layout>
        </v-card-text>
        <v-card-actions>
            <v-btn flat color="orange" @click="$emit('close-dialog')">Cancel</v-btn>
            <v-btn flat color="red" @click="$emit('remove-file', deleteItem, playlist, schedule)">Delete all</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
  export default {
    name: 'DeleteDialog',
    props: ['deleteItem', 'model'],
    data() {
      return {
        playlist: [],
        schedule: []
      };
    },
    watch: {
      deleteItem(value) {
        console.log(value);
        cms.getModel('Playlist').find({ content: { $elemMatch: { media: value._id } } })
          .then(res => {
            this.playlist = res;
            return cms.getModel('Schedule').find({ weekdaySchedule: { $elemMatch: { playlist: { $in: res.map(i => i._id) } } } }).then(res => {
              this.schedule = res;
            });
          });

      }
    }
    // computed: {
    //   deletePlaylist() {
    //     return this.playlist.filter(playlist => {
    //       return playlist.content && playlist.content.some(i => i.media && this.deleteItem === i.media.name + i.media.ext);
    //     });
    //   },
    //   deleteSchedule() {
    //     return this.schedule.filter(schedule => {
    //       return schedule.weekdaySchedule.some(i => this.deletePlaylist.some(d => {
    //         return i.playlist && d._id === i.playlist._id;
    //       }));
    //     });
    //   }
    // }
  };
</script>

<style scoped>

</style>
