import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('12345', 10);

  // 1. Crear usuario Admin demo
  const admin = await prisma.user.upsert({
    where: { email: 'adminprueba@demo.com' },
    update: {},
    create: {
      name: 'Admin prueba',
      email: 'adminprueba@demo.com',
      password: hashedPassword,
      role: Role.ADMIN,
      active: true,
    },
  });

  // 2. Crear usuario Estándar demo
  const user = await prisma.user.upsert({
    where: { email: 'userprueba@demo.com' },
    update: {},
    create: {
      name: 'Usuario prueba',
      email: 'userprueba@demo.com',
      password: hashedPassword,
      role: Role.USER,
      active: true,
    },
  });

  console.log('Base de datos inicializada correctamente.');
  console.log({ admin: admin.email, user: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });