import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';

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

    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        include: {
          seller: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (dbErr: any) {
      console.warn('[API/Products] Initial query encountered error, retrying in 600ms:', dbErr?.message);
      await new Promise(r => setTimeout(r, 600));
      products = await prisma.product.findMany({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        include: {
          seller: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    console.log("FARMER_STORE_ACTIVE_PRODUCTS:", products.length);

    return NextResponse.json(products);
  } catch (error: any) {
    console.warn('[API/Products] Database query failed after retry:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const seller = user.sellers?.[0];
    if (!seller) {
      throw new HttpError('Forbidden: No seller account found for this user. Please register as a seller first.', 403);
    }

    if (!seller.isVerified) {
      throw new HttpError('Forbidden: Seller account is pending verification. Only verified sellers can list products.', 403);
    }

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
      throw new HttpError('Product name/title is required', 400);
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      throw new HttpError('Valid product price is required', 400);
    }

    const newProduct = await prisma.product.create({
      data: {
        name: productName,
        category: category || 'General',
        price: parseFloat(price),
        unit: unit || 'per unit',
        stock: parseInt(stock) || 0,
        sellerId: seller.id,
        imageUrl: imageUrl || null,
        description: description || null,
        isDemo: false,
      },
      include: {
        seller: true,
      },
    });

    console.log("SELLER_PRODUCT_CREATED_IN_DB:", newProduct.name, "ID:", newProduct.id, "SELLER_ID:", seller.id);

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error('[API/Products] Error creating product:', error);
    return handleAuthError(error);
  }
}

