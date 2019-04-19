<template>
    <div id="googleMap" style="height: 500px; width: 100%"></div>
</template>
<script>
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  name: 'MapMaker',
  props: ['lng', 'lat'],

  mounted() {
    this.initMap();
  },

  updated() {
    this.initMap();
  },

  methods: {
    initMap() {
      const position = {
        lat: this.lat,
        lng: this.lng
      };
      this.map = new window.google.maps.Map(document.getElementById('googleMap'), {
        center: position,
        zoom: 15
      });
      this.marker = new window.google.maps.Marker({
        position,
        map: this.map
      });
    }

  }
};
exports.default = _default;
</script> 
<style scoped>

</style>
