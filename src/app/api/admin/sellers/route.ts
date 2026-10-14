import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError, HttpError } from '@/lib/auth';

/**
 * GET /api/admin/sellers
 * Admin only: Fetch all registered sellers for review & accreditation.
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const sellers = await prisma.seller.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        products: {
          select: { id: true, name: true, price: true, stock: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: sellers,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (error: any) {
    console.error('[API/Admin/Sellers] GET error:', error);
    return handleAuthError(error);
  }
}

/**
 * PATCH /api/admin/sellers
 * Admin only: Approve (isVerified: true) or revoke (isVerified: false) a seller.
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const body = await request.json();
    const { sellerId, isVerified } = body;

    if (!sellerId || typeof sellerId !== 'string') {
      throw new HttpError('sellerId is required', 400);
    }

    if (typeof isVerified !== 'boolean') {
      throw new HttpError('isVerified boolean flag is required', 400);
    }

    const updatedSeller = await prisma.seller.update({
      where: { id: sellerId },
      data: { isVerified },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    console.log(`ADMIN_SELLER_ACCREDITATION_UPDATED: sellerId=${sellerId}, isVerified=${isVerified} by admin ${admin.email || admin.id}`);

    return NextResponse.json({
      success: true,
      data: updatedSeller,
      message: `Seller accreditation status updated to ${isVerified ? 'VERIFIED' : 'UNVERIFIED'}.`,
    });
  } catch (error: any) {
    console.error('[API/Admin/Sellers] PATCH error:', error);
    return handleAuthError(error);
  }
}
