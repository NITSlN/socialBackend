const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index')
const User = require('../models/UserSchema')
const Post = require('../models/PostSchema')
const { generateToken } = require('../utils/helper')

chai.use(chaiHttp)
const expect = chai.expect

describe('Post functionality',function () {
  let accessToken,user
  this.timeout(5000)
  before(async function(){
    this.timeout(5000)
    user = new User({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    })
    await user.save()

    accessToken = generateToken(user.email)
  })

  after(async () => {
    await User.deleteMany()
    await Post.deleteMany()
  })

  describe('createPost function', () => {
    it('should create a post', (done) => {
      chai
        .request(app)
        .post('/api/posts')
        .set('Cookie', `access_token=${accessToken}`)
        .send({
          title: 'My First Post',
          description: 'This is my first post',
        })
        .end(async (err, res) => {
          expect(res).to.have.status(201)
          done()
        })
    }).timeout(10000)

    it('should return an error if title or description is missing', (done) => {
      chai
        .request(app)
        .post('/api/posts')
        .set('Cookie', `access_token=${accessToken}`)
        .send({
          description: 'This is my second post',
        })
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property(
            'message',
            'Title and description are required',
          )
          done()
        })
    }).timeout(5000)
  })

  describe('deletePost function', () => {
    let post

    before(async () => {
      post = new Post({
        userId: user._id,
        title: 'My Second Post',
        description: 'This is my second post',
      })
      await post.save()

      user.posts.push(post._id)
      await user.save()
    })

    it('should delete a post', (done) => {
      chai
        .request(app)
        .delete(`/api/posts/${post._id}`)
        .set('Cookie', `access_token=${accessToken}`)
        .end(async (err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.have.property(
            'message',
            'Post deleted successfully',
          )

          const deletedPost = await Post.findById(post._id)
          expect(deletedPost).to.be.null

          const userWithDeletedPost = await User.findById(user._id)
          expect(userWithDeletedPost.posts).to.not.contain(post._id)

          done()
        })
    }).timeout(5000)

    it('should return an error if post is not found', (done) => {
      chai
        .request(app)
        .delete('/api/posts/643581b181110af184141212') //invalid postId
        .set('Cookie', `access_token=${accessToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404)
          expect(res.body).to.have.property('message', 'Post not found')
          done()
        })
    })
    it('should return an error if user is not authorized', (done) => {
      chai
        .request(app)
        .delete(`/api/posts/${post._id}`)
        .end((err, res) => {
          expect(res).to.have.status(401)
          expect(res.body).to.have.property('message', 'You are not authenticated!')
          done()
        })
    }).timeout(5000)
  })
})
