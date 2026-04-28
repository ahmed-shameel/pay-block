import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { User } from '../auth/entities/user.entity';

interface AuthenticatedRequest {
  user: User;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ── Authenticated endpoints ──────────────────────────────────

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new payment (Stripe or crypto)' })
  @ApiResponse({ status: 201, description: 'Payment created' })
  createPayment(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(req.user, dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all payments for the authenticated user' })
  findAll(@Request() req: AuthenticatedRequest) {
    return this.paymentsService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single payment by id' })
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.findOne(id, req.user.id);
  }

  // ── Public verification endpoint ─────────────────────────────

  @Get(':id/verify')
  @ApiOperation({ summary: 'Publicly verify a payment proof on-chain' })
  @ApiResponse({ status: 200, description: 'Verification result' })
  verify(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.verifyPayment(id);
  }

  // ── Stripe webhook ───────────────────────────────────────────

  @Post('webhook/stripe')
  @ApiOperation({ summary: 'Stripe webhook receiver (raw body required)' })
  stripeWebhook(
    @Req() req: RawBodyRequest<AuthenticatedRequest>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleStripeWebhook(
      req.rawBody as Buffer,
      signature,
    );
  }
}
