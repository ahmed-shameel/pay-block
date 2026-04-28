import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BlockchainService } from '../blockchain/blockchain.service';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    private readonly blockchainService: BlockchainService,
    private readonly config: ConfigService,
  ) {
    // Initialise Stripe only when a key is provided (avoids failures in test env).
    const key = this.config.get<string>('app.stripeSecretKey');
    this.stripe = new Stripe(key ?? 'sk_test_placeholder', {
      apiVersion: '2024-04-10',
    });
  }

  // ── Create ──────────────────────────────────────────────────

  async createPayment(user: User, dto: CreatePaymentDto): Promise<Payment> {
    const method = dto.method ?? PaymentMethod.STRIPE;

    const payment = this.paymentRepo.create({
      userId: user.id,
      amount: String(dto.amount),
      currency: dto.currency.toLowerCase(),
      method,
      metadata: dto.metadata ?? null,
    });

    if (method === PaymentMethod.STRIPE) {
      const intent = await this.stripe.paymentIntents.create({
        amount: dto.amount,
        currency: dto.currency,
        metadata: { payblock_user_id: user.id },
      });
      payment.providerTxId = intent.id;
      payment.status = PaymentStatus.PROCESSING;
    }

    return this.paymentRepo.save(payment);
  }

  // ── Retrieve ────────────────────────────────────────────────

  async findAll(userId: string): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id, userId } });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);
    return payment;
  }

  // ── Stripe Webhook ──────────────────────────────────────────

  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.config.get<string>('app.stripeWebhookSecret');
    if (!webhookSecret) return; // skip in development when not configured

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      await this.handlePaymentSucceeded(intent.id);
    }
  }

  private async handlePaymentSucceeded(providerTxId: string): Promise<void> {
    const payment = await this.paymentRepo.findOne({ where: { providerTxId } });
    if (!payment) return;

    payment.status = PaymentStatus.SUCCEEDED;

    // Anchor the payment proof on-chain for immutable verification.
    const txHash = await this.blockchainService.anchorPaymentProof(payment.id);
    if (txHash) {
      payment.blockchainTxHash = txHash;
    }

    await this.paymentRepo.save(payment);
  }

  // ── Verify ──────────────────────────────────────────────────

  async verifyPayment(id: string): Promise<{ verified: boolean; blockchainTxHash: string | null }> {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException(`Payment ${id} not found`);

    const verified = await this.blockchainService.verifyPaymentProof(payment.id);
    return { verified, blockchainTxHash: payment.blockchainTxHash };
  }
}
