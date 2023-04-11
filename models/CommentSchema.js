const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model('Comment', CommentSchema)
