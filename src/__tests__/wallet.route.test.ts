import request from 'supertest';
import app from '../app';
import walletService from '../services/wallet.service';
import * as tokenUtils from '../utils/token';
import { UnprocessableError } from '../utils/errors';

jest.mock('../services/wallet.service');
jest.mock('../utils/token');

const mockedWalletService = walletService as jest.Mocked<typeof walletService>;
const mockedVerifyToken = tokenUtils.verifyToken as jest.Mock;

const mockAuthUser = { id: 1, email: 'johndoe@gmail.com' };
const mockWallet = {
  id: 1,
  user_id: 1,
  balance: 5000,
  currency: 'NGN',
  created_at: new Date(),
  updated_at: new Date(),
};

beforeEach(() => {
  mockedVerifyToken.mockReturnValue(mockAuthUser);
});

describe('Wallet Routes', () => {
  describe('POST /api/v1/wallet/fund', () => {
    it('should fund wallet successfully', async () => {
      mockedWalletService.fundWallet.mockResolvedValue({
        wallet: { ...mockWallet, balance: 10000 },
        reference: 'TXN-123',
      });

      const res = await request(app)
        .post('/api/v1/wallet/fund')
        .set('Authorization', 'Bearer mock_token')
        .send({ amount: 5000 });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data).toHaveProperty('reference');
    });

    it('should return 400 if amount is missing', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/fund')
        .set('Authorization', 'Bearer mock_token')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.status).toBe(false);
    });

    it('should return 401 if no token provided', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/fund')
        .send({ amount: 5000 });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/wallet/transfer', () => {
    it('should transfer funds successfully', async () => {
      mockedWalletService.transferFunds.mockResolvedValue({
        reference: 'TXN-456',
        amount: 1000,
        receiver: 'receiver@gmail.com',
      });

      const res = await request(app)
        .post('/api/v1/wallet/transfer')
        .set('Authorization', 'Bearer mock_token')
        .send({ receiver_email: 'receiver@gmail.com', amount: 1000 });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it('should return 400 if receiver email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/transfer')
        .set('Authorization', 'Bearer mock_token')
        .send({ amount: 1000 });

      expect(res.status).toBe(400);
    });

    it('should return 422 if insufficient funds', async () => {
      mockedWalletService.transferFunds.mockRejectedValue(new UnprocessableError('Insufficient funds'));

      const res = await request(app)
        .post('/api/v1/wallet/transfer')
        .set('Authorization', 'Bearer mock_token')
        .send({ receiver_email: 'receiver@gmail.com', amount: 999999 });

      expect(res.status).toBe(422);
      expect(res.body.message).toBe('Insufficient funds');
    });
  });

  describe('POST /api/v1/wallet/withdraw', () => {
    it('should withdraw successfully', async () => {
      mockedWalletService.withdrawFunds.mockResolvedValue({
        wallet: { ...mockWallet, balance: 4500 },
        reference: 'TXN-789',
      });

      const res = await request(app)
        .post('/api/v1/wallet/withdraw')
        .set('Authorization', 'Bearer mock_token')
        .send({ amount: 500 });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it('should return 422 if insufficient funds', async () => {
      mockedWalletService.withdrawFunds.mockRejectedValue(new UnprocessableError('Insufficient funds'));

      const res = await request(app)
        .post('/api/v1/wallet/withdraw')
        .set('Authorization', 'Bearer mock_token')
        .send({ amount: 999999 });

      expect(res.status).toBe(422);
      expect(res.body.message).toBe('Insufficient funds');
    });

    it('should return 400 if amount is missing', async () => {
      const res = await request(app)
        .post('/api/v1/wallet/withdraw')
        .set('Authorization', 'Bearer mock_token')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/wallet/balance', () => {
    it('should get wallet balance successfully', async () => {
      mockedWalletService.getWalletBalance.mockResolvedValue(mockWallet);

      const res = await request(app)
        .get('/api/v1/wallet/balance')
        .set('Authorization', 'Bearer mock_token');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it('should return 401 if no token', async () => {
      const res = await request(app)
        .get('/api/v1/wallet/balance');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/wallet/transactions', () => {
    it('should get transaction history successfully', async () => {
      mockedWalletService.getTransactionHistory.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/wallet/transactions')
        .set('Authorization', 'Bearer mock_token');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });
  });
});