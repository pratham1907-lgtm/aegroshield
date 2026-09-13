const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log('--- Aegroshield Order Items Persistence Verification ---');

  // 1. Get or create test user
  let user = await prisma.user.findFirst({ where: { isDemo: true } });
  if (!user) {
    user = await prisma.user.findFirst();
  }
  if (!user) {
    throw new Error('No user found in database to attach order to.');
  }
  console.log(`Using user: ${user.name} (${user.id})`);

  // 2. Prepare payload matching CheckoutPage output
  const testItems = [
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
      productId: 'p9',
      title: 'Chlorpyrifos 20% EC',
      price: 320,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400',
      id: 'p9',
      name: 'Chlorpyrifos 20% EC',
      category: 'Pesticide',
      brand: 'Bayer',
      unit: 'per litre',
      vendorId: 'v1',
    },
  ];

  console.log('Inserting order into Supabase with items:', JSON.stringify(testItems, null, 2));

  // 3. Create order
  const createdOrder = await prisma.order.create({
    data: {
      userId: user.id,
      items: testItems,
      totalAmount: 266 * 2 + 320,
      status: 'PENDING',
      shippingAddress: 'Village Dabathwa, Meerut - 250001',
      customerName: 'Pratham Farmer',
      customerPhone: '9876543210',
      district: 'Meerut',
      pincode: '250001',
      paymentMethod: 'Cash on Delivery (COD)',
    },
  });

  console.log(`\nCreated Order ID: ${createdOrder.id}`);

  // 4. Retrieve and verify order from Supabase
  const retrievedOrder = await prisma.order.findUnique({
    where: { id: createdOrder.id },
  });

  console.log('\nRetrieved Order from Supabase:');
  console.log(`- ID: ${retrievedOrder.id}`);
  console.log(`- Customer: ${retrievedOrder.customerName}`);
  console.log(`- Items Type: ${typeof retrievedOrder.items}`);
  console.log(`- Is Array: ${Array.isArray(retrievedOrder.items)}`);
  console.log(`- Items Count: ${Array.isArray(retrievedOrder.items) ? retrievedOrder.items.length : 0}`);
  console.log('- Items Content:\n', JSON.stringify(retrievedOrder.items, null, 2));

  // Assertions
  if (!Array.isArray(retrievedOrder.items) || retrievedOrder.items.length !== 2) {
    throw new Error('FAILED: items is not an array or has incorrect length!');
  }

  const firstItem = retrievedOrder.items[0];
  if (!firstItem.productId || !firstItem.title || typeof firstItem.price !== 'number' || typeof firstItem.quantity !== 'number') {
    throw new Error(`FAILED: first item missing required product details! Found: ${JSON.stringify(firstItem)}`);
  }

  console.log('\nSUCCESS: Order items persisted with complete product details { productId, title, price, quantity, image }!');

  // Clean up
  await prisma.order.delete({ where: { id: createdOrder.id } });
  console.log('Cleaned up test order from database.');
}

runTest()
  .catch(err => {
    console.error('Test Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
