import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum ContractType {
  ESCROW = 'escrow',
  MILESTONE = 'milestone',
  SUBSCRIPTION = 'subscription',
}

export enum ContractStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

@Entity('payment_contracts')
export class PaymentContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ name: 'creator_id' })
  creatorId: string;

  /** Counterparty wallet or user email – flexible to support both Web2 and Web3 */
  @Column({ name: 'beneficiary_ref', length: 255 })
  beneficiaryRef: string;

  @Column({ type: 'enum', enum: ContractType })
  type: ContractType;

  @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.DRAFT })
  status: ContractStatus;

  /** Amount in smallest unit */
  @Column({ type: 'bigint' })
  amount: string;

  @Column({ length: 10 })
  currency: string;

  /**
   * Flexible JSONB config per contract type:
   *   - escrow: { releaseCondition, arbitrator }
   *   - milestone: { milestones: [{ title, amount, dueDate }] }
   *   - subscription: { interval, intervalCount, trialDays }
   */
  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, unknown> | null;

  /** On-chain contract address once deployed */
  @Column({ name: 'on_chain_address', nullable: true })
  onChainAddress: string | null;

  /** Transaction hash of the deployment tx */
  @Column({ name: 'deploy_tx_hash', nullable: true })
  deployTxHash: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
