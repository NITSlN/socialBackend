const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index')
const User = require('../models/UserSchema')
const Post = require('../models/PostSchema')
const { generateToken } = require('../utils/helper')
const Comment = require('../models/CommentSchema')
const { default: mongoose } = require('mongoose')

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

    after(async () => {
      await Post.deleteMany({userId:user._id})
    })
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

  describe('POST /api/like/:id', function() {
    this.timeout(10000)
    let postId
    before(async function() {
      // Create post to like
      this.timeout(10000)
      const res = await chai
        .request(app)
        .post('/api/posts')
        .set('Cookie', `access_token=${accessToken}`)
        .send({ title: 'Test Post', description: 'This is a test post' });
        postId = res.body._id;

    });

    it('should like a post', async () => {
      const res = await chai
        .request(app)
        .post('/api/like/'+postId)
        .set('Cookie', `access_token=${accessToken}`)
      expect(res).to.have.status(200);
      expect(res.body.message).to.equal('Post liked successfully');
    });

    it('should return an error if post is already liked', async () => {
      const res = await chai
        .request(app)
        .post(`/api/like/${postId}`)
        .set('Cookie', `access_token=${accessToken}`)
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('Post already liked');
    });

    after(async () => {
      // Delete test post and likes
      await chai
        .request(app)
        .delete(`/api/posts/${postId}`)
        .set('Cookie', `access_token=${accessToken}`)
    });
  });

  describe('POST /api/unlike/:id', function() {
    this.timeout(10000)
    let postId
  
    before(async function() {
      // Create post to like
      const res = await chai
        .request(app)
        .post('/api/posts')
        .set('Cookie', `access_token=${accessToken}`)
        .send({ title: 'Test Post', description: 'This is a test post' });
      postId = res.body._id;
  
      // Like post
      await chai
        .request(app)
        .post(`/api/like/${postId}`)
        .set('Cookie', `access_token=${accessToken}`)
    });
  
    it('should unlike a post', async () => {
      const res = await chai
        .request(app)
        .post(`/api/unlike/${postId}`)
        .set('Cookie', `access_token=${accessToken}`)
      expect(res).to.have.status(200);
      expect(res.body.message).to.equal('Post unliked successfully');
    });
  
    it('should return an error if post is not yet liked', async () => {
      // Unlike post first
      await chai
        .request(app)
        .post(`/api/unlike/${postId}`)
        .set('Cookie', `access_token=${accessToken}`)
  
      const res = await chai
        .request(app)
        .post(`/api/unlike/${postId}`)
        .set('Cookie', `access_token=${accessToken}`)
      expect(res).to.have.status(400);
      expect(res.body.message).to.equal('Post not liked yet');
    });
  
    after(async () => {
      // Delete test post
      await chai
        .request(app)
        .delete(`/api/posts/${postId}`)
        .set('Cookie', `access_token=${accessToken}`)
    });
  });

  describe('POST /api/comment/:id', function() {
    this.timeout(10000);
    let postId;
    let commentId;
  
    before(async function() {
      // Create post to comment on
      const res = await chai
        .request(app)
        .post('/api/posts')
        .set('Cookie', `access_token=${accessToken}`)
        .send({ title: 'Test Post', description: 'This is a test post' });
      postId = res.body._id;
    });
  
    it('should add a comment to a post', async () => {
      const res = await chai
        .request(app)
        .post(`/api/comment/${postId}`)
        .set('Cookie', `access_token=${accessToken}`)
        .send({ text: 'This is a comment' });
      expect(res).to.have.status(200);
      expect(res.body.commentId).to.be.a('string');
      commentId = res.body.commentId;
    });
  
    after(async () => {
      // Delete test post and comment
      await Comment.findByIdAndDelete(commentId)
      await Post.findByIdAndDelete(postId)
    });
  });

  describe('GET /api/posts/:id', function() {
    this.timeout(10000)
    let postId
  
    before(async function() {
      // Create post for test
      const res = await chai
        .request(app)
        .post('/api/posts')
        .set('Cookie', `access_token=${accessToken}`)
        .send({ title: 'Test Post', description: 'This is a test post' });
      postId = res.body._id;
    });
  
    it('should return a single post', async () => {
      const res = await chai
        .request(app)
        .get('/api/posts/' + postId)
        .set('Cookie', `access_token=${accessToken}`)
      expect(res).to.have.status(200);
      expect(res.body.post._id).to.equal(postId);
    });
  
    it('should return an error if post not found', async () => {
      const invalidUserId = new mongoose.Types.ObjectId('643581b181110af184141213');
      const res = await chai
        .request(app)
        .get('/api/posts/'+invalidUserId)
        .set('Cookie', `access_token=${accessToken}`)
      expect(res).to.have.status(404);
      expect(res.body.message).to.equal('Post not found');
    });
  
    after(async () => {
      // Delete test post and likes
      await chai
        .request(app)
        .delete(`/api/posts/${postId}`)
        .set('Cookie', `access_token=${accessToken}`)
    });
  });
  
  describe('GET /api/all_posts', function() {
    this.timeout(10000)
    before(async function() {
      // Create some test posts
      await chai
        .request(app)
        .post('/api/posts')
        .set('Cookie', `access_token=${accessToken}`)
        .send({ title: 'Test Post 1', description: 'This is a test post 1' });
      await chai
        .request(app)
        .post('/api/posts')
        .set('Cookie', `access_token=${accessToken}`)
        .send({ title: 'Test Post 2', description: 'This is a test post 2' });

    });
  
    it('should return all posts for authenticated user', async () => {
      const res = await chai
        .request(app)
        .get('/api/all_posts')
        .set('Cookie', `access_token=${accessToken}`)
      expect(res).to.have.status(200);
      expect(res.body.posts.length).to.equal(2);
    });
  
    after(async () => {
      // Delete test posts and likes
      await Post.deleteMany({ userId: user._Id });
    });
  });
  
})
