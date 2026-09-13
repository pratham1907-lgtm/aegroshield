const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runEndToEndTest() {
  console.log('=== REAL FRONTEND CHECKOUT FLOW TEST ===');

  // Scenario 1: Guest Farmer (No login, userId: null, firebaseUid: null)
  console.log('\n--- Test 1: Guest Farmer Checkout ---');
  const guestPayload = {
    customerName: 'Shyam Singh',
    customerPhone: '9897123456',
    shippingAddress: 'Village Dabathwa, Post Sardhana',
    district: 'Meerut',
    pincode: '250341',
    paymentMethod: 'Cash on Delivery (COD)',
    items: [
      {
        productId: 'p1',
        title: 'Urea (46% N) - 45kg',
        price: 266,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400',
        id: 'p1',
        name: 'Urea (46% N)',
        category: 'Fertilizer',
        brand: 'IFFCO',
        unit: 'per 45kg bag',
        vendorId: 'v1',
      },
      {
        productId: 'p2',
        title: 'DAP (Di-Ammonium Phosphate)',
        price: 1350,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400',
        id: 'p2',
        name: 'DAP (Di-Ammonium Phosphate)',
        category: 'Fertilizer',
        brand: 'IFFCO',
        unit: 'per 50kg bag',
        vendorId: 'v2',
      },
    ],
    totalAmount: 266 * 2 + 1350,
    userId: null,
    firebaseUid: null,
  };

  console.log('Sending POST to http://localhost:3000/api/orders...');
  const res = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(guestPayload),
  });

  console.log(`HTTP Status: ${res.status} ${res.statusText}`);
  const json = await res.json();
  console.log('Server Response:', JSON.stringify(json, null, 2));

  if (res.status !== 201 || !json.success) {
    throw new Error(`Guest checkout failed: ${json.error || res.statusText}`);
  }

  const createdOrderId = json.data.id;
  console.log(`Order created with ID: ${createdOrderId}`);

  // Query Supabase directly with Prisma to verify actual database state
  const dbOrder = await prisma.order.findUnique({
    where: { id: createdOrderId },
    include: { user: true },
  });

  if (!dbOrder) {
    throw new Error('FAILED: Order was NOT found in Supabase database!');
  }

  console.log('\nVerified Supabase Database Record:');
  console.log(`- Order ID: ${dbOrder.id}`);
  console.log(`- User ID: ${dbOrder.userId}`);
  console.log(`- User Name: ${dbOrder.user?.name}`);
  console.log(`- Customer: ${dbOrder.customerName} (${dbOrder.customerPhone})`);
  console.log(`- Address: ${dbOrder.shippingAddress}`);
  console.log(`- Payment: ${dbOrder.paymentMethod}`);
  console.log(`- Total Amount: ₹${dbOrder.totalAmount}`);
  console.log(`- Items Count: ${Array.isArray(dbOrder.items) ? dbOrder.items.length : 0}`);
  console.log('- Items JSON:', JSON.stringify(dbOrder.items, null, 2));

  // Verify item properties
  const items = dbOrder.items;
  if (!Array.isArray(items) || items.length !== 2) {
    throw new Error('FAILED: Items is not an array of 2 elements!');
  }
  if (!items[0].productId || !items[0].title || !items[0].image) {
    throw new Error('FAILED: Item 0 missing productId, title, or image!');
  }

  console.log('\n✅ Test 1 PASSED: Guest Farmer Checkout works end-to-end and creates genuine Supabase record!');

  // Scenario 2: Error handling verification
  console.log('\n--- Test 2: Error Handling (Missing required details) ---');
  const invalidPayload = {
    customerName: '',
    customerPhone: '',
    shippingAddress: '',
    items: [],
  };

  const errRes = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invalidPayload),
  });

  const errJson = await errRes.json();
  console.log(`HTTP Status: ${errRes.status} (Expected 400)`);
  console.log('Error message returned:', errJson.error);

  if (errRes.status !== 400 || errJson.success !== false) {
    throw new Error('FAILED: Expected status 400 with success: false');
  }

  console.log('✅ Test 2 PASSED: Proper status 400 and error message returned!');

  // Cleanup test order
  await prisma.order.delete({ where: { id: createdOrderId } });
  console.log('\nCleaned up test order from Supabase.');
  console.log('\n=== ALL END-TO-END CHECKOUT TESTS PASSED SUCCESSFULLY! ===');
}

runEndToEndTest()
  .catch(err => {
    console.error('Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
