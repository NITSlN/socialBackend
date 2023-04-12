const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index')
const expect = chai.expect
const mongoose = require('mongoose')
const sinon = require('sinon');
const jwt = require('jsonwebtoken')
const User = require('../models/UserSchema')

chai.use(chaiHttp)

describe('User functionality', function () {
  let accessToken = ''
  let user1,user2;
  this.timeout(5000)
  
  before(function (done) {
    this.timeout(10000); // set timeout to 10 seconds
    // log in user and get access token
    user1 = {
      email: 'testuser1@example.com',
      password: 'testpassword1',
    }
    user2 = {
      email: 'testuser2@example.com',
      password: 'testpassword2',
    }
    chai
      .request(app)
      .post('/api/authenticate')
      .send(user1)
      .end((err, res) => {
        accessToken = res.body.token
        done()
      })
    chai
      .request(app)
      .post('/api/authenticate')
      .send(user2)
      .end((err, res) => {
        done()
      })
  })
  
  afterEach(async () => {
    await User.findOneAndDelete({ email: user1.email })
    await User.findOneAndDelete({ email: user2.email })
  })
  describe('followUser function', () => {
    it('should follow a user', (done) => {
      chai
        .request(app)
        .post('/api/follow/'+user2._id)
        .set('Cookie', `access_token=${accessToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.have.property(
            'message',
            'You have followed '+user2.name,
          )
          done()
        })
    }).timeout(5000)

    it('should return an error if user to follow is not found', (done) => {
        const invalidUserId = new mongoose.Types.ObjectId('643581b181110af184141213');
      chai
        .request(app)
        .post(`/api/follow/${invalidUserId}`) // invalid userId
        .set('Cookie', `access_token=${accessToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404)
          expect(res.body).to.have.property('message', 'User not found')
          done()
        })
    }).timeout(5000)

    it('should return an error if already following user', (done) => {
      chai
        .request(app)
        .post('/api/follow/'+user2._id)
        .set('Cookie', `access_token=${accessToken}`)
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property(
            'message',
            'Already following this user',
          )
          done()
        })
    }).timeout(5000)
  })

  describe('unfollowUser function', () => {
    it('should unfollow a user', (done) => {
      chai
        .request(app)
        .post('/api/unfollow/'+user2._id)
        .set('Cookie', `access_token=${accessToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.have.property(
            'message',
            'You have unfollowed nitishgoku01',
          )
          done()
        })
    }).timeout(5000)

    it('should return an error if user to unfollow is not found', (done) => {
        const invalidUserId =new mongoose.Types.ObjectId('643581b181110af184141213');
      chai
        .request(app)
        .post(`/api/unfollow/${invalidUserId}`) //invalid userId
        .set('Cookie', `access_token=${accessToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404)
          expect(res.body).to.have.property('message', 'User not found')
          done()
        })
    }).timeout(5000)

    it('should return an error if not already following user', (done) => {
      chai
        .request(app)
        .post('/api/unfollow/'+user2._id)
        .set('Cookie', `access_token=${accessToken}`)
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property(
            'message',
            'You are not following this user',
          )
          done()
        })
    }).timeout(5000)
  })

  describe('getUserProfile function', () => {
    
    it('should return the user profile', (done) => {
      chai.request(app)
        .get('/api/user')
        .set('Cookie', `access_token=${accessToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('name', 'testuser')
          done()
        })
    }).timeout(5000)
  
    it('should return an error if user is not found', (done) => {
      // Set up a fake token for a non-existent user
      const fakeToken = jwt.sign({ email: 'invalid@email.com' }, process.env.JWT_SECRET)
  
      chai.request(app)
        .get('/api/user')
        .set('Cookie', `access_token=${fakeToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404)
          expect(res.body).to.have.property('message', 'User not found')
          done()
        })
    }).timeout(5000)
  
    it('should return an error if server encounters an error', (done) => {
      // Stub the User.findById function to throw an error
      sinon.stub(User, 'findById').throws()
  
      chai.request(app)
        .get('/api/user')
        .set('Cookie', `access_token=${accessToken}`)
        .end((err, res) => {
          expect(res).to.have.status(500)
          expect(res.body).to.have.property('message', 'Internal server error')
  
          // Restore the stub so it doesn't affect other tests
          User.findById.restore()
          done()
        })
    }).timeout(5000)
  })
  
})
