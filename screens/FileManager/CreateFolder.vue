<template>
    <v-card>
        <v-card-title
                class="headline grey lighten-2"
                primary-title
        >
            CreateFolder
        </v-card-title>

        <v-card-text>
            <v-text-field label="Folder Name" v-model="folderName"></v-text-field>
        </v-card-text>
        <v-divider></v-divider>

        <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                    color="orange"
                    flat
                    @click="$emit('close')"
            >
                Cancel
            </v-btn>
            <v-btn
                    color="primary"
                    flat
                    @click="onClick"
            >
                Create
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
  export default {
    name: 'CreateFolder',
    data() {
      return {
        folderName: ''
      };
    },
    methods: {
      onClick() {
        this.$emit('create', this.folderName);
      }
    }
  };
</script>

<style scoped>

</style>
