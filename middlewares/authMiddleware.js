const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) throw new Error("You are not authenticated!");

  // Dummy email for demonstration purposes
  const {email} = jwt.verify(token, process.env.JWT_SECRET)
  try {
      // Get user from the token
      const user = await User.findOne({email}).select('-password')
      if(!user)  throw new Error("User not present!");
      req.user = user
      next()
    } catch (error) {
      console.log(error)
      res.status(401)
      throw new Error('Not authorized')
    }
};

module.exports = {authenticateToken};
