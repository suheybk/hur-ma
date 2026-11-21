import { NextResponse } from 'next/server';
import { adminConfigured, isAdmin } from '@/lib/adminAuth';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { authenticated: await isAdmin(), configured: adminConfigured() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
