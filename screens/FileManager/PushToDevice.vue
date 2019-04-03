<template>
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
                    avatar
            >
                <v-list-tile-avatar>
                    <v-checkbox
                            @change="changeDevice($event, item._id)"
                    />
                </v-list-tile-avatar>
                <v-list-tile-content>
                    <v-list-tile-title>name: {{item.name}}</v-list-tile-title>
                    <v-list-tile-sub-title>model: {{item.model}}</v-list-tile-sub-title>
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
            <v-btn
                    color="primary"
                    flat
                    @click="$emit('push-notify', selectedDevices)"
            >
                PUSH
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
  export default {
    name: 'PushToDevice',
    props: ['onlineDevices', 'devices'],
    data() {
      return {
        selectedDevices: []
      };
    },
    methods: {
      isOnline(device) {
        return this.onlineDevices.indexOf(device._id) > -1;
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
</script>

<style scoped>

    .online {
        color: #40bf5e
    }

    .offline {
        color: #c14444
    }
</style>
