<template>
    <v-layout v-if="layout === 'grid'">
        <v-flex md3 v-for="item in items" pa-2 style="position: relative" :key="item.path">
            <v-card center style="cursor: pointer" @click.stop="$emit('select', item)" @dblclick="select(item)">
                <v-flex center pa-4 pt-5 pb-2>
                    <i class="far fa-folder grid-icon" v-if="item.type==='directory'"></i>
                    <video :src="getPrviewUrl(item.path)" class="preview-image"
                           v-else-if="isVideo(item.extension)"></video>
                    <img :src="getPrviewUrl(item.path)" class="preview-image"
                         v-else-if="isImage(item.extension)" />
                    <i class="far fa-file grid-icon" v-else></i>
                </v-flex>
                <v-card-text style="text-align: center">
                    <div style="overflow: hidden; text-overflow: ellipsis; line-height: 20px; height: 20px"
                         :title="item.name">{{item.name}}
                    </div>
                </v-card-text>
            </v-card>
            <v-menu style="position: absolute; top: 0; right: 0">
                <v-btn icon style="position: absolute; right: 0px; top: 0px;" slot="activator">
                    <v-icon>menu</v-icon>
                </v-btn>
                <v-list>
                    <v-list-tile
                            v-if="item.type==='file'"
                            @click="remove(item)"
                    >
                        <v-list-tile-title>Remove</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile
                            v-if="item.type==='file'"
                            @click="preview(item)"
                    >
                        <v-list-tile-title>Preview</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile
                            v-else
                            @click="removeFolder(item)"
                    >
                        <v-list-tile-title>Remove folder</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
        </v-flex>
        <v-flex v-if="items.length===0">
            No Items
        </v-flex>
    </v-layout>
    <v-layout v-else row wrap>
        <v-flex md12 v-for="item in items" ma-1 style="position: relative" :key="item.path">
            <v-card center style="cursor: pointer" @click.stop="$emit('select', item)" @dblclick="select(item)">
                <v-layout row wrap py-2>
                    <v-flex shrink center pa-4 style="font-size: 30px; width: 100px">
                        <i class="far fa-folder grid-icon" v-if="item.type==='directory'"></i>
                        <video :src="getPrviewUrl(item.path)" class="preview-image"
                               v-else-if="isVideo(item.extension)"></video>
                        <img :src="getPrviewUrl(item.path)" class="preview-image"
                             v-else-if="isImage(item.extension)" />
                        <i class="far fa-file grid-icon" v-else></i>
                    </v-flex>
                    <v-flex grow center justify-start>
                        <v-card-text style="text-align: left">
                            <div style="overflow: hidden; text-overflow: ellipsis; line-height: 20px; height: 20px"
                                 :title="item.name">{{item.name}}
                            </div>
                        </v-card-text>
                    </v-flex>
                </v-layout>
            </v-card>
            <v-menu style="position: absolute; top: 0; right: 0">
                <v-btn icon style="position: absolute; right: 0px; top: 0px;" slot="activator">
                    <v-icon>menu</v-icon>
                </v-btn>
                <v-list>
                    <v-list-tile
                            v-if="item.type==='file'"
                            @click="remove(item)"
                    >
                        <v-list-tile-title>Remove</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile
                            v-if="item.type==='file'"
                            @click="preview(item)"
                    >
                        <v-list-tile-title>Preview</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile
                            v-else
                            @click="removeFolder(item)"
                    >
                        <v-list-tile-title>Remove folder</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
        </v-flex>
    </v-layout>
</template>

<script>
  export default {
    name: 'FolderRenderer',
    props: {
      items: null,
      layout: String
    },
    methods: {
      select(item) {
        if (item.type === 'file') {
          this.$emit('select-file', item);
        }
      },
      isVideo(ext) {
        return ['.mp4', '.mkv', '.mov'].includes(ext);
      },
      isImage(ext) {
        return ['.jpg', '.jpeg', '.png', '.bmp'].includes(ext);
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
      getPrviewUrl(path) {
        return `${cms.baseUrl}video/${path}`;
      },
      preview(item) {
        window.open(this.getPrviewUrl(item.path), '_blank');
      }
    }
  };
</script>

<style scoped>
    .grid-icon {
        font-size: 50px;
    }

</style>
<style>
    .preview-image{
        height: 50px;
        max-width: 70px;
    }
</style>
