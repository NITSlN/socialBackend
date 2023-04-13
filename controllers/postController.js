const Comment = require('../models/CommentSchema')
const Post = require('../models/PostSchema')
const User = require('../models/UserSchema')

const createPost = async (req, res) => {
  const { title, description } = req.body

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: 'Title and description are required' })
  }

  try {
    const post = new Post({
      userId: req.user.id,
      title,
      description,
    })

    await post.save()

    res.status(201).json(post)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user.id

    // Delete the post from the Posts collection
    const post = await Post.findOneAndDelete({
      _id: postId
    })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // Delete the post ID from the user's posts array in the Users collection
    await User.updateOne({ _id: userId }, { $pull: { posts: postId } })

    return res.status(200).json({ message: 'Post deleted successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const likePost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user.id

    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Post already liked' })
    }

    post.likes.push(userId)
    await post.save()

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.likedPosts.push(postId)
    await user.save()

    return res.status(200).json({ message: 'Post liked successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
const unlikePost = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user.id

    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (!post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Post not liked yet' })
    }
    // unliking the post removing from the likes array
    post.likes = post.likes.filter((like) => like.toString() !== userId)
    await post.save()

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // removing from the user's likedPosts
    user.likedPosts = user.likedPosts.filter(
      (likedPost) => likedPost.toString() !== postId,
    )
    await user.save()

    return res.status(200).json({ message: 'Post unliked successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
const addComment = async (req, res) => {
  try {
    const postId = req.params.id
    const userId = req.user.id
    const { text } = req.body

    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // creating comment
    const comment = await Comment.create({
      userId,
      postId,
      text,
    })
    // adding comment to post
    post.comments.push(comment)
    await post.save()

    return res.status(200).json({ commentId:comment._id })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

const getSinglePost = async (req, res) => {
  try {
    const postId = req.params.id

    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    const numLikes = post.likes.length
    const numComments = post.comments.length
    return res.status(200).json({ post, numLikes, numComments })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
const getAllPosts = async (req, res) => {
  try {
    const userId = req.user.id

    const posts = await Post.find({ user_id: userId })
      .populate('comments.user_id', '-password')
      .sort({ created_at: 'desc' })
      .exec()

    const formattedPosts = posts.map((post) => ({
      id: post._id,
      title: post.title,
      desc: post.description,
      created_at: post.created_at,
      comments: post.comments,
      likes: post.likes.length,
    }))

    return res.status(200).json({ posts: formattedPosts })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  createPost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getSinglePost,
  getAllPosts,
}
