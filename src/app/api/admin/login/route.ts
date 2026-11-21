import { NextResponse } from 'next/server';
import {
  adminConfigured,
  istemciIp,
  loginBlocked,
  loginFailed,
  loginSucceeded,
  setSessionCookie,
  verifyPassword,
} from '@/lib/adminAuth';

export const runtime = 'edge';

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
    const body = (await request.json()) as { password?: unknown };
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    /* geçersiz gövde */
  }

  if (!(await verifyPassword(password))) {
    loginFailed(ip);
    await new Promise((r) => setTimeout(r, 600)); // tahmin hızını düşür
    return NextResponse.json({ error: 'Yanlış şifre!' }, { status: 401 });
  }

  loginSucceeded(ip);
  const res = NextResponse.json({ ok: true });
  await setSessionCookie(res);
  return res;
}
