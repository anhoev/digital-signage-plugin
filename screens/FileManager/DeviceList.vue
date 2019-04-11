<template>
    <v-card>
        <v-dialog
                lazy
                persistant
                v-model="showDialogCreatePlaylist"
                width="1200"
        >
            <v-card>
                <v-card-text>
                    <span>Create playlist</span>

                    <v-text-field
                            label="Playlist Name *"
                            ref="inputRef"
                            v-model="playlistName"
                    >
                    </v-text-field>
                </v-card-text>

                <v-card-text>
                    <div class="v-table__overflow">
                        <table class="v-datatable v-table theme--light">
                            <tr v-for="item in playlist">
                                <td style="width: 100px">
                                    <thumbnail :item="item.media"></thumbnail>
                                </td>
                                <td style="max-width: 400px">
                                    <v-list-tile-title>name: {{item.media.name}}</v-list-tile-title>
                                    <v-list-tile-sub-title>path: {{item.media.path}}</v-list-tile-sub-title>
                                    <v-list-tile-sub-title>resolution: {{item.media.resolution}}
                                    </v-list-tile-sub-title>
                                    <v-list-tile-sub-title>type: {{item.media.type}}</v-list-tile-sub-title>
                                </td>
                                <td>
                                    <v-text-field v-model="item.duration" label="Duration"></v-text-field>
                                </td>
                                <td style="width: 300px">
                                    <v-flex px2 style="height: 30px">
                                        <v-select :items="effectOptions" v-model="item.effect" label="Effect"
                                        ></v-select>
                                    </v-flex>
                                </td>
                            </tr>
                        </table>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            color="green"
                            flat
                            @click="createPlaylist"
                    >
                        Create
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-toolbar color="light-blue" dark>
            <v-toolbar-title>SelectedFile</v-toolbar-title>
            <v-spacer></v-spacer>
        </v-toolbar>

        <v-list two-line subheader>
            <template v-for="(item, index) in selected"
            >

                <v-list-tile
                        :key="item.path"
                        avatar
                        three-line
                        class="py-1"
                        @click=""
                >
                    <v-list-tile-avatar style="height: 50px; width: 70px">
                        <!--                        <img :src="item.thumbnail" style="height: 50px; max-width: 70px; border-radius: 0"/>-->
                        <thumbnail :item="item"></thumbnail>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>name: {{item.name}}</v-list-tile-title>
                        <v-list-tile-sub-title>path: {{item.path}}</v-list-tile-sub-title>
                        <v-list-tile-sub-title>resolution: {{item.resolution}}</v-list-tile-sub-title>
                        <v-list-tile-sub-title>type: {{item.type}}</v-list-tile-sub-title>
                    </v-list-tile-content>

                    <v-list-tile-action>
                        <v-btn icon ripple @click="$emit('remove-item', item)">
                            <v-icon color="grey lighten-1">delete</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                </v-list-tile>
                <v-divider v-if="index!==selected.length-1"></v-divider>
            </template>
            <v-flex v-if="selected.length===0" pa-2>
                No selected items
            </v-flex>
        </v-list>
        <v-card-actions>
<!--            <v-btn @click="$emit('open-dialog')" :disabled="selected.length===0" flat color="orange">-->
<!--                PUSH TO DEVICE-->
<!--            </v-btn>-->
            <v-btn @click="showDialogCreatePlaylist = true" :disabled="selected.length===0" flat color="green">
                Create playlist
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
  export default {
    name: 'DeviceList',
    props: ['selected'],
    data() {
      return {
        showDialogCreatePlaylist: false,
        playlistName: '',
        effectOptions: [
          'fadeIn',
          'slideInUp',
          'slideInDown',
          'slideInLeft',
          'slideInRight',
          'bounceIn',
          'bounceInUp',
          'bounceInDown',
          'bounceInLeft',
          'bounceInRight',
          'zoomIn',
          'zoomInDown',
          'zoomInUp',
          'zoomInLeft',
          'zoomInRight'
        ],
        playlist: []
      };
    },
    watch: {
      showDialogCreatePlaylist(value) {
        if (value) {
          this.playlist = this.selected.map(item => {
            return {
              media: item,
              duration: '',
              effect: ''
            };
          });
        }
      }
    },
    methods: {
      createPlaylist() {
        cms.getModel('Playlist').create({ name: this.playlistName, content: this.playlist.map(item => ({ ...item, media: item.media._id })) })
          .then(() => this.showDialogCreatePlaylist = false);
      }
    }
  };
</script>

<style scoped>

</style>
