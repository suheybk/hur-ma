import { NextResponse } from 'next/server';
import {
  adminConfigured,
  loginBlocked,
  loginFailed,
  loginSucceeded,
  setSessionCookie,
  verifyPassword,
} from '@/lib/adminAuth';

function istemciIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'yerel';
}

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: 'Admin girişi yapılandırılmamış (ADMIN_PASSWORD_HASH ve ADMIN_SESSION_SECRET gerekli).' },
      { status: 503 }
    );
  }
  const ip = istemciIp(request);
  if (loginBlocked(ip)) {
    return NextResponse.json({ error: 'Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin.' }, { status: 429 });
  }

  let password = '';
  try {
    const body = await request.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    /* geçersiz gövde */
  }

  if (!verifyPassword(password)) {
    loginFailed(ip);
    // tahmin hızını düşür
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: 'Yanlış şifre!' }, { status: 401 });
  }

  loginSucceeded(ip);
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res);
  return res;
}
