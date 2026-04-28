import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { User } from '../auth/entities/user.entity';

const mockUser: Partial<User> = { id: 'user-uuid', email: 'alice@example.com' };

const mockPayment: Partial<Payment> = {
  id: 'pay-uuid',
  userId: 'user-uuid',
  amount: '1000',
  currency: 'usd',
  method: PaymentMethod.STRIPE,
  status: PaymentStatus.PENDING,
  blockchainTxHash: null,
};

const mockPaymentRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockBlockchainService = {
  anchorPaymentProof: jest.fn().mockResolvedValue('0xabc'),
  verifyPaymentProof: jest.fn().mockResolvedValue(true),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('sk_test_placeholder'),
};

// Stripe is mocked at the module level to avoid real API calls.
jest.mock('stripe', () => {
  const mockStripeInstance = {
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: 'pi_test_123' }),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  };
  const MockStripe = jest.fn().mockImplementation(() => mockStripeInstance);
  return { __esModule: true, default: MockStripe };
});

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: mockPaymentRepo },
        { provide: BlockchainService, useValue: mockBlockchainService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return payments for the given user', async () => {
      mockPaymentRepo.find.mockResolvedValue([mockPayment]);

      const result = await service.findAll('user-uuid');

      expect(result).toHaveLength(1);
      expect(mockPaymentRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-uuid' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return the payment when found', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(mockPayment);

      const result = await service.findOne('pay-uuid', 'user-uuid');

      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-uuid', 'user-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('verifyPayment', () => {
    it('should return verification result', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(mockPayment);

      const result = await service.verifyPayment('pay-uuid');

      expect(result.verified).toBe(true);
      expect(mockBlockchainService.verifyPaymentProof).toHaveBeenCalledWith('pay-uuid');
    });
  });
});
