import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';
import { registerSellerSchema, formatZodError } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user via verified Firebase ID Token
    const user = await requireUser(request);

    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      throw new HttpError('Invalid JSON request body', 400);
    }

    const validation = registerSellerSchema.safeParse(rawBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: formatZodError(validation.error),
          details: validation.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { ownerName, phone, storeName, district, category, shopAddress, licenseOrGstin } = validation.data;
    const cleanPhone = phone;

    // 2. Update user role to SELLER and update contact name/phone
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: ownerName.trim() || user.name,
        role: 'SELLER',
        ...(cleanPhone && !user.phone ? { phone: cleanPhone } : {}),
      },
    });

    // 3. Upsert Seller profile associated directly with user.id
    // Security: set isVerified to false so it requires admin approval
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
          isVerified: false, // Pending verification
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
          isVerified: false, // Pending verification
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Seller registered successfully and submitted for verification.',
        status: 'PENDING_VERIFICATION',
        user: {
          id: user.id,
          phone: cleanPhone || user.phone,
          name: ownerName.trim(),
          role: 'SELLER',
          firebaseUid: user.firebaseUid,
        },
        seller: {
          id: seller.id,
          storeName: seller.storeName,
          ownerName: seller.ownerName,
          phone: seller.phone,
          district: seller.district,
          category: seller.category,
          isVerified: seller.isVerified,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API/Seller/Register] Error:', error);
    return handleAuthError(error);
  }
}
