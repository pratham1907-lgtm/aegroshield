import { NextRequest, NextResponse } from 'next/server';
import { requireUser, handleAuthError } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user via verified Firebase ID Token
    const user = await requireUser(request);

    // 2. Verify that the user has an associated Seller record in Prisma
    const seller = user.sellers && user.sellers.length > 0 ? user.sellers[0] : null;

    if (!seller) {
      return NextResponse.json(
        {
          success: false,
          error: 'No registered seller store found for this account. Please register your store first.',
        },
        { status: 404 }
      );
    }

    // 3. Verify seller status (must be verified by admin)
    if (!seller.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: 'Your seller store account is pending verification. Please wait for admin approval.',
          status: 'PENDING_VERIFICATION',
          seller: {
            id: seller.id,
            storeName: seller.storeName,
            ownerName: seller.ownerName,
            isVerified: false,
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Seller logged in successfully',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
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
    });
  } catch (error: any) {
    console.error('[API/Seller/Login] Error:', error);
    return handleAuthError(error);
  }
}
