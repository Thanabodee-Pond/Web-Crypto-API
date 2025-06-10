import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // สำหรับดูรายการในตลาด (สาธารณะ)
  @Get()
  findAll() {
    return this.ordersService.findAllOpenOrders();
  }

  // สำหรับสร้าง Order ใหม่ (ต้อง Login)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user.userId;
    return this.ordersService.create(userId, createOrderDto);
  }

  // สำหรับตอบรับ Order (ต้อง Login)
  @UseGuards(JwtAuthGuard)
  @Post(':id/execute')
  execute(@Param('id') orderId: string, @Request() req) {
    const buyerId = req.user.userId;
    return this.ordersService.execute(orderId, buyerId);
  }
}
