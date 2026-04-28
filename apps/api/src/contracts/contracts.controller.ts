import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { TriggerActionDto } from './dto/trigger-action.dto';
import { User } from '../auth/entities/user.entity';

interface AuthenticatedRequest {
  user: User;
}

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment contract (escrow / milestone / subscription)' })
  @ApiResponse({ status: 201, description: 'Contract created' })
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateContractDto) {
    return this.contractsService.create(req.user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all contracts for the authenticated user' })
  findAll(@Request() req: AuthenticatedRequest) {
    return this.contractsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single contract by id' })
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.contractsService.findOne(id, req.user.id);
  }

  @Post(':id/deploy')
  @ApiOperation({ summary: 'Deploy the contract to the configured blockchain network' })
  @ApiResponse({ status: 201, description: 'Contract deployed on-chain' })
  deploy(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.contractsService.deploy(id, req.user.id);
  }

  @Post(':id/actions')
  @ApiOperation({
    summary: 'Trigger a contract action (release / refund / complete_milestone …)',
  })
  triggerAction(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TriggerActionDto,
  ) {
    return this.contractsService.triggerAction(id, req.user.id, dto);
  }

  @Get(':id/verify')
  @ApiOperation({ summary: 'Publicly verify a contract on-chain state' })
  verify(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.verifyContract(id);
  }
}
