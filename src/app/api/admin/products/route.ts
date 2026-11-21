import { createPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { requireAdmin } from '@/lib/adminAuth';
import { urunVerisi } from '@/lib/productValidation';

export const runtime = 'edge';

export async function GET() {
  const yetkisiz = await requireAdmin();
  if (yetkisiz) return yetkisiz;
  try {
    const { env } = (getRequestContext() as any);
    const prisma = createPrismaClient(env.DB);

    const products = await prisma.product.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Ürünler alınamadı (veritabanı)' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const yetkisiz = await requireAdmin();
  if (yetkisiz) return yetkisiz;
  try {
    const v = urunVerisi(await request.json().catch(() => null));
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

    const { env } = (getRequestContext() as any);
    const prisma = createPrismaClient(env.DB);
    const product = await prisma.product.create({ data: v.data });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
