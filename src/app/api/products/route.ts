import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_PRODUCTS } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isDemo = searchParams.get('isDemo') === 'true';

  try {
    const items = await prisma.product.findMany({
      where: {
        isDemo,
      },
      include: {
        seller: {
          select: {
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

    if (isDemo) {
      return NextResponse.json({ success: true, data: MOCK_PRODUCTS, source: 'mock_fallback' });
    }

    return NextResponse.json({ success: true, data: [], source: 'postgres' });
  } catch (error) {
    console.warn('[API/Products] Database query failed, using fallback:', error);
    return NextResponse.json({
      success: true,
      data: isDemo ? MOCK_PRODUCTS : [],
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
      category,
      price,
      unit,
      stock,
      imageUrl,
      sellerId,
      firebaseUid,
    } = body;

    let targetSellerId = sellerId;

    if (!targetSellerId && firebaseUid) {
      try {
        const user = await prisma.user.findUnique({
          where: { firebaseUid },
          include: { sellers: true },
        });
        if (user && user.sellers.length > 0) {
          targetSellerId = user.sellers[0].id;
        }
      } catch (err) {
        console.warn('[API/Products] Could not find seller by firebaseUid:', err);
      }
    }

    if (!targetSellerId) {
      try {
        const demoSeller = await prisma.seller.findFirst({
          where: { isDemo: false },
        });
        if (demoSeller) targetSellerId = demoSeller.id;
      } catch (err) {
        console.warn('[API/Products] Default seller lookup skipped:', err);
      }
    }

    const created = await prisma.product.create({
      data: {
        sellerId: targetSellerId || 'demo-seller-id',
        name,
        category: category || 'General',
        price: Number(price) || 0,
        unit: unit || 'Unit',
        stock: Number(stock) || 0,
        imageUrl: imageUrl || null,
        isDemo: false,
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
