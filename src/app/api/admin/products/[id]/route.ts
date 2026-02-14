import { createPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = (getRequestContext() as any);
    const prisma = createPrismaClient(env.DB);

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = (getRequestContext() as any);
    const prisma = createPrismaClient(env.DB);

    const { id } = await params;
    const body = await request.json() as any;
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        price: body.price,
        unit: body.unit || 'KG',
        category: body.category || 'klasik',
        image: body.image || null,
        isActive: body.isActive ?? true,
        order: body.order || 0,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { env } = (getRequestContext() as any);
    const prisma = createPrismaClient(env.DB);

    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
