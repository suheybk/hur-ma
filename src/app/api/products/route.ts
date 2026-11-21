import { createPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = (getRequestContext() as any);
    const prisma = createPrismaClient(env.DB);

    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// Ürün ekleme yalnız /api/admin/products üzerinden, giriş yapmış admin ile yapılır.
