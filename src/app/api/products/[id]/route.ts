import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
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
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error('[API/Products/[id]] GET error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(request);
    const seller = user.sellers?.[0];
    if (!seller) {
      throw new HttpError('Forbidden: Must have a seller profile to modify products.', 403);
    }

    const { id } = await params;
    if (!id) {
      throw new HttpError('Product ID is required', 400);
    }

    const existing = await prisma.product.findFirst({
      where: { id, sellerId: seller.id },
    });

    if (!existing) {
      throw new HttpError('Product not found or you do not have permission to edit it.', 404);
    }

    const body = await request.json();
    const { name, title, category, price, unit, stock, description, imageUrl } = body;

    const updateData: any = {};
    if (name !== undefined || title !== undefined) updateData.name = name || title;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = Number(price);
    if (unit !== undefined) updateData.unit = unit;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: updateData,
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

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[API/Products/[id]] PUT error:', error);
    return handleAuthError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(request);
    const seller = user.sellers?.[0];
    if (!seller) {
      throw new HttpError('Forbidden: Must have a seller profile to delete products.', 403);
    }

    const { id } = await params;
    if (!id) {
      throw new HttpError('Product ID is required', 400);
    }

    const existing = await prisma.product.findFirst({
      where: { id, sellerId: seller.id },
    });

    if (!existing) {
      throw new HttpError('Product not found or you do not have permission to delete it.', 404);
    }

    await prisma.product.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('[API/Products/[id]] DELETE error:', error);
    return handleAuthError(error);
  }
}

