import { OrderType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateOrderDto {
  @IsEnum(OrderType)
  @IsNotEmpty()
  orderType: OrderType; // 'BUY' or 'SELL'

  @IsInt()
  @IsNotEmpty()
  baseAssetId: number;

  @IsInt()
  @IsNotEmpty()
  quoteAssetId: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;
}
