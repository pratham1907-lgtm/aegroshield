import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';
import { updateProductSchema, formatZodError } from '@/lib/validations';

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
    console.error('[API/Products/[id]] GET error:', error?.message || error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product details. Internal server error.' },
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

    let body;
    try {
      body = await request.json();
    } catch {
      throw new HttpError('Invalid JSON request body', 400);
    }

    const validation = updateProductSchema.safeParse(body);
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

    const { name, category, price, unit, stock, description, imageUrl } = validation.data;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (unit !== undefined) updateData.unit = unit;
    if (stock !== undefined) updateData.stock = stock;
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

