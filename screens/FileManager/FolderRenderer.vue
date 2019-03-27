<template>
    <v-layout>
        <v-flex md2 v-for="item in items" pa-2 style="position: relative" :key="item.path">
            <v-card center style="cursor: pointer" @click.stop="$emit('select', item)" @dblclick="select(item)">
                <v-flex center pa-3>
                    <i class="far fa-folder grid-icon" v-if="item.type==='directory'"></i>
                    <i class="far fa-file grid-icon" v-else></i>
                </v-flex>
                <v-card-text style="text-align: center">
                    <div style="overflow: hidden; text-overflow: ellipsis;" :title="item.name">{{item.name}}</div>
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
</template>

<script>
  export default {
    name: 'FolderRenderer',
    props: {
      items: null
    },
    methods: {
      select(item) {
        if (item.type === 'file') {
          this.$emit('select-file', item);
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
      }
    }
  };
</script>

<style scoped>
    .grid-icon {
        font-size: 50px;
    }
</style>
