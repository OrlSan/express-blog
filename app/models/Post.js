var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
  authorId: String,
  date: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String
  },
  slug: {
    type: String,
    unique: true
  },
  contents: {
    type: String
  }
});

module.exports = mongoose.model('Post', postSchema);
