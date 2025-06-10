import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@UseGuards(JwtAuthGuard)
@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  create(@Request() req, @Body() createWithdrawalDto: CreateWithdrawalDto) {
    return this.withdrawalsService.create(req.user.userId, createWithdrawalDto);
  }
}