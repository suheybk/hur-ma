import { createPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  try {
    const { env } = (getRequestContext() as any);
    const prisma = createPrismaClient(env.DB);

    const products = await prisma.product.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const { env } = (getRequestContext() as any);
    const prisma = createPrismaClient(env.DB);

    const body = await request.json() as any;
    const product = await prisma.product.create({
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
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
