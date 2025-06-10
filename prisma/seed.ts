import { PrismaClient, AssetType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const btc = await prisma.asset.upsert({
    where: { symbol: 'BTC' },
    update: {},
    create: { name: 'Bitcoin', symbol: 'BTC', type: AssetType.CRYPTO },
  });
  const eth = await prisma.asset.upsert({
    where: { symbol: 'ETH' },
    update: {},
    create: { name: 'Ethereum', symbol: 'ETH', type: AssetType.CRYPTO },
  });
  const xrp = await prisma.asset.upsert({
    where: { symbol: 'XRP' },
    update: {},
    create: { name: 'XRP', symbol: 'XRP', type: AssetType.CRYPTO },
  });
  const doge = await prisma.asset.upsert({
    where: { symbol: 'DOGE' },
    update: {},
    create: { name: 'Dogecoin', symbol: 'DOGE', type: AssetType.CRYPTO },
  });
  const thb = await prisma.asset.upsert({
    where: { symbol: 'THB' },
    update: {},
    create: { name: 'Thai Baht', symbol: 'THB', type: AssetType.FIAT },
  });
  const usd = await prisma.asset.upsert({
    where: { symbol: 'USD' },
    update: {},
    create: { name: 'US Dollar', symbol: 'USD', type: AssetType.FIAT },
  });
  console.log('Assets created.');

  const password = await bcrypt.hash('password1234', 10);
  const userA = await prisma.user.upsert({
    where: { email: 'user_a@example.com' },
    update: {},
    create: {
      email: 'user_a@example.com',
      username: 'user_a',
      password_hash: password,
    },
  });
  const userB = await prisma.user.upsert({
    where: { email: 'user_b@example.com' },
    update: {},
    create: {
      email: 'user_b@example.com',
      username: 'user_b',
      password_hash: password,
    },
  });
  console.log('Test users created.');

  // Wallets และยอดเงินเริ่มต้น 100,000 THB/USD ---
  // User A
  await prisma.wallet.upsert({
    where: { userId_assetId: { userId: userA.id, assetId: thb.id } },
    update: { balance: 100000 },
    create: { userId: userA.id, assetId: thb.id, balance: 100000 },
  });
  await prisma.wallet.upsert({
    where: { userId_assetId: { userId: userA.id, assetId: usd.id } },
    update: { balance: 100000 },
    create: { userId: userA.id, assetId: usd.id, balance: 100000 },
  });
  await prisma.wallet.upsert({
    where: { userId_assetId: { userId: userA.id, assetId: btc.id } },
    update: { balance: 1 },
    create: { userId: userA.id, assetId: btc.id, balance: 1 },
  }); // User A มี 1 BTC ไว้ขาย

  // User B
  await prisma.wallet.upsert({
    where: { userId_assetId: { userId: userB.id, assetId: thb.id } },
    update: { balance: 100000 },
    create: { userId: userB.id, assetId: thb.id, balance: 100000 },
  });
  await prisma.wallet.upsert({
    where: { userId_assetId: { userId: userB.id, assetId: usd.id } },
    update: { balance: 100000 },
    create: { userId: userB.id, assetId: usd.id, balance: 100000 },
  });
  await prisma.wallet.upsert({
    where: { userId_assetId: { userId: userB.id, assetId: eth.id } },
    update: { balance: 10 },
    create: { userId: userB.id, assetId: eth.id, balance: 10 },
  }); // User B มี 10 ETH ไว้ขาย

  console.log('Initial wallets and balances created.');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
