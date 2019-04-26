<template>
    <div>
        <v-dialog
                v-model="dialogUploadFile"
                width="300"
        >
            <upload-file :progress="uploadProgress" @upload="upload" @close="dialogUploadFile = false"></upload-file>
        </v-dialog>
        <button @click="dialogUploadFile=true">Update new apk</button>
    </div>
</template>

<script>
  import axios from 'axios';

  export default {
    name: 'ApkManager',
    data() {
      return {
        dialogUploadFile: false,
        uploadProgress: 0
      };
    },
    methods: {
      upload(files) {
        if (!files) {
          return alert('file is required');
        }
        const data = new FormData();
        data.append('video', files);
        axios.post(cms.baseUrl + `digital/file/upload?toPath=/apk&replace=true`, data, {
          onUploadProgress: ({ loaded, total }) => {
            this.uploadProgress = loaded / total;
            console.log(this.uploadProgress);
          }
        })
          .then(res => {
            console.log(res);
            this.dialogUploadFile = false;
            this.uploadProgress = 0;
            return axios.post('/digital/apkManager', {
              linkDownload: '/video' + res.data.path
            });
          })
          .then(res => {
            console.log(res);
          })
          .catch(console.error);
      }
    }
  };
</script>

<style scoped>

</style>
