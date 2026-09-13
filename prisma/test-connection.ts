import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Supabase PostgreSQL Live Connection Verification ---');
  const userCount = await prisma.user.count();
  const sellerCount = await prisma.seller.count();
  const productCount = await prisma.product.count();
  const machineryCount = await prisma.machinery.count();
  const labourCount = await prisma.labourPost.count();
  const bookingCount = await prisma.booking.count();

  console.log('Model Counts in Supabase Database:');
  console.log({
    Users: userCount,
    Sellers: sellerCount,
    Products: productCount,
    Machinery: machineryCount,
    LabourPosts: labourCount,
    Bookings: bookingCount,
  });

  const demoUser = await prisma.user.findFirst({
    where: { isDemo: true },
    include: {
      sellers: true,
      machineries: true,
      labourPosts: true,
    },
  });

  console.log('Demo User Record:', {
    id: demoUser?.id,
    name: demoUser?.name,
    email: demoUser?.email,
    firebaseUid: demoUser?.firebaseUid,
    isDemo: demoUser?.isDemo,
    sellerStores: demoUser?.sellers.map(s => s.storeName),
    machineryCount: demoUser?.machineries.length,
    labourPostCount: demoUser?.labourPosts.length,
  });
}

main()
  .catch((err) => {
    console.error('Connection failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
