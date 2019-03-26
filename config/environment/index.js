const _ = require('lodash');
const path = require('path');

const all = {};

module.exports = _.merge(
  all,
  {
    host: 'localhost',
    port: 8888,
    imageStore: cms.storage,
    prefixFile: 'media_',
    split_size: 524288,
    prefix_resource: {
      domain_download: 'http://localhost:8888',
      prefix_download: '/file/parts/'
    },
    mongodb: {
      server_config: {
        username: '',
        password: '',
        host: 'localhost',
        port: 27017
      },
      dbName: 'signage-local'
    }
  }
);
