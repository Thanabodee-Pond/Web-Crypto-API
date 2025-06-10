import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  // สำหรับดึงข้อมูล Asset ทั้งหมด
  findAll() {
    return this.prisma.asset.findMany();
  }
}