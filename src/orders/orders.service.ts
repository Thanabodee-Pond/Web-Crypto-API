import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  
  async create(userId: string, createOrderDto: CreateOrderDto) {
    return this.prisma.order.create({
      data: {
        userId: userId,
        ...createOrderDto,
        status: 'OPEN',
      },
    });
  }

  findAllOpenOrders() {
    return this.prisma.order.findMany({
      where: { status: 'OPEN' },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
  

  
  async execute(orderId: string, buyerId: string) {
    console.log(`[EXECUTE START] orderId: ${orderId}, buyerId: ${buyerId}`);

    try {
      return await this.prisma.$transaction(async (tx) => {
        console.log('[TX LOG] 1. Entered transaction block.');

        const order = await tx.order.findUnique({ where: { id: orderId } });
        console.log('[TX LOG] 2. Found order:', order ? 'OK' : 'NOT FOUND');

        if (!order) throw new NotFoundException('Order not found');
        if (order.status !== OrderStatus.OPEN)
          throw new BadRequestException('Order is not open');
        if (order.userId === buyerId)
          throw new ForbiddenException('Cannot execute your own order');

        const sellerId = order.userId;
        const totalCost = order.price.toNumber() * order.quantity.toNumber();
        const quantityToTrade = order.quantity.toNumber();
        console.log(
          `[TX LOG] 3. Calculated costs: totalCost=${totalCost}, quantityToTrade=${quantityToTrade}`,
        );

        const buyerQuoteWallet = await tx.wallet.findFirst({
          where: { userId: buyerId, assetId: order.quoteAssetId },
        });
        const sellerBaseWallet = await tx.wallet.findFirst({
          where: { userId: sellerId, assetId: order.baseAssetId },
        });
        console.log('[TX LOG] 4. Found wallets:', {
          buyerWallet: !!buyerQuoteWallet,
          sellerWallet: !!sellerBaseWallet,
        });

        if (!buyerQuoteWallet)
          throw new BadRequestException(
            `Buyer does not have a wallet for the quote asset.`,
          );
        if (!sellerBaseWallet)
          throw new BadRequestException(
            `Seller does not have a wallet for the base asset.`,
          );

        if (buyerQuoteWallet.balance.toNumber() < totalCost)
          throw new BadRequestException('Buyer has insufficient funds');
        if (sellerBaseWallet.balance.toNumber() < quantityToTrade)
          throw new BadRequestException('Seller has insufficient assets');
        console.log('[TX LOG] 5. Balance check passed.');

        console.log('[TX LOG] 6. Updating buyer quote wallet...');
        await tx.wallet.update({
          where: { id: buyerQuoteWallet.id },
          data: { balance: { decrement: totalCost } },
        });

        console.log('[TX LOG] 7. Upserting buyer base wallet...');
        await tx.wallet.upsert({
          where: {
            userId_assetId: { userId: buyerId, assetId: order.baseAssetId },
          },
          update: { balance: { increment: quantityToTrade } },
          create: {
            userId: buyerId,
            assetId: order.baseAssetId,
            balance: quantityToTrade,
          },
        });

        console.log('[TX LOG] 8. Updating seller base wallet...');
        await tx.wallet.update({
          where: { id: sellerBaseWallet.id },
          data: { balance: { decrement: quantityToTrade } },
        });

        console.log('[TX LOG] 9. Upserting seller quote wallet...');
        await tx.wallet.upsert({
          where: {
            userId_assetId: { userId: sellerId, assetId: order.quoteAssetId },
          },
          update: { balance: { increment: totalCost } },
          create: {
            userId: sellerId,
            assetId: order.quoteAssetId,
            balance: totalCost,
          },
        });

        console.log('[TX LOG] 10. Updating order status...');
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.FILLED },
        });

        console.log('[TX LOG] 11. Creating transaction log...');
        await tx.transactionLog.create({
          data: { type: 'TRADE', status: 'COMPLETED', orderId: orderId },
        });

        console.log('[TX LOG] 12. Transaction finished successfully!');
        return { message: 'Trade executed successfully!', order: updatedOrder };
      });
    } catch (error) {
      console.error('!!! TRANSACTION FAILED !!!', error);
      throw error;
    }
  }
}
