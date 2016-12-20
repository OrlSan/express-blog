var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
  postId: {
    type: String,
    required: true
  },
  authorId: { // El autor del comentario, no del post
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  contents: {
    type: String
  }
});

module.exports = mongoose.model('Comment', commentSchema);
