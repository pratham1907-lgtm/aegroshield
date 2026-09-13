import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone Number is required' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).replace(/\D/g, '').trim();
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    // Lookup user by phone
    const user = await prisma.user.findFirst({
      where: { phone: cleanPhone },
      include: {
        sellers: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No seller registered with this phone number. Please register your store first.',
        },
        { status: 404 }
      );
    }

    const seller = user.sellers[0] || null;

    return NextResponse.json({
      success: true,
      message: 'Seller logged in successfully',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
      seller: seller
        ? {
            id: seller.id,
            storeName: seller.storeName,
            ownerName: seller.ownerName,
            phone: seller.phone,
            district: seller.district,
            category: seller.category,
          }
        : null,
    });
  } catch (error: any) {
    console.error('[API/Seller/Login] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to login seller' },
      { status: 500 }
    );
  }
}
