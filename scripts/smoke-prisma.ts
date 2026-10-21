import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const u = await db.user.create({ data: { email: 'smoke@test', username: 'smoke', passwordHash: 'x', referralCode: 'SMOKE1' } });
console.log('created user:', u.id, 'balance:', u.balance);
await db.user.delete({ where: { id: u.id } });
await db.$disconnect();
console.log('SMOKE OK');
