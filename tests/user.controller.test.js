const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { describe, beforeAll, afterAll, it, expect } = require('@jest/globals');

describe('User Controller Tests', () => {
    let testToken = null;
  
    beforeAll(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('testpassword', salt);
      await User.create({ email: 'test@example.com', password: hashedPassword });
  
      const testUser = await User.findOne({ email: 'test@example.com' });
      testToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });
  
    afterAll(async () => {
      await User.deleteOne({ email: 'test@example.com' });
    });
  
    it('should login a user successfully', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@example.com', password: 'testpassword' });
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('subscription', 'starter');
    });
  
    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@example.com', password: 'invalidpassword' });
  
      expect(response.status).toBe(401);
    });
  
    it('should use testToken to access protected routes', async () => {
      const response = await request(app)
        .get('/protected-route')
        .set('Authorization', `Bearer ${testToken}`);
  
      expect(response.status).toBe(200);
      
    });
  });