import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  CRYPTO = 'crypto',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  /** Amount in smallest currency unit (cents for USD, wei for ETH, etc.) */
  @Column({ type: 'bigint' })
  amount: string;

  /** ISO-4217 currency code (e.g. "usd") or crypto symbol (e.g. "eth") */
  @Column({ length: 10 })
  currency: string;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.STRIPE })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  /** Stripe PaymentIntent id or crypto tx hash */
  @Index()
  @Column({ name: 'provider_tx_id', nullable: true })
  providerTxId: string | null;

  /** Keccak-256 hash stored on-chain for immutable proof */
  @Column({ name: 'blockchain_tx_hash', nullable: true })
  blockchainTxHash: string | null;

  @Column({ name: 'blockchain_block_number', nullable: true, type: 'int' })
  blockchainBlockNumber: number | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
