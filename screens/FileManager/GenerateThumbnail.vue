<template>
    <div style="height: 90vh; background: #fff; overflow: auto; position: relative">
        <v-tabs v-model="tab">
            <v-tab>
                Capture from video
            </v-tab>
            <v-tab>
                Upload thumbnail
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
            <v-tab-item style="height: 700px">
                <v-layout row wrap pa-2 style="height: 600px; overflow: scroll">
                    <v-flex md6>
                        <video ref="video"
                               :src="vSource"
                               style="width: 100%; height: auto"
                               type="video/mp4" controls crossorigin="anonymous"></video>
                    </v-flex>
                    <v-flex md6 pl-1>
                        <canvas ref="canvas"
                                :style="{width: '100%', height: 'auto'} "

                        ></canvas>

                    </v-flex>


                </v-layout>
                <v-card-actions style="position: absolute; bottom: 0">
                    <v-btn @click="capture" flat>Capture</v-btn>
                    <v-btn @click="onClickSave" flat>Save</v-btn>
                </v-card-actions>
            </v-tab-item>
            <v-tab-item>
                <v-card>
                    <v-card-title
                            class="headline grey lighten-2"
                            primary-title
                    >
                        UploadFile
                    </v-card-title>

                    <v-card-text>
                        <input type="file" ref="file" accept="image/*" @change="onFileChange" />
                    </v-card-text>
                    <v-card-text>
                        <img :src="previewUrl" style="width: 50%; height: auto; max-height: 500px" />

                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                                color="primary"
                                flat
                                @click="upload"
                        >
                            Upload
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>

  import cms from 'cms';

  export default {
    name: 'GenerateThumbnail',
    props: ['source', 'id', 'thumbnail'],
    computed: {
      vSource() {
        return cms.baseUrl + `video/${this.source}`;
      }
    },
    data() {
      return {
        width: 0,
        height: 0,
        tab: 0,
        previewUrl: ''
      };
    },
    methods: {
      async onClickSave() {
        await this.save();
        this.$emit('update:model', false);
        this.$emit('refresh');
      },
      async save() {
        const { canvas } = this.$refs;
        const Content = cms.getModel('Content');
        await Content.findByIdAndUpdate(this.id, { thumbnail: canvas.toDataURL('image/jpeg', 0.5) });
      },
      capture() {
        const { canvas, video } = this.$refs;
        console.log(canvas.width, canvas.height);
        canvas.width = 80;
        canvas.height = 80 * (this.$refs.video.videoHeight / this.$refs.video.videoWidth);
        canvas.getContext('2d').drawImage(video, 0, 0, this.$refs.video.videoWidth, this.$refs.video.videoHeight, 0, 0, canvas.width, canvas.height);

      },
      log() {
        console.log(this.$refs.video.videoWidth);

      },
      onLoadedData() {
        this.capture();
        this.save();
      },
      getThumbnailSize(originalWidth, originalHeight) {
        const width = 80;
        const height = width * (originalHeight / originalWidth);
        return { width, height };
      },
      generateThumbnailFromFile(files) {
        const url = URL.createObjectURL(files);
        return this.getBase64FromSource(url);
      },
      getBase64FromSource(src) {
        return new Promise(resolve => {
          const canvas = document.createElement('canvas');
          this.drawImg(canvas, src)
            .then((cv) => {
              resolve(cv.toDataURL('image/jpeg', 0.5));
            });
        });
      },
      drawImg(canvas, imageSrc) {
        const img = new Image();
        img.onload = () => {
          const context = canvas.getContext('2d');
          const thumbnailSize = this.getThumbnailSize(img.width, img.height);
          console.log(thumbnailSize);
          canvas.width = thumbnailSize.width;
          canvas.height = thumbnailSize.height;
          context.drawImage(img,
            0,
            0,
            img.width,
            img.height,
            0,
            0,
            canvas.width,
            canvas.height
          );
          resolve(canvas);
        };
        img.src = imageSrc;
      },
      upload() {
        const file = this.$refs.file.files[0];
        this.generateThumbnailFromFile(file)
          .then(async base64 => {
            const Content = cms.getModel('Content');
            await Content.findByIdAndUpdate(this.id, { thumbnail: base64 });
            this.$emit('update:model', false);
            this.$emit('refresh');
          });
      },
      onFileChange(e) {
        const file = e.target.files[0];
        this.previewUrl = URL.createObjectURL(file);
      }
    },
    mounted() {
      if (!this.thumbnail) {
        this.$refs.video.addEventListener('loadeddata', this.onLoadedData);
      } else {
        const { canvas } = this.$refs;
        this.drawImg(canvas, this.thumbnail)
      }
    },
    beforeDestroy() {
      this.$refs.video.removeEventListener('loadeddata', this.onLoadedData);
    }
  };
</script>

<style scoped>

</style>
