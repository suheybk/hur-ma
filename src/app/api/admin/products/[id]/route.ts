import { createPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { requireAdmin } from '@/lib/adminAuth';
import { urunVerisi } from '@/lib/productValidation';

export const runtime = 'edge';

type Baglam = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Baglam) {
  const yetkisiz = await requireAdmin();
  if (yetkisiz) return yetkisiz;
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

export async function PUT(request: Request, { params }: Baglam) {
  const yetkisiz = await requireAdmin();
  if (yetkisiz) return yetkisiz;
  try {
    const v = urunVerisi(await request.json().catch(() => null));
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

    const { env } = (getRequestContext() as any);
    const prisma = createPrismaClient(env.DB);

    const { id } = await params;
    const product = await prisma.product.update({ where: { id }, data: v.data });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Baglam) {
  const yetkisiz = await requireAdmin();
  if (yetkisiz) return yetkisiz;
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
