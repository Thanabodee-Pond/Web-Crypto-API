import { Controller, Get } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // สร้าง Endpoint สำหรับ GET http://localhost:3000/assets
  @Get()
  findAll() {
    return this.assetsService.findAll();
  }
}