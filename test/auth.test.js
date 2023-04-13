const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const expect = chai.expect;
const User = require('../models/UserSchema')

chai.use(chaiHttp);

describe('User authentication', () => {
  let user
  before(async function() {
    this.timeout(10000)
    user = new User({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    })
    await user.save()
  })

  after(async () => {
    await User.findOneAndDelete({ email: user.email })
  })

  it('should authenticate user and set cookie with access token', (done) => {
    chai.request(app)
      .post('/api/authenticate')
      .send(user)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.have.cookie('access_token');
        done();
      });
  }).timeout(5000);
  
  it('should return an error if email and password are not provided', (done) => {
    chai.request(app)
      .post('/api/authenticate')
      .send({})
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('message', 'Email and Password is required');
        done();
      });
  }).timeout(5000);
});

