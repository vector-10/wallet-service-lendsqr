import request from 'supertest';
import app from '../app';
import userService from '../services/user.service';

jest.mock('../services/user.service');
const mockedUserService = userService as jest.Mocked<typeof userService>;

const mockUser = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'johndoe@gmail.com',
  phone: '+2348012345678',
  status: 'active' as const,
  created_at: new Date(),
};

describe('Auth Routes', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register user successfully', async () => {
      mockedUserService.register.mockResolvedValue({
        user: mockUser,
        token: 'mock_token',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'johndoe@gmail.com',
          phone: '+2348012345678',
          bvn: '22345678901',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'johndoe@gmail.com' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe(false);
    });

    it('should return 400 if email already in use', async () => {
      mockedUserService.register.mockRejectedValue(new Error('Email already in use'));

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'johndoe@gmail.com',
          phone: '+2348012345678',
          bvn: '22345678901',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email already in use');
    });

    it('should return 400 if user is blacklisted', async () => {
      mockedUserService.register.mockRejectedValue(
        new Error('Your identity has been flagged on the Lendsqr Karma blacklist. You cannot be onboarded.')
      );

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'blacklisted@gmail.com',
          phone: '+2348012345678',
          bvn: '22345678901',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('blacklist');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      mockedUserService.login.mockResolvedValue({
        user: mockUser,
        token: 'mock_token',
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'johndoe@gmail.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return 400 if credentials are invalid', async () => {
      mockedUserService.login.mockRejectedValue(new Error('Invalid credentials'));

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@gmail.com', password: 'wrongpassword' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return 400 if fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'johndoe@gmail.com' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe(false);
    });
  });
});