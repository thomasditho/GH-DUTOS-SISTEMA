import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  // Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@ghdutos.com.br' },
    update: {},
    create: {
      email: 'admin@ghdutos.com.br',
      name: 'Administrador GH',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  // Create Operator
  const operatorPassword = await bcrypt.hash('op123', 10);
  await prisma.user.upsert({
    where: { email: 'operador@ghdutos.com.br' },
    update: {},
    create: {
      email: 'operador@ghdutos.com.br',
      name: 'Operador Técnico',
      password: operatorPassword,
      role: 'OPERATOR'
    }
  });

  console.log('Seed completed: Admin and Operator created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
