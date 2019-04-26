<template>
    <div>
        <v-dialog v-model="dialogUploadFile" width="300">
            <upload-file :progress="uploadProgress" @upload="upload" @close="dialogUploadFile = false"></upload-file>
        </v-dialog>
        <button @click="dialogUploadFile=true">Update new apk</button>
    </div>
</template>
<script>
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
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

      _axios.default.post(cms.baseUrl + `digital/file/upload?toPath=/apk&replace=true`, data, {
        onUploadProgress: ({
          loaded,
          total
        }) => {
          this.uploadProgress = loaded / total;
          console.log(this.uploadProgress);
        }
      }).then(res => {
        console.log(res);
        this.dialogUploadFile = false;
        this.uploadProgress = 0;
        return _axios.default.post('/digital/apkManager', {
          linkDownload: '/video' + res.data.path
        });
      }).then(res => {
        console.log(res);
      }).catch(console.error);
    }

  }
};
exports.default = _default;
</script> 
<style scoped>

</style>
