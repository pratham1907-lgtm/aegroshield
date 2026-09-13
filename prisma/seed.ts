import { PrismaClient } from '@prisma/client';
import { MOCK_PRODUCTS, MOCK_MACHINERY, MOCK_LABOUR } from '../src/lib/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma isolated demo data seed...');

  // 1. Upsert Dedicated Demo User
  const demoUser = await prisma.user.upsert({
    where: { firebaseUid: 'demo-farmer-seller-uid' },
    update: {
      email: 'demo@aegroshield.com',
      name: 'Demo Account (Kisan Seva Kendra)',
      role: 'SELLER',
      isDemo: true,
    },
    create: {
      firebaseUid: 'demo-farmer-seller-uid',
      email: 'demo@aegroshield.com',
      name: 'Demo Account (Kisan Seva Kendra)',
      role: 'SELLER',
      isDemo: true,
    },
  });
  console.log('✅ Demo User upserted:', demoUser.id);

  // 2. Upsert Dedicated Demo Seller linked to demoUser.id
  let demoSeller = await prisma.seller.findFirst({
    where: { userId: demoUser.id },
  });

  if (!demoSeller) {
    demoSeller = await prisma.seller.create({
      data: {
        userId: demoUser.id,
        storeName: 'Kisan Seva Kendra (Demo)',
        ownerName: 'Ramesh Gupta',
        phone: '9876543210',
        licenseOrGstin: 'UP-AGR-2021-1421',
        district: 'Meerut',
        shopAddress: 'Near Main Bus Stand, Meerut Road',
        isVerified: true,
        isDemo: true,
      },
    });
  } else {
    demoSeller = await prisma.seller.update({
      where: { id: demoSeller.id },
      data: {
        isVerified: true,
        isDemo: true,
      },
    });
  }
  console.log('✅ Demo Seller ready:', demoSeller.id);

  // 3. Clear existing demo seed records to prevent duplicates
  await prisma.product.deleteMany({ where: { isDemo: true } });
  await prisma.machinery.deleteMany({ where: { isDemo: true } });
  await prisma.labourPost.deleteMany({ where: { isDemo: true } });
  console.log('🧹 Cleaned previous demo records.');

  // 4. Seed Products
  for (const p of MOCK_PRODUCTS) {
    await prisma.product.create({
      data: {
        sellerId: demoSeller.id,
        name: p.name,
        category: p.category,
        price: p.price,
        unit: p.unit,
        stock: p.stock === 'In Stock' ? 100 : p.stock === 'Low Stock' ? 15 : 0,
        imageUrl: p.imageUrl || null,
        isDemo: true,
      },
    });
  }
  console.log(`✅ Seeded ${MOCK_PRODUCTS.length} demo products.`);

  // 5. Seed Machinery
  for (const m of MOCK_MACHINERY) {
    await prisma.machinery.create({
      data: {
        ownerId: demoUser.id,
        title: m.model ? `${m.equipmentType} - ${m.model}` : m.equipmentType,
        machineType: m.equipmentType,
        ratePerHour: m.ratePerHour,
        district: m.district,
        contactPhone: m.contactPhone,
        available: m.available,
        isDemo: true,
      },
    });
  }
  console.log(`✅ Seeded ${MOCK_MACHINERY.length} demo machinery listings.`);

  // 6. Seed Labour Posts
  for (const l of MOCK_LABOUR) {
    await prisma.labourPost.create({
      data: {
        leaderId: demoUser.id,
        leaderName: l.teamLeaderName,
        groupSize: l.teamSize,
        primarySkill: l.specialization,
        wagePerDay: l.dailyRatePerWorker,
        district: l.district,
        phone: l.contactPhone,
        isDemo: true,
      },
    });
  }
  console.log(`✅ Seeded ${MOCK_LABOUR.length} demo labour posts.`);

  console.log('✨ Demo database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error executing Prisma seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
