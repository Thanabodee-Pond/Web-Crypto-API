import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
export class CreateWithdrawalDto {
  @IsInt() @IsNotEmpty()
  assetId: number;

  @IsNumber() @IsPositive() @IsNotEmpty()
  amount: number;

  @IsString() @IsNotEmpty()
  address: string; // ที่อยู่ Wallet ภายนอก
}