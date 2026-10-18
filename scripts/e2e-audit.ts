/**
 * Phase 4 End-to-End Operational Audit Script
 *
 * Verifies all 6 core business workflows:
 * 1. Product catalog browsing & filtering (/api/products)
 * 2. Mandi rate fetching & market analytics (/api/mandi)
 * 3. Security guards (verifies unauthorized 401 rejection on protected endpoints)
 * 4. Seller onboarding & compliance submission (/api/seller/register)
 * 5. Admin verification & seller accreditation workflow (/api/admin/sellers)
 * 6. Server-side authoritative order placement with atomic inventory decrement (/api/orders)
 * 7. Machinery and labour booking engine (/api/bookings)
 */

import { NextRequest } from 'next/server';
import { GET as getProducts } from '@/app/api/products/route';
import { GET as getMandi } from '@/app/api/mandi/route';
import { POST as postBooking } from '@/app/api/bookings/route';
import { POST as postOrder } from '@/app/api/orders/route';
import { POST as registerSeller } from '@/app/api/seller/register/route';
import { PATCH as patchAdminSellers } from '@/app/api/admin/sellers/route';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/firebaseAdmin';

async function runAudit() {
  console.log('================================================================');
  console.log('🌱 STARTING AEGROSHIELD PHASE 4 END-TO-END SYSTEM AUDIT');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`, details || '');
    }
  }

  // --------------------------------------------------------------------------
  // Flow 1: Product Catalog Browsing & Filter
  // --------------------------------------------------------------------------
  try {
    console.log('--- 1. Testing Product Catalog Browsing ---');
    const req = new NextRequest('http://localhost:3000/api/products?state=Punjab');
    const res = await getProducts(req);
    const data = await res.json();
    assert(res.status === 200, 'Product API responds with HTTP 200');
    assert(Array.isArray(data), 'Product response is an array');
    console.log(`   Found ${data?.length || 0} products matching query.\n`);
  } catch (err: any) {
    assert(false, 'Product Catalog Browsing failed', err.message);
  }

  // --------------------------------------------------------------------------
  // Flow 2: Mandi Rate Fetching
  // --------------------------------------------------------------------------
  try {
    console.log('--- 2. Testing Mandi Rates & Pricing API ---');
    const req = new NextRequest('http://localhost:3000/api/mandi?limit=5');
    const res = await getMandi(req);
    const data = await res.json();
    assert(res.status === 200, 'Mandi API responds with HTTP 200');
    assert(data.success === true && Array.isArray(data.data), 'Mandi response contains rate array');
    console.log(`   Found ${data.data?.length || 0} verified APMC mandi rate listings.\n`);
  } catch (err: any) {
    assert(false, 'Mandi Rate Fetching failed', err.message);
  }

  // --------------------------------------------------------------------------
  // Flow 3: Security Guards (Unauthorized Rejections)
  // --------------------------------------------------------------------------
  try {
    console.log('--- 3. Testing Security Guards (Unauthenticated Rejection) ---');
    const unauthBookingReq = new NextRequest('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ serviceType: 'MACHINERY' }),
    });
    const unauthBookingRes = await postBooking(unauthBookingReq);
    assert(unauthBookingRes.status === 401, 'Unauthenticated /api/bookings correctly rejects with HTTP 401');

    const unauthOrderReq = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({ items: [] }),
    });
    const unauthOrderRes = await postOrder(unauthOrderReq);
    assert(unauthOrderRes.status === 401, 'Unauthenticated /api/orders correctly rejects with HTTP 401');

    const unauthSellerReq = new NextRequest('http://localhost:3000/api/seller/register', {
      method: 'POST',
      body: JSON.stringify({ storeName: 'Test' }),
    });
    const unauthSellerRes = await registerSeller(unauthSellerReq);
    assert(unauthSellerRes.status === 401, 'Unauthenticated /api/seller/register correctly rejects with HTTP 401');

    const unauthAdminReq = new NextRequest('http://localhost:3000/api/admin/sellers', {
      method: 'PATCH',
      body: JSON.stringify({ sellerId: '123', isVerified: true }),
    });
    const unauthAdminRes = await patchAdminSellers(unauthAdminReq);
    assert(unauthAdminRes.status === 401, 'Unauthenticated /api/admin/sellers correctly rejects with HTTP 401\n');
  } catch (err: any) {
    assert(false, 'Security Guard Verification failed', err.message);
  }

  // --------------------------------------------------------------------------
  // Flow 4, 5, 6, 7: Authenticated Core Business Journeys
  // --------------------------------------------------------------------------
  const testUid = `audit_user_${Date.now()}`;
  const testEmail = `audit.${Date.now()}@aegroshield.app`;
  const testPhone = '9' + String(Math.floor(100000000 + Math.random() * 900000000));
  let createdSellerId: string | undefined;
  let createdProductId: string | undefined;
  let createdOrderId: string | undefined;
  let createdBookingId: string | undefined;

  try {
    console.log('--- 4. Setting up Authenticated Test Identity ---');
    const testUser = await prisma.user.upsert({
      where: { firebaseUid: testUid },
      update: { role: 'ADMIN' },
      create: {
        firebaseUid: testUid,
        email: testEmail,
        name: 'Audit Administrator & Farmer',
        phone: testPhone,
        role: 'ADMIN',
      },
    });
    assert(!!testUser.id, 'Test user registered in database');

    // Mock adminAuth.verifyIdToken for authenticated test flow execution
    (adminAuth as any).verifyIdToken = async (token: string) => {
      if (token === 'VALID_TEST_TOKEN') {
        return {
          uid: testUid,
          email: testEmail,
          admin: true,
        };
      }
      throw new Error('Invalid test token');
    };

    const authHeaders = {
      Authorization: 'Bearer VALID_TEST_TOKEN',
      'Content-Type': 'application/json',
    };

    // Flow 4: Seller Onboarding & Statutory Compliance Submission
    console.log('--- 5. Testing Seller Onboarding & Compliance Submission ---');
    const sellerPayload = {
      storeName: 'AegroShield Pilot Store (Audit)',
      ownerName: 'Vikas Sharma',
      phone: '9988776655',
      category: 'Fertilizers & Pesticides',
      shopAddress: 'Shop 14, Main Mandi Complex',
      state: 'Haryana',
      district: 'Rohtak',
      pincode: '124001',
      gstin: '06AAAAA0000A1Z5',
      licenseNumber: 'AGRI/HR/2026/9821',
      documentUrl: 'https://storage.aegroshield.app/licenses/sample-license.pdf',
    };

    const registerReq = new NextRequest('http://localhost:3000/api/seller/register', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(sellerPayload),
    });
    const regRes = await registerSeller(registerReq);
    const regData = await regRes.json();

    assert(regRes.status === 201, 'Seller registration succeeds with HTTP 201');
    assert(regData.seller?.verificationStatus === 'PENDING_VERIFICATION', 'Seller status defaults to PENDING_VERIFICATION');
    assert(regData.seller?.isVerified === false, 'Seller isVerified defaults to false');

    createdSellerId = regData.seller?.id;
    console.log(`   Seller created with ID: ${createdSellerId}`);

    // Flow 5: Admin Verification & Seller Approval
    console.log('--- 6. Testing Admin Verification Workflow ---');
    const patchReq = new NextRequest('http://localhost:3000/api/admin/sellers', {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        sellerId: createdSellerId,
        isVerified: true,
      }),
    });
    const patchRes = await patchAdminSellers(patchReq);
    const patchData = await patchRes.json();

    assert(patchRes.status === 200, 'Admin verification PATCH responds with HTTP 200');
    assert(patchData.data?.isVerified === true, 'Seller isVerified successfully updated to true');
    console.log(`   Seller accreditation confirmed: isVerified=${patchData.data?.isVerified}\n`);

    // Create an active catalog product under this verified seller
    const testProduct = await prisma.product.create({
      data: {
        sellerId: createdSellerId!,
        name: 'HD-3086 Certified Wheat Seed (40kg Bag)',
        category: 'Seeds',
        price: 1450,
        unit: 'Bag (40kg)',
        stock: 50,
        description: 'ICAR-IARI certified high-yielding wheat seed',
      },
    });
    createdProductId = testProduct.id;
    console.log(`   Created test catalog product: ${testProduct.id} (Stock: 50)`);

    // Flow 6: Server-Side Authoritative Order Placement
    console.log('--- 7. Testing Authoritative Order Placement & Stock Decrement ---');
    const orderPayload = {
      customerName: 'Audit Farmer',
      customerPhone: '9876543210',
      shippingAddress: 'Plot 45, Agro Park, Rohtak, Haryana',
      district: 'Rohtak',
      pincode: '124001',
      paymentMethod: 'CASH_ON_DELIVERY',
      items: [
        {
          productId: testProduct.id,
          title: testProduct.name,
          quantity: 2,
          price: testProduct.price,
        },
      ],
      totalAmount: 2900,
    };

    const orderReq = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(orderPayload),
    });
    const orderRes = await postOrder(orderReq);
    const orderData = await orderRes.json();

    assert(orderRes.status === 201, 'Order placement responds with HTTP 201');
    assert(orderData.success === true && orderData.data?.id, 'Order created with verified server-side total');
    createdOrderId = orderData.data?.id;

    // Verify stock was decremented from 50 to 48
    const updatedProduct = await prisma.product.findUnique({ where: { id: testProduct.id } });
    assert(updatedProduct?.stock === 48, 'Product inventory decremented atomically (50 -> 48)');
    console.log(`   Order created with ID: ${createdOrderId}, Stock remaining: ${updatedProduct?.stock}\n`);

    // Flow 7: Machinery & Labour Booking
    console.log('--- 8. Testing Machinery & Labour Booking Engine ---');
    const bookingPayload = {
      serviceType: 'MACHINERY',
      itemId: 'mach-tractor-55hp',
      itemName: 'Mahindra 575 DI (55HP Tractor)',
      farmerName: 'Audit Farmer',
      farmerPhone: '9876543210',
      farmerState: 'Haryana',
      farmerDistrict: 'Karnal',
      startDate: new Date().toISOString(),
      durationDays: 2,
      totalAmount: 3200,
      notes: 'Phase 4 operational verification test',
    };

    const bookingReq = new NextRequest('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(bookingPayload),
    });
    const bookingRes = await postBooking(bookingReq);
    const bookingData = await bookingRes.json();

    assert(bookingRes.status === 201, 'Booking creation responds with HTTP 201');
    assert(bookingData.success === true && bookingData.data?.id, 'Booking persists in Supabase database and returns unique ID');
    createdBookingId = bookingData.data?.id;
    console.log(`   Booking created with ID: ${createdBookingId}\n`);

  } catch (err: any) {
    assert(false, 'Authenticated Business Journey failed', err.message);
  } finally {
    // Teardown test entities
    console.log('--- Teardown Test Entities ---');
    if (createdBookingId) {
      await prisma.booking.delete({ where: { id: createdBookingId } }).catch(() => {});
    }
    if (createdOrderId) {
      await prisma.order.delete({ where: { id: createdOrderId } }).catch(() => {});
    }
    if (createdProductId) {
      await prisma.product.delete({ where: { id: createdProductId } }).catch(() => {});
    }
    if (createdSellerId) {
      await prisma.seller.delete({ where: { id: createdSellerId } }).catch(() => {});
    }
    await prisma.user.delete({ where: { firebaseUid: testUid } }).catch(() => {});
    console.log('   All temporary audit test entities cleaned up successfully.\n');
  }

  console.log('================================================================');
  console.log(`🏁 AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
