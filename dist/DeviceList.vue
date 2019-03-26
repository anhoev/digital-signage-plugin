<template>
    <v-card>
        <v-toolbar color="light-blue" dark="">
            <v-toolbar-title>SelectedFile</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn @click="$emit('open-dialog')">
                PUSH TO DEVICE
            </v-btn>
        </v-toolbar>

        <v-list two-line="" subheader="">
            <v-list-tile v-for="item in selected" :key="item.path" avatar="" class="py-2" @click="">
                <v-list-tile-avatar>
                    <i class="far fa-folder grid-icon" v-if="item.type==='directory'"></i>
                    <i class="far fa-file grid-icon" v-else=""></i>
                </v-list-tile-avatar>
                <v-list-tile-content>
                    <v-list-tile-title>name: {{item.name}}</v-list-tile-title>
                    <v-list-tile-sub-title>path: {{item.path}}</v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                    <v-btn icon="" ripple="" @click="$emit('remove-item', item)">
                        <v-icon color="grey lighten-1">delete</v-icon>
                    </v-btn>
                </v-list-tile-action>
            </v-list-tile>

            <v-flex v-if="selected.length===0" pa-2="">
                No selected items
            </v-flex>
        </v-list>
    </v-card>
</template>
<script>
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  name: 'DeviceList',
  props: ['selected']
};
exports.default = _default;
</script> 
<style scoped>

</style>
