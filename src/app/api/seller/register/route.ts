import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ownerName, phone, storeName, district, category } = body;

    if (!phone || !ownerName || !storeName) {
      return NextResponse.json(
        { success: false, error: 'Owner Name, Phone Number, and Store Name are required' },
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

    // 1. Upsert User by phone solely (no email required)
    const user = await prisma.user.upsert({
      where: { phone: cleanPhone },
      update: {
        name: ownerName.trim(),
        role: 'SELLER',
      },
      create: {
        phone: cleanPhone,
        name: ownerName.trim(),
        role: 'SELLER',
      },
    });

    // 2. Upsert Seller profile linked to user.id
    let seller = await prisma.seller.findFirst({
      where: { userId: user.id },
    });

    if (seller) {
      seller = await prisma.seller.update({
        where: { id: seller.id },
        data: {
          storeName: storeName.trim(),
          ownerName: ownerName.trim(),
          phone: cleanPhone,
          district: (district || 'Meerut').trim(),
          category: (category || 'General Agri-Store').trim(),
          isVerified: true,
        },
      });
    } else {
      seller = await prisma.seller.create({
        data: {
          userId: user.id,
          storeName: storeName.trim(),
          ownerName: ownerName.trim(),
          phone: cleanPhone,
          district: (district || 'Meerut').trim(),
          category: (category || 'General Agri-Store').trim(),
          isVerified: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Seller registered successfully',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
      seller: {
        id: seller.id,
        storeName: seller.storeName,
        ownerName: seller.ownerName,
        phone: seller.phone,
        district: seller.district,
        category: seller.category,
      },
    });
  } catch (error: any) {
    console.error('[API/Seller/Register] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to register seller' },
      { status: 500 }
    );
  }
}
