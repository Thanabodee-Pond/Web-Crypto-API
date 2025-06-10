import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  // สร้าง Endpoint สำหรับ GET http://localhost:3000/wallets
  // และป้องกันด้วย JwtAuthGuard
  @UseGuards(JwtAuthGuard)
  @Get()
  findMyWallets(@Request() req) {
    // req.user มาจาก JwtStrategy หลังจากที่ Token ถูกตรวจสอบแล้ว
    const userId = req.user.userId;
    return this.walletsService.findUserWallets(userId);
  }
}