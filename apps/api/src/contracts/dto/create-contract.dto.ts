import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContractType } from '../entities/payment-contract.entity';

export class CreateContractDto {
  @ApiProperty({
    enum: ContractType,
    description: 'Type of payment contract',
  })
  @IsEnum(ContractType)
  type: ContractType;

  @ApiProperty({
    example: 'alice@example.com',
    description: 'Email address or Ethereum wallet address of the beneficiary',
  })
  @IsString()
  beneficiaryRef: string;

  @ApiProperty({ example: 5000, description: 'Total contract value in smallest unit' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'usd' })
  @IsString()
  currency: string;

  /**
   * Type-specific configuration object.
   *
   * Escrow example:
   * ```json
   * { "releaseCondition": "Delivery confirmed", "arbitrator": "0xAbC..." }
   * ```
   *
   * Milestone example:
   * ```json
   * { "milestones": [{ "title": "Design", "amount": 2000, "dueDate": "2024-06-01" }] }
   * ```
   *
   * Subscription example:
   * ```json
   * { "interval": "month", "intervalCount": 1, "trialDays": 14 }
   * ```
   */
  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;
}
