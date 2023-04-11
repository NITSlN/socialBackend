const User = require('../models/UserSchema')

// POST /api/follow/:id - follow a user
const followUser = async (req, res) => {
  try {
    const userId = req.user.id
    const followId = req.params.id

    const user = await User.findById(userId)
    const followUser = await User.findById(followId)

    if (!user || !followUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.following.includes(followId)) {
      return res.status(400).json({ message: 'Already following this user' })
    }

    user.following.push(followId)
    followUser.followers.push(userId)

    await user.save()
    await followUser.save()

    return res
      .status(200)
      .json({ message: `You have followed ${followUser.username}` })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// POST /api/unfollow/:id - unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const userId = req.user.id
    const unfollowId = req.params.id

    const user = await User.findById(userId)
    const unfollowUser = await User.findById(unfollowId)

    if (!user || !unfollowUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!user.following.includes(unfollowId)) {
      return res
        .status(400)
        .json({ message: 'You are not following this user' })
    }

    user.following = user.following.filter((id) => id.toString() !== unfollowId)
    unfollowUser.followers = unfollowUser.followers.filter(
      (id) => id.toString() !== userId,
    )

    await user.save()
    await unfollowUser.save()

    return res
      .status(200)
      .json({ message: `You have unfollowed ${unfollowUser.username}` })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// GET /api/user - gets user profile after authenticating
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res
      .status(200)
      .json({
        userName: user.name,
        followers: user.followers.length,
        following: user.following.length,
      })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { followUser, unfollowUser, getUserProfile }
