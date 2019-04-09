<template>
    <i class="far fa-folder grid-icon" v-if="item.type==='directory'"></i>
    <img :src="item.thumbnail" v-else-if="item.thumbnail" class="preview-image" />
<!--    <video :src="getPreviewUrl(item.path)" class="preview-image"-->
<!--           v-else-if="isVideo(item.extension || item.ext)"></video>-->
<!--    <img :src="getPreviewUrl(item.path)" class="preview-image"-->
<!--         v-else-if="isImage(item.extension  || item.ext)" />-->
    <i class="far fa-file grid-icon" v-else></i>
</template>

<script>
  export default {
    name: 'Thumbnail',
    props: ['item'],
    methods: {

      getPreviewUrl(path) {
        return `${cms.baseUrl}video/${path}`;
      },

      isVideo(ext) {
        return ['.mp4', '.mkv', '.mov'].includes(ext);
      },
      isImage(ext) {
        return ['.jpg', '.jpeg', '.png', '.bmp'].includes(ext);
      }
    }
  };
</script>


<style>
    .preview-image {
        height: 50px !important;
        max-width: 70px;
        align-self: center;
        border-radius: 0 !important;
    }
</style>
