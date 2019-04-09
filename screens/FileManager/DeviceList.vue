<template>
    <v-card>
        <v-toolbar color="light-blue" dark>
            <v-toolbar-title>SelectedFile</v-toolbar-title>
            <v-spacer></v-spacer>

            <v-menu style="position: absolute; top: 0; right: 0">
                <v-btn icon style="position: absolute; right: 5px; top: 5px;" slot="activator">
                    <i class="fas fa-ellipsis-v"></i>
                </v-btn>
                <v-list>
                    <v-list-tile
                            @click="$emit('open-dialog')"
                    >
                        <v-list-tile-title>Push file to device</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile
                            @click=""
                    >
                        <v-list-tile-title>Create playlist</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>

<!--            <v-btn @click="$emit('open-dialog')" :disabled="selected.length===0">-->
<!--                PUSH TO DEVICE-->
<!--            </v-btn>-->
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
    </v-card>
</template>

<script>
  export default {
    name: 'DeviceList',
    props: ['selected']
  };
</script>

<style scoped>

</style>
