// Admin kimlik doğrulaması (yalnız sunucuda çalışır).
//
// Ortam değişkenleri:
//   ADMIN_PASSWORD_HASH   `npm run admin:sifre -- "şifreniz"` çıktısı (scrypt:tuz:özet).
//   ADMIN_PASSWORD        (isteğe bağlı) düz şifre; HASH yoksa kullanılır. Önerilmez.
//   ADMIN_SESSION_SECRET  oturum çerezini imzalayan en az 32 karakterlik gizli anahtar.
// Bunlar tanımlı değilse admin girişi tamamen kapalıdır (varsayılan şifre yoktur).
import { createHash, scryptSync, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const ADMIN_COOKIE = 'hurma_admin';
const OTURUM_SURESI_SN = 60 * 60 * 8; // 8 saat

function secret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

export function adminConfigured(): boolean {
  return !!secret() && !!(process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD);
}

function esit(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyPassword(password: string): boolean {
  if (!adminConfigured() || typeof password !== 'string' || password.length === 0 || password.length > 200) {
    return false;
  }
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    const [tur, tuzHex, ozetHex] = hash.trim().split(':');
    if (tur !== 'scrypt' || !tuzHex || !ozetHex) return false;
    const beklenen = Buffer.from(ozetHex, 'hex');
    const hesap = scryptSync(password, Buffer.from(tuzHex, 'hex'), beklenen.length);
    return esit(hesap, beklenen);
  }
  // düz şifre: uzunluk sızmasın diye özetleri karşılaştır
  const d = (s: string) => createHash('sha256').update(s, 'utf8').digest();
  return esit(d(password), d(process.env.ADMIN_PASSWORD as string));
}

export function setSessionCookie(res: NextResponse) {
  const s = secret();
  if (!s) throw new Error('ADMIN_SESSION_SECRET tanımlı değil');
  const token = jwt.sign({ rol: 'admin' }, s, { algorithm: 'HS256', expiresIn: OTURUM_SURESI_SN });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: OTURUM_SURESI_SN,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

export async function isAdmin(): Promise<boolean> {
  const s = secret();
  if (!s) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    const payload = jwt.verify(token, s, { algorithms: ['HS256'] });
    return typeof payload === 'object' && payload !== null && (payload as { rol?: string }).rol === 'admin';
  } catch {
    return false;
  }
}

/** Admin değilse 401 yanıtı döner; admin ise null. */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
}

// Basit kaba kuvvet freni: IP başına 15 dakikada en çok 10 hatalı deneme.
// (Sunucusuz ortamda örnekler arasında paylaşılmaz; yine de denemeleri ciddi yavaşlatır.)
const denemeler = new Map<string, { sayi: number; ilk: number }>();
const PENCERE_MS = 15 * 60 * 1000;
const EN_COK = 10;

export function loginBlocked(ip: string): boolean {
  const d = denemeler.get(ip);
  if (!d) return false;
  if (Date.now() - d.ilk > PENCERE_MS) {
    denemeler.delete(ip);
    return false;
  }
  return d.sayi >= EN_COK;
}

export function loginFailed(ip: string) {
  const simdi = Date.now();
  const d = denemeler.get(ip);
  if (!d || simdi - d.ilk > PENCERE_MS) denemeler.set(ip, { sayi: 1, ilk: simdi });
  else d.sayi++;
  if (denemeler.size > 5000) denemeler.clear();
}

export function loginSucceeded(ip: string) {
  denemeler.delete(ip);
}
