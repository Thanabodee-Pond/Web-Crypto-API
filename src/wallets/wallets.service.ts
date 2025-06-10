import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  // ฟังก์ชันสำหรับดึงข้อมูล Wallets ทั้งหมดของ User คนเดียว
  findUserWallets(userId: string) {
    return this.prisma.wallet.findMany({
      where: {
        userId: userId,
      },
      // ดึงข้อมูลของ Asset ที่เกี่ยวข้องมาด้วย
      include: {
        asset: true,
      },
    });
  }
}