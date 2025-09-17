import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Service categories are stored as strings in the Professional model
  // We'll create some test data with category references
  console.log('📝 Service categories will be referenced as strings in professional profiles');

  // Create a test admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@masterful.ro' },
    update: {},
    create: {
      email: 'admin@masterful.ro',
      password: '$2a$12$YM/Q8mr0g.1mYKh2p.KlOetp.NDqJNFoah7K2bouiwjND7.0QRLA6', // password: admin123
      name: 'Admin Masterful',
      role: 'ADMIN',
      phone: '+40712345678',
      isActive: true,
      isVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`✅ Created/updated admin user: ${adminUser.email}`);

  // Create a test client user
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@test.ro' },
    update: {},
    create: {
      email: 'client@test.ro',
      password: '$2a$12$QHUr0UP9ESRA5bPvyz9IpeEQ5sQO4RsTx3RS16WXY3nb8NQmscobC', // password: client123
      name: 'Client Test',
      role: 'CLIENT',
      phone: '+40712345679',
      isActive: true,
      isVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`✅ Created/updated client user: ${clientUser.email}`);

  // Create a test professional user
  const professionalUser = await prisma.user.upsert({
    where: { email: 'professional@test.ro' },
    update: {},
    create: {
      email: 'professional@test.ro',
      password: '$2a$12$07CNspo6zuDy4BRFit6DGudJ3iX8V60Drq4O3ETQHAGEk/YF4R5ly', // password: professional123
      name: 'Professional Test',
      role: 'PROFESSIONAL',
      phone: '+40712345680',
      isActive: true,
      isVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`✅ Created/updated professional user: ${professionalUser.email}`);

  // Create professional profile
  const professionalProfile = await prisma.professional.upsert({
    where: { userId: professionalUser.id },
    update: {},
    create: {
      userId: professionalUser.id,
      categories: 'plumbing,electrical',
      hourlyRate: 50,
      bio: 'Profesionist cu experiență în instalații și electricitate',
      serviceAreas: 'București, Ilfov',
      isAvailable: true,
      rating: 4.8,
      reviewCount: 25,
      totalEarnings: 5000,
      experience: 5,
      portfolio: '',
      certifications: '',
      insurance: true,
    },
  });

  console.log(`✅ Created/updated professional profile: ${professionalProfile.id}`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
