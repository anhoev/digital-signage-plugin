<template>
    Hello
</template>
<script>
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _socket = _interopRequireDefault(require("socket.io-client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'Test',

  mounted() {
    this.$options.socket = _socket.default.connect(cms.baseUrl + 'file-manager-web');
    this.$options.socket.on('WEB_EVENT_FILE_PROGRESS', (a, b) => {
      console.log(a, b);
    });
  }

};
exports.default = _default;
</script> 
<style scoped>

</style>
