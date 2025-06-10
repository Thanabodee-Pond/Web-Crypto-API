import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * สร้าง User ใหม่ พร้อมกับสร้าง Wallet เริ่มต้น (THB และ USD)
   */
  async create(createUserDto: CreateUserDto) {
    const { email, username, password } = createUserDto;

    // ใช้ transaction เพื่อให้การสร้าง User และ Wallet เกิดขึ้นพร้อมกันและปลอดภัย
    return this.prisma.$transaction(async (tx) => {
      // ตรวจ email หรือ username ซ้ำ
      const existingUser = await tx.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (existingUser) {
        throw new ConflictException('Email or username already exists');
      }

      // เข้ารหัสรหัสผ่าน
      const hashedPassword = await bcrypt.hash(password, 10);

      // สร้าง User ใหม่
      const user = await tx.user.create({
        data: {
          email,
          username,
          password_hash: hashedPassword,
        },
      });

      // Wallet เริ่มต้น (THB และ USD) ให้กับ user ใหม่
      const fiatAssets = await tx.asset.findMany({
        where: {
          OR: [{ symbol: 'THB' }, { symbol: 'USD' }],
        },
      });

      if (fiatAssets.length > 0) {
        await tx.wallet.createMany({
          data: fiatAssets.map((asset) => ({
            userId: user.id,
            assetId: asset.id,
            balance: 0, // ยอดเงินเริ่มต้นเป็น 0
          })),
        });
        console.log(
          `Default THB/USD wallets created for user ${user.username}`,
        );
      } else {
        // กรณีฉุกเฉิน: ถ้าไม่มี THB/USD ในระบบ ให้ยกเลิกการสร้างทั้งหมด
        console.error(
          'THB or USD asset not found. Cannot create default wallets.',
        );
        throw new InternalServerErrorException('Initial assets not found.');
      }

      // ลบรหัสผ่านออกจาก object ที่จะส่งกลับไป
      const { password_hash, ...result } = user;
      return result;
    });
  }

  /**
   * ค้นหา User ด้วย Email (สำหรับระบบ Login)
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * ค้นหา User ด้วย Username (สำหรับระบบโอนเงิน)
   */
  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }
}
