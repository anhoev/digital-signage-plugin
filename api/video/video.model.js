const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const VideoSchema = new Schema({
  video: {
    type: String,
    required: true
  },
  parts: [{
    type: Schema.Types.Mixed
  }],
  status: {
    type: Boolean,
    default: false
  },
  ext: {
    type: String,
    required: true
  }
}, {timestamps: true});

module.exports = mongoose.model('Video', VideoSchema);