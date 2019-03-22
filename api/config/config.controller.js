const path = require('path');
const config = require('../../config/environment');

exports.common = function (req, res) {
  res.json({
    config: config.prefix_resource
  })
};