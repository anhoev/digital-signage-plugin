<template>
    <v-layout v-if="layout === 'grid'" wrap="" row="">
        <v-flex md2="" v-for="item in items" pa-2="" class="grid" :key="item.path">
            <v-card center="" class="file-card" @click="select(item)" :class="isSelected(item)?'selected-file':''">
                <!--                <i class="fas fa-check"></i>-->
                <v-flex center="" pa-4="" pt-5="" pb-2="">
                    <thumbnail :item="getThumbnailItem(item)"></thumbnail>
                </v-flex>
                <v-card-text style="text-align: center">
                    <div style="overflow: hidden; text-overflow: ellipsis; line-height: 20px; height: 20px" :title="item.name">{{item.name}}
                    </div>
                </v-card-text>
            </v-card>
            <v-menu style="position: absolute; top: 0; right: 0">
                <v-btn icon="" style="position: absolute; right: 0px; top: 5px;" slot="activator" class="hoverIcon">
                    <i class="fas fa-ellipsis-v"></i>
                </v-btn>
                <v-list>
                    <v-list-tile v-if="item.type==='file'" @click="remove(item)">
                        <v-list-tile-title>Remove</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile v-if="isVideo(item)" @click="$emit('change-thumbnail', getThumbnailItem(item))">
                        <v-list-tile-title>Change thumbnail</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile v-if="item.type==='file'" @click="preview(item)">
                        <v-list-tile-title>Preview</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile v-if="item.type==='directory'" @click="removeFolder(item)">
                        <v-list-tile-title>Remove folder</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
        </v-flex>
        <v-flex v-if="items.length===0">
            No Items
        </v-flex>
    </v-layout>
    <v-layout v-else="" row="" wrap="">
        <v-flex md12="" v-for="item in items" ma-1="" style="position: relative" :key="item.path">
            <v-card center="" class="file-card" @click="select(item)" :class="isSelected(item)?'selected-file':''">
                <v-layout row="" wrap="" py-2="">
                    <v-flex shrink="" center="" pa-4="" style="font-size: 30px; width: 100px">
                        <thumbnail :item="getThumbnailItem(item)"></thumbnail>
                    </v-flex>
                    <v-flex grow="" center="" justify-start="">
                        <v-card-text style="text-align: left">
                            <div style="overflow: hidden; text-overflow: ellipsis; line-height: 20px; height: 20px" :title="item.name">{{item.name}}
                            </div>
                        </v-card-text>
                    </v-flex>
                </v-layout>
            </v-card>
            <v-menu style="position: absolute; top: 0; right: 0">
                <v-btn icon="" style="position: absolute; right: 0px; top: 5px;" slot="activator" class="hoverIcon">
                    <i class="fas fa-ellipsis-v"></i>
                </v-btn>
                <v-list>
                    <v-list-tile v-if="item.type==='file'" @click="remove(item)">
                        <v-list-tile-title>Remove</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile v-if="isVideo(item)" @click="$emit('change-thumbnail', getThumbnailItem(item))">
                        <v-list-tile-title>Change thumbnail</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile v-if="item.type==='file'" @click="preview(item)">
                        <v-list-tile-title>Preview</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile v-if="item.type==='directory'" @click="removeFolder(item)">
                        <v-list-tile-title>Remove folder</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
        </v-flex>
    </v-layout>
</template>
<script>
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _cms = _interopRequireDefault(require("cms"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'FolderRenderer',
  props: {
    items: null,
    layout: String,
    listThumbnail: Array,
    selected: Array
  },
  methods: {
    isSelected(item) {
      return this.selected.some(i => i.path === item.path);
    },

    isVideo(item) {
      const dbItem = this.getThumbnailItem(item);

      if (dbItem.type && dbItem.type.indexOf('video') > -1) {
        return true;
      }

      return false;
    },

    getThumbnailItem(item) {
      if (item.type === 'directory') {
        return item;
      }

      return this.listThumbnail.find(i => i.path === item.path) || {};
    },

    select(item) {
      if (item.type === 'file') {
        this.$emit('select-file', item);
      } else {
        this.$emit('select', item);
      }
    },

    remove(item) {
      if (item.type === 'file') {
        this.$emit('remove-file', item);
      }
    },

    removeFolder(item) {
      if (item.type === 'directory' && item.children.length === 0) {
        this.$emit('remove-folder', item);
      } else {
        alert('cannot remove not empty folder');
      }
    },

    preview(item) {
      window.open(this.getPreviewUrl(item.path), '_blank');
    },

    getPreviewUrl(path) {
      return `${_cms.default.baseUrl}video/${path}`;
    }

  }
};
exports.default = _default;
</script> 
<style scoped>.grid {
  position: relative;
  flex-basis: 20%;
  max-width: 20%; }

.grid-icon {
  font-size: 50px; }

.hoverIcon {
  opacity: 0.4; }
  .hoverIcon:hover {
    opacity: 1; }

.file-card {
  cursor: pointer;
  user-select: none; }
</style>
<style>
    .selected-file {
        background-color: #ecf2fc !important;
        color: #1c3ffff7 !important;;
    }
</style>
