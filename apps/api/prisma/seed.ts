import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@boim.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'test@boim.com',
      name: '테스트유저',
      password: hashedPassword,
      provider: 'local',
      isPassVerified: true,
      passCi: 'mock_ci_' + Date.now(),
    },
  });
  
  console.log('테스트 계정 생성 완료:', { email: user.email, password: 'password123' });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
