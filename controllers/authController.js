const { generateToken } = require("../utils/helper")
const User = require("../models/UserSchema")
const loginUser = async (req, res) => {
  try {
    const {email,password} = req.body
    if(!email || !password) throw new Error("Email and Password is required")
    const name = email.split('@')[0]
    const user = await User.findOne({email})
    if(!user){
      await User.create({
        email,password,name
      })
    }
    token = generateToken(email)// using dummy id as 1
    res
      .cookie('access_token', token, {
        expires: new Date(Date.now() + 25892000000),
        httpOnly: true,
      })
      .status(200)
      .json({
        token 
      })
  } catch (e) {
    console.log(e)
  }
}

const createUser = async (req, res)=>{
  try {
    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json("User Not Created")
  }
}
module.exports = {loginUser,createUser}
