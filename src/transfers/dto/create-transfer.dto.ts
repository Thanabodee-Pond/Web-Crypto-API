import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  recipientUsername: string;

  @IsInt()
  @IsNotEmpty()
  assetId: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
