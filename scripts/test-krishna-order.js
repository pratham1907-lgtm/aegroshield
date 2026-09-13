const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testKrishnaOrder() {
  console.log('--- Testing Krishna Order Creation in Supabase ---');

  const customerName = 'krishna';
  const customerPhone = '9876543210';

  // 1. Resolve or create user record exactly as API route does
  let user = null;
  if (customerPhone) {
    user = await prisma.user.findFirst({ where: { phone: customerPhone } });
  }

  if (!user) {
    console.log(`User with phone ${customerPhone} not found. Creating user "${customerName}"...`);
    user = await prisma.user.create({
      data: {
        name: customerName,
        phone: customerPhone,
        role: 'FARMER',
      },
    });
    console.log(`Created new User record: ID = ${user.id}, Name = ${user.name}`);
  } else {
    console.log(`Found existing User record: ID = ${user.id}, Name = ${user.name}`);
  }

  // 2. Create Order in Supabase Order table
  const orderItems = [
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
  ];

  const totalAmount = 266 * 2;

  console.log('Inserting genuine order into Supabase Order table...');
  const createdOrder = await prisma.order.create({
    data: {
      userId: user.id,
      items: orderItems,
      totalAmount: totalAmount,
      status: 'PENDING',
      shippingAddress: 'Village Dabathwa, Post Sardhana, Meerut - 250341',
      customerName: customerName,
      customerPhone: customerPhone,
      district: 'Meerut',
      pincode: '250341',
      paymentMethod: 'Cash on Delivery (COD)',
    },
    include: {
      user: true,
    },
  });

  console.log('REAL_ORDER_CREATED:', createdOrder.id);

  // 3. Verify order in Supabase
  const allOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  console.log(`\nTotal Orders in Supabase Database: ${allOrders.length}`);
  allOrders.forEach((ord, i) => {
    console.log(`Order ${i + 1}: ID = ${ord.id}, Customer = ${ord.customerName}, Amount = ₹${ord.totalAmount}, User = ${ord.user?.name}`);
  });

  console.log('\n✅ Verification COMPLETE: Genuine order persists in Supabase!');
}

testKrishnaOrder()
  .catch(err => {
    console.error('ORDER_CREATE_ERROR:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
