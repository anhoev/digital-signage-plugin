<template>
    <div id="googleMap" style="height: 500px; width: 100%"></div>
</template>

<script>

  let isLoadedGoogleMapsApi = false;


  export default {
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
        this.loadMapApi().then(() => {
          const position = { lat: this.lat, lng: this.lng };
          this.map = new window.google.maps.Map(document.getElementById('googleMap'), {
            center: position,
            zoom: 15
          });
          this.marker = new window.google.maps.Marker({ position, map: this.map });
        });

      },
      loadMapApi() {
        return new Promise((resolve, reject) => {
          if (!isLoadedGoogleMapsApi) {
            isLoadedGoogleMapsApi = true;

            const googleMapScript = document.createElement('script');
            let baseUrl = 'https://maps.googleapis.com/';

            let url = `${baseUrl}maps/api/js?key=AIzaSyDdyqgBg6_9ueNibN_Vi1BhOTsOw_PraHw`;

            googleMapScript.setAttribute('src', url);
            googleMapScript.setAttribute('async', '');
            googleMapScript.setAttribute('defer', '');
            googleMapScript.addEventListener('load', resolve);
            googleMapScript.addEventListener('error', reject);
            googleMapScript.addEventListener('abort', reject);
            document.head.appendChild(googleMapScript);
          } else {
            resolve();
          }
        });

      }
    }
  };
</script>

<style scoped>

</style>
