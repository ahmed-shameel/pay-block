import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContractsService } from './contracts.service';
import {
  PaymentContract,
  ContractType,
  ContractStatus,
} from './entities/payment-contract.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { User } from '../auth/entities/user.entity';

const mockUser: Partial<User> = { id: 'user-uuid' };

const mockContract: Partial<PaymentContract> = {
  id: 'contract-uuid',
  creatorId: 'user-uuid',
  type: ContractType.ESCROW,
  status: ContractStatus.DRAFT,
  amount: '5000',
  currency: 'usd',
  beneficiaryRef: 'bob@example.com',
  onChainAddress: null,
};

const mockContractRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockBlockchainService = {
  deployContract: jest
    .fn()
    .mockResolvedValue({ address: '0xContractAddr', txHash: '0xDeployHash' }),
  callContractAction: jest.fn().mockResolvedValue('0xActionHash'),
};

describe('ContractsService', () => {
  let service: ContractsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: getRepositoryToken(PaymentContract), useValue: mockContractRepo },
        { provide: BlockchainService, useValue: mockBlockchainService },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a new contract', async () => {
      mockContractRepo.create.mockReturnValue(mockContract);
      mockContractRepo.save.mockResolvedValue(mockContract);

      const result = await service.create(mockUser as User, {
        type: ContractType.ESCROW,
        beneficiaryRef: 'bob@example.com',
        amount: 5000,
        currency: 'usd',
      });

      expect(result).toEqual(mockContract);
    });
  });

  describe('findOne', () => {
    it('should return the contract when found', async () => {
      mockContractRepo.findOne.mockResolvedValue(mockContract);

      const result = await service.findOne('contract-uuid', 'user-uuid');

      expect(result).toEqual(mockContract);
    });

    it('should throw NotFoundException when contract not found', async () => {
      mockContractRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-uuid', 'user-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deploy', () => {
    it('should deploy the contract on-chain and update status', async () => {
      const draftContract = { ...mockContract };
      mockContractRepo.findOne.mockResolvedValue(draftContract);
      mockContractRepo.save.mockResolvedValue({
        ...draftContract,
        onChainAddress: '0xContractAddr',
        status: ContractStatus.ACTIVE,
      });

      const result = await service.deploy('contract-uuid', 'user-uuid');

      expect(result.onChainAddress).toBe('0xContractAddr');
      expect(result.status).toBe(ContractStatus.ACTIVE);
    });

    it('should throw BadRequestException if contract already deployed', async () => {
      mockContractRepo.findOne.mockResolvedValue({
        ...mockContract,
        onChainAddress: '0xAlreadyDeployed',
      });

      await expect(service.deploy('contract-uuid', 'user-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('triggerAction', () => {
    it('should call the on-chain action and return txHash', async () => {
      mockContractRepo.findOne.mockResolvedValue({
        ...mockContract,
        status: ContractStatus.ACTIVE,
        onChainAddress: '0xContractAddr',
      });
      mockContractRepo.save.mockResolvedValue({});

      const result = await service.triggerAction('contract-uuid', 'user-uuid', {
        action: 'release',
      });

      expect(result.txHash).toBe('0xActionHash');
    });
  });
});
