import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId');
  const phone = searchParams.get('phone');
  const firebaseUid = searchParams.get('firebaseUid');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    const whereClause: any = {};

    if (sellerId) {
      whereClause.sellerId = sellerId;
    } else if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '').trim();
      const user = await prisma.user.findFirst({
        where: { phone: cleanPhone },
        include: { sellers: true },
      });
      if (user && user.sellers.length > 0) {
        whereClause.sellerId = user.sellers[0].id;
      }
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

    const products = await prisma.product.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        seller: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log("FARMER_STORE_ACTIVE_PRODUCTS:", products.length);

    return NextResponse.json(products);
  } catch (error: any) {
    console.warn('[API/Products] Database query failed:', error);
    return NextResponse.json([]);
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
    } = body;

    const productName = (name || title || '').trim();
    if (!productName) {
      return NextResponse.json(
        { success: false, error: 'Product name/title is required' },
        { status: 400 }
      );
    }

    const headerAuth = request.headers.get('authorization') || '';
    const bearerToken = headerAuth.startsWith('Bearer ') ? headerAuth.slice(7).trim() : null;
    const headerFirebaseUid = request.headers.get('x-firebase-uid');
    const headerEmail = request.headers.get('x-user-email');
    const headerNameRaw = request.headers.get('x-user-name');
    const headerName = headerNameRaw ? decodeURIComponent(headerNameRaw) : null;
    const headerPhone = request.headers.get('x-user-phone');

    const uid = headerFirebaseUid || bearerToken || body.firebaseUid || body.userId;
    const email = headerEmail || body.email || null;
    const userName = headerName || body.userName || body.name || 'Store Owner';
    const userPhone = headerPhone || body.phone || body.sellerPhone || null;
    const cleanPhone = userPhone ? String(userPhone).replace(/\D/g, '').trim() : null;

    let sellerId = body.sellerId;

    // 1. If explicit sellerId provided, check if it exists in Prisma Seller table
    if (sellerId) {
      const existingSeller = await prisma.seller.findUnique({ where: { id: sellerId } });
      if (!existingSeller) {
        sellerId = null;
      }
    }

    // 2. Resolve by clean phone number
    if (!sellerId && cleanPhone && cleanPhone.length >= 10) {
      const userByPhone = await prisma.user.findFirst({
        where: { phone: cleanPhone },
        include: { sellers: true },
      });
      if (userByPhone?.sellers?.length) {
        sellerId = userByPhone.sellers[0].id;
        if (uid && !userByPhone.firebaseUid) {
          await prisma.user.update({
            where: { id: userByPhone.id },
            data: { firebaseUid: uid },
          }).catch(() => {});
        }
      }
    }

    // 3. Resolve by firebaseUid
    if (!sellerId && uid) {
      const userByUid = await prisma.user.findUnique({
        where: { firebaseUid: uid },
        include: { sellers: true },
      });
      if (userByUid?.sellers?.length) {
        sellerId = userByUid.sellers[0].id;
      } else if (userByUid) {
        const storeName = body.storeName || (userByUid.name ? `${userByUid.name}'s Farm Store` : 'Pratham Agro shop');
        const newSeller = await prisma.seller.create({
          data: {
            userId: userByUid.id,
            storeName: storeName,
            ownerName: userByUid.name || 'Store Owner',
            phone: userByUid.phone || cleanPhone || '9876543210',
            district: body.district || 'Meerut',
            category: category || 'General',
            isVerified: true,
            isDemo: false,
          },
        });
        sellerId = newSeller.id;
      }
    }

    // 4. Fallback: Any active seller in database
    if (!sellerId) {
      const anySeller = await prisma.seller.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      if (anySeller) {
        sellerId = anySeller.id;
      }
    }

    // 5. If 0 sellers exist in DB, create primary seller so creation succeeds without foreign key failure
    if (!sellerId) {
      const newUser = await prisma.user.create({
        data: {
          firebaseUid: uid || undefined,
          email: email || undefined,
          name: userName || 'Pratham Agro',
          phone: cleanPhone && cleanPhone.length >= 10 ? cleanPhone : '9876543210',
          role: 'SELLER',
          isDemo: false,
        },
      });
      const newSeller = await prisma.seller.create({
        data: {
          userId: newUser.id,
          storeName: body.storeName || 'Pratham Agro shop',
          ownerName: newUser.name || 'Pratham',
          phone: newUser.phone || '9876543210',
          district: body.district || 'Meerut',
          category: category || 'General',
          isVerified: true,
          isDemo: false,
        },
      });
      sellerId = newSeller.id;
    }

    const newProduct = await prisma.product.create({
      data: {
        name: productName,
        category: category || 'General',
        price: parseFloat(body.price),
        unit: body.unit || 'per unit',
        stock: parseInt(body.stock) || 10,
        sellerId: sellerId,
        imageUrl: imageUrl || null,
        description: description || null,
        isDemo: false,
      },
      include: {
        seller: true,
      },
    });

    console.log("SELLER_PRODUCT_CREATED_IN_DB:", newProduct.name, "ID:", newProduct.id, "SELLER_ID:", sellerId);

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error('[API/Products] Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to add product' },
      { status: 500 }
    );
  }
}
