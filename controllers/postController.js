
const createPost = async (req, res) => {
    const { title, description } = req.body;
  
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
  
    try {
      const post = new Post({
        userId: req.user.id,
        title,
        description,
      });
  
      await post.save();
  
      res.status(201).json(post);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
const deletePost = async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
  
      // Delete the post from the Posts collection
      const post = await Post.findOneAndDelete({
        _id: postId,
        user_id: userId,
      });
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      // Delete the post ID from the user's posts array in the Users collection
      await User.updateOne({ _id: userId }, { $pull: { posts: postId } });
  
      return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

const likePost =  async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
  
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      if (post.likes.includes(userId)) {
        return res.status(400).json({ message: 'Post already liked' });
      }
  
      post.likes.push(userId);
      await post.save();
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.likedPosts.push(postId);
      await user.save();
  
      return res.status(200).json({ message: 'Post liked successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

module.exports = {createPost, deletePost}