import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PaymentContract,
  ContractStatus,
  ContractType,
} from './entities/payment-contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { TriggerActionDto } from './dto/trigger-action.dto';
import { BlockchainService } from '../blockchain/blockchain.service';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(PaymentContract)
    private readonly contractRepo: Repository<PaymentContract>,
    private readonly blockchainService: BlockchainService,
  ) {}

  // ── CRUD ────────────────────────────────────────────────────

  async create(user: User, dto: CreateContractDto): Promise<PaymentContract> {
    const contract = this.contractRepo.create({
      creatorId: user.id,
      type: dto.type,
      beneficiaryRef: dto.beneficiaryRef,
      amount: String(dto.amount),
      currency: dto.currency.toLowerCase(),
      config: dto.config ?? null,
    });
    return this.contractRepo.save(contract);
  }

  async findAll(userId: string): Promise<PaymentContract[]> {
    return this.contractRepo.find({
      where: { creatorId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<PaymentContract> {
    const contract = await this.contractRepo.findOne({
      where: { id, creatorId: userId },
    });
    if (!contract) throw new NotFoundException(`Contract ${id} not found`);
    return contract;
  }

  // ── Blockchain deployment ────────────────────────────────────

  async deploy(id: string, userId: string): Promise<PaymentContract> {
    const contract = await this.findOne(id, userId);
    if (contract.onChainAddress) {
      throw new BadRequestException('Contract already deployed on-chain');
    }

    const result = await this.blockchainService.deployContract(contract);
    contract.onChainAddress = result.address;
    contract.deployTxHash = result.txHash;
    contract.status = ContractStatus.ACTIVE;

    return this.contractRepo.save(contract);
  }

  // ── Action triggers ──────────────────────────────────────────

  async triggerAction(
    id: string,
    userId: string,
    dto: TriggerActionDto,
  ): Promise<{ txHash: string }> {
    const contract = await this.findOne(id, userId);

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Contract is not in ACTIVE state');
    }

    const txHash = await this.callContractAction(contract, dto);
    await this.applyStatusTransition(contract, dto.action);
    return { txHash };
  }

  // ── Private helpers ──────────────────────────────────────────

  private async callContractAction(
    contract: PaymentContract,
    dto: TriggerActionDto,
  ): Promise<string> {
    if (!contract.onChainAddress) {
      throw new BadRequestException('Contract is not deployed on-chain yet');
    }
    return this.blockchainService.callContractAction(
      contract.type,
      contract.onChainAddress,
      dto.action,
      dto.params,
    );
  }

  private async applyStatusTransition(
    contract: PaymentContract,
    action: string,
  ): Promise<void> {
    const terminalActions: Record<string, ContractStatus> = {
      release: ContractStatus.COMPLETED,
      refund: ContractStatus.CANCELLED,
      cancel: ContractStatus.CANCELLED,
      dispute: ContractStatus.DISPUTED,
    };
    const newStatus = terminalActions[action];
    if (newStatus) {
      contract.status = newStatus;
      await this.contractRepo.save(contract);
    }
  }

  // ── Public verification ──────────────────────────────────────

  async verifyContract(id: string): Promise<{ onChainAddress: string | null; status: string }> {
    const contract = await this.contractRepo.findOne({ where: { id } });
    if (!contract) throw new NotFoundException(`Contract ${id} not found`);
    return { onChainAddress: contract.onChainAddress, status: contract.status };
  }
}
