<template>
    <v-card>
        <v-card-title
                class="headline grey lighten-2"
                primary-title
        >
            UploadFile
        </v-card-title>

        <v-card-text>
            <input type="file" ref="file" />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-text>
            <div style="width: 100%; height: 10px; border-radius: 5px; background: #ddd; overflow: hidden">
                <div style="height: 100%; background-color: #03a9f4"
                     :style="{width: progress*100 + '%'}"></div>
            </div>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                    color="primary"
                    flat
                    @click="$emit('upload', $refs.file.files[0])"
            >
                Upload
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
  export default {
    name: 'UploadFile',
    props: ['progress']
  };
</script>

<style scoped>

</style>
