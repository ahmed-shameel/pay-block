import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

const mockUser: User = {
  id: 'uuid-1',
  email: 'alice@example.com',
  passwordHash: bcrypt.hashSync('S3cr3tP@ss', 10),
  displayName: 'Alice',
  verified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user and return an access token', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'alice@example.com',
        password: 'S3cr3tP@ss',
      });

      expect(result).toEqual({ accessToken: 'signed.jwt.token' });
      expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when email is already taken', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'alice@example.com', password: 'S3cr3tP@ss' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'alice@example.com',
        password: 'S3cr3tP@ss',
      });

      expect(result).toEqual({ accessToken: 'signed.jwt.token' });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'alice@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
