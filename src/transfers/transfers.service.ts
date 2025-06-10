import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class TransfersService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async create(senderId: string, createTransferDto: CreateTransferDto) {
    const { recipientUsername, assetId, amount } = createTransferDto;

    return this.prisma.$transaction(async (tx) => {
      // ค้นหาผู้รับ
      const recipient = await this.usersService.findByUsername(recipientUsername);
      if (!recipient) {
        throw new NotFoundException('Recipient user not found');
      }
      const recipientId = recipient.id;

      // ตรวจสอบเงื่อนไข
      if (senderId === recipientId) {
        throw new ForbiddenException('You cannot transfer to yourself');
      }

      // ค้นหากระเป๋าเงินผู้ส่งและตรวจสอบยอดคงเหลือ
      const senderWallet = await tx.wallet.findFirst({
        where: { userId: senderId, assetId: assetId },
      });

      if (!senderWallet || senderWallet.balance.toNumber() < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // อัปเดตยอดเงินในกระเป๋าทั้งสองฝั่ง
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amount } },
      });
      await tx.wallet.upsert({
        where: { userId_assetId: { userId: recipientId, assetId: assetId } },
        update: { balance: { increment: amount } },
        create: { userId: recipientId, assetId: assetId, balance: amount },
      });

      // Transaction Log
      await tx.transactionLog.create({
        data: {
          type: 'TRANSFER',
          status: 'COMPLETED',
        },
      });

      return { message: 'Transfer successful' };
    });
  }
}