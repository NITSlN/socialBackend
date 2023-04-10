const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  dislikedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
})

module.exports = mongoose.model('User', UserSchema)
