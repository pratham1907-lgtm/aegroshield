const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Testing Supabase PostgreSQL Booking Table ===');

  try {
    // 1. Fetch first user and machinery
    const user = await prisma.user.findFirst();
    const machinery = await prisma.machinery.findFirst();

    console.log('1. Fetched user:', user ? { id: user.id, firebaseUid: user.firebaseUid, name: user.name } : 'None');
    console.log('2. Fetched machinery:', machinery ? { id: machinery.id, title: machinery.title } : 'None');

    if (!user) {
      console.error('No user found in database.');
      return;
    }

    // 2. Direct Prisma booking creation (defaulting bookingDate)
    const testPayload = {
      userId: user.id,
      bookingType: 'MACHINERY',
      targetId: machinery ? machinery.id : 'test-machinery-target',
      status: 'PENDING',
      totalAmount: 500,
    };
    console.log('3. Attempting prisma.booking.create with:', testPayload);
    const created = await prisma.booking.create({
      data: testPayload,
    });
    console.log('✅ Created booking row successfully! ID:', created.id);
    console.log('Row details:', created);

    // 3. Query the created booking from database
    const fetched = await prisma.booking.findUnique({
      where: { id: created.id },
      include: { user: true },
    });
    console.log('4. Verified from Supabase table:', {
      id: fetched.id,
      userId: fetched.userId,
      userName: fetched.user?.name,
      bookingType: fetched.bookingType,
      targetId: fetched.targetId,
      status: fetched.status,
      bookingDate: fetched.bookingDate,
      totalAmount: fetched.totalAmount,
    });

    console.log('=== All Booking Tests PASSED ===');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
