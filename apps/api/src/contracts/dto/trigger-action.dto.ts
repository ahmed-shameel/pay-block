import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TriggerActionDto {
  /**
   * Supported actions depend on the contract type:
   *  - escrow:       'release' | 'refund' | 'dispute'
   *  - milestone:    'complete_milestone' (requires milestoneIndex in params)
   *  - subscription: 'cancel' | 'pause' | 'resume'
   */
  @ApiProperty({ example: 'release' })
  @IsString()
  action: string;

  @ApiProperty({
    required: false,
    description: 'Action-specific parameters (e.g. { milestoneIndex: 0 })',
  })
  params?: Record<string, unknown>;
}
