// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear Super Admin inicial
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin1234!', 12);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@gimnasio.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
      }
    });

    console.log('✅ Super Admin creado:');
    console.log(`   Email: admin@gimnasio.com`);
    console.log(`   Password: Admin1234!`);
    console.log(`   ID: ${admin.id}`);
  } else {
    console.log('⚠️  Super Admin ya existe, omitiendo...');
  }

  // Crear planes de ejemplo
  const plansCount = await prisma.plan.count();

  if (plansCount === 0) {
    await prisma.plan.createMany({
      data: [
        {
          name: '3 Días por Semana',
          description: 'Acceso al gimnasio 3 días a la semana',
          price: 30000,
          durationDays: 30,
        },
        {
          name: 'Pase Libre',
          description: 'Acceso ilimitado al gimnasio',
          price: 35000,
          durationDays: 30,
        },
        {
          name: 'Entrenamiento Personalizado',
          description: 'Acceso ilimitado con entrenador personal asignado',
          price: 40000,
          durationDays: 30,
        },
      ]
    });

    console.log('✅ Planes de ejemplo creados');
  }

  console.log('🎉 Seed completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
