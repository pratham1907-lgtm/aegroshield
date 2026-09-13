const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBookingFlow() {
  console.log('=== Verifying End-to-End Booking Logic ===');

  try {
    // 1. Verify user resolution with firebaseUid 'demo-farmer-seller-uid'
    const demoUser = await prisma.user.findUnique({
      where: { firebaseUid: 'demo-farmer-seller-uid' },
    });
    console.log('1. Demo user in PostgreSQL:', demoUser ? { id: demoUser.id, name: demoUser.name } : 'NOT FOUND');

    if (!demoUser) {
      console.error('Demo user missing! Seeding user...');
      await prisma.user.create({
        data: {
          firebaseUid: 'demo-farmer-seller-uid',
          email: 'demo@aegroshield.com',
          name: 'Demo Account (Kisan Seva Kendra)',
          role: 'FARMER',
          isDemo: true,
        },
      });
    }

    // 2. Simulate what /api/bookings POST receives from frontend
    const machinery = await prisma.machinery.findFirst();
    const payload = {
      bookingType: 'MACHINERY',
      targetId: machinery ? machinery.id : 'mach-sample-101',
      totalAmount: 1200,
      status: 'PENDING',
      bookingDate: new Date(),
      userId: demoUser.id,
    };

    console.log('2. Inserting booking with payload:', payload);
    const booking = await prisma.booking.create({
      data: payload,
      include: { user: true },
    });
    console.log('✅ Booking successfully created in Supabase! ID:', booking.id);
    console.log('   Linked User:', booking.user.name);
    console.log('   Status:', booking.status);
    console.log('   Total Amount:', booking.totalAmount);
    console.log('   Booking Date:', booking.bookingDate);

    // 3. Simulate GET /api/bookings?firebaseUid=demo-farmer-seller-uid
    const retrieved = await prisma.booking.findMany({
      where: { userId: demoUser.id },
      orderBy: { createdAt: 'desc' },
    });
    console.log(`3. Retrieved ${retrieved.length} bookings for demo user from Supabase!`);
    console.log('   Latest booking:', {
      id: retrieved[0].id,
      bookingType: retrieved[0].bookingType,
      targetId: retrieved[0].targetId,
      status: retrieved[0].status,
    });

    console.log('=== All Booking Database Tests PASSED Successfully! ===');
  } catch (err) {
    console.error('❌ Error during booking verification:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testBookingFlow();
