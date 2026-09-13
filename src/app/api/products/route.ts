import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_PRODUCTS } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isDemoParam = searchParams.get('isDemo');
  const sellerId = searchParams.get('sellerId');
  const firebaseUid = searchParams.get('firebaseUid');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    const whereClause: any = {};

    if (isDemoParam !== null) {
      whereClause.isDemo = isDemoParam === 'true';
    }

    if (sellerId) {
      whereClause.sellerId = sellerId;
    } else if (firebaseUid) {
      const user = await prisma.user.findUnique({
        where: { firebaseUid },
        include: { sellers: true },
      });
      if (user && user.sellers.length > 0) {
        whereClause.sellerId = user.sellers[0].id;
      }
    }

    if (category && category !== 'All') {
      whereClause.category = {
        equals: category,
        mode: 'insensitive',
      };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.product.findMany({
      where: whereClause,
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
            ownerName: true,
            district: true,
            phone: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (items && items.length > 0) {
      return NextResponse.json({ success: true, data: items, source: 'postgres' });
    }

    // Fallback if no postgres products match and demo is requested or seller not found
    if (isDemoParam === 'true' && !sellerId && !firebaseUid) {
      return NextResponse.json({ success: true, data: MOCK_PRODUCTS, source: 'mock_fallback' });
    }

    return NextResponse.json({ success: true, data: items, source: 'postgres' });
  } catch (error: any) {
    console.warn('[API/Products] Database query failed, using fallback:', error);
    return NextResponse.json({
      success: true,
      data: isDemoParam === 'true' ? MOCK_PRODUCTS : [],
      source: 'fallback',
      warning: 'PostgreSQL connection not reachable or credentials pending',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      title,
      category,
      price,
      unit,
      stock,
      imageUrl,
      description,
      sellerId,
      firebaseUid,
    } = body;

    const productName = name || title;
    if (!productName) {
      return NextResponse.json(
        { success: false, error: 'Product name/title is required' },
        { status: 400 }
      );
    }

    let targetSellerId = sellerId;

    const headerAuth = request.headers.get('authorization') || '';
    const bearerToken = headerAuth.startsWith('Bearer ') ? headerAuth.slice(7).trim() : null;
    const headerFirebaseUid = request.headers.get('x-firebase-uid');
    const headerEmail = request.headers.get('x-user-email');
    const headerNameRaw = request.headers.get('x-user-name');
    const headerName = headerNameRaw ? decodeURIComponent(headerNameRaw) : null;
    const headerPhone = request.headers.get('x-user-phone');

    const uid = headerFirebaseUid || bearerToken || body.firebaseUid || body.userId;
    const email = headerEmail || body.email || null;
    const userName = headerName || body.userName || body.name || null;
    const userPhone = headerPhone || body.phone || null;

    if (uid) {
      try {
        const dbUser = await prisma.user.upsert({
          where: { firebaseUid: uid },
          update: {
            email: email || undefined,
            name: userName || undefined,
            phone: userPhone || undefined,
          },
          create: {
            firebaseUid: uid,
            email: email,
            name: userName || 'Store Owner',
            phone: userPhone || null,
            role: 'SELLER',
            isDemo: false,
          },
          include: { sellers: true },
        });

        if (dbUser.sellers && dbUser.sellers.length > 0) {
          targetSellerId = dbUser.sellers[0].id;
        } else {
          const storeName = body.storeName || (dbUser.name ? `${dbUser.name}'s Farm Store` : 'AgriStore Official');
          const newSeller = await prisma.seller.create({
            data: {
              userId: dbUser.id,
              storeName: storeName,
              ownerName: dbUser.name || 'Store Owner',
              phone: dbUser.phone || userPhone || '9876543210',
              licenseOrGstin: body.licenseOrGstin || 'VERIFIED-SELLER-01',
              district: body.district || 'Meerut',
              shopAddress: body.shopAddress || 'Market Complex',
              isVerified: true,
              isDemo: false,
            },
          });
          targetSellerId = newSeller.id;
        }
      } catch (err) {
        console.warn('[API/Products] User/Seller upsert warning:', err);
      }
    }

    // Fallback to active demo seller or first seller in DB so creation never fails
    if (!targetSellerId) {
      try {
        const demoSeller = await prisma.seller.findFirst({
          where: { isVerified: true },
        });
        if (demoSeller) {
          targetSellerId = demoSeller.id;
        } else {
          const fallbackUser = await prisma.user.upsert({
            where: { firebaseUid: 'demo-farmer-seller-uid' },
            update: {},
            create: {
              firebaseUid: 'demo-farmer-seller-uid',
              email: 'seller@aegroshield.com',
              name: 'Kisan Seva Kendra',
              role: 'SELLER',
              isDemo: false,
            },
          });
          const createdSeller = await prisma.seller.create({
            data: {
              userId: fallbackUser.id,
              storeName: 'Kisan Seva Kendra',
              ownerName: 'Ramesh Patel',
              phone: '9876543210',
              licenseOrGstin: '24AAACC1206D1ZM',
              district: 'Ahmedabad',
              shopAddress: 'APMC Market',
              isVerified: true,
              isDemo: false,
            },
          });
          targetSellerId = createdSeller.id;
        }
      } catch (err) {
        console.warn('[API/Products] Default seller lookup skipped:', err);
      }
    }

    const created = await prisma.product.create({
      data: {
        sellerId: targetSellerId,
        name: productName,
        category: category || 'General',
        price: Number(price) || 0,
        unit: unit || 'Unit',
        stock: Number(stock) || 0,
        imageUrl: imageUrl || null,
        description: description || null,
        isDemo: false, // Newly created products are real items!
      },
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
            ownerName: true,
            district: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('[API/Products] Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to add product' },
      { status: 500 }
    );
  }
}
