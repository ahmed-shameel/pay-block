import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  /**
   * Amount in smallest currency unit.
   * For USD this is cents (e.g. 1000 = $10.00).
   * For ETH this is wei.
   */
  @ApiProperty({ example: 1000, description: 'Amount in smallest unit (cents / wei)' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'usd', description: 'ISO-4217 currency code or crypto symbol' })
  @IsString()
  currency: string;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.STRIPE })
  @IsEnum(PaymentMethod)
  @IsOptional()
  method?: PaymentMethod;

  @ApiProperty({
    required: false,
    description: 'Arbitrary key-value metadata stored with the payment',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
