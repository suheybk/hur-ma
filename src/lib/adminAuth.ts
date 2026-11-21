// Admin kimlik doğrulaması — Cloudflare edge çalışma ortamıyla uyumlu (yalnız Web Crypto).
//
// Ortam değişkenleri (Cloudflare Pages → Settings → Variables and Secrets):
//   ADMIN_PASSWORD_HASH   `npm run admin:sifre -- "şifreniz"` çıktısı (pbkdf2:tur:tuz:özet).
//   ADMIN_SESSION_SECRET  oturum çerezini imzalayan en az 32 karakterlik gizli anahtar.
// Bunlar tanımlı değilse admin girişi tamamen kapalıdır (varsayılan şifre yoktur).
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const ADMIN_COOKIE = 'hurma_admin';
const OTURUM_SURESI_SN = 60 * 60 * 8; // 8 saat
const enc = new TextEncoder();

function envDegeri(ad: string): string | undefined {
  try {
    const env = (getRequestContext() as unknown as { env: Record<string, unknown> }).env;
    const v = env?.[ad];
    if (typeof v === 'string' && v) return v;
  } catch {
    /* next dev: Cloudflare bağlamı yok, process.env'e düş */
  }
  return process.env[ad] || undefined;
}

function gizliAnahtar(): string | null {
  const s = envDegeri('ADMIN_SESSION_SECRET');
  return s && s.length >= 32 ? s : null;
}

export function adminConfigured(): boolean {
  return !!gizliAnahtar() && !!envDegeri('ADMIN_PASSWORD_HASH');
}

// ---------- yardımcılar ----------
const hexBytes = (hex: string) => new Uint8Array((hex.match(/../g) || []).map((h) => parseInt(h, 16)));
const b64u = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uBytes = (s: string) => {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
};

function sabitZamanliEsit(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let fark = 0;
  for (let i = 0; i < a.length; i++) fark |= a[i] ^ b[i];
  return fark === 0;
}

async function hmacAnahtari(gizli: string) {
  return crypto.subtle.importKey('raw', enc.encode(gizli), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

// ---------- şifre ----------
export async function verifyPassword(password: string): Promise<boolean> {
  const hash = envDegeri('ADMIN_PASSWORD_HASH');
  if (!hash || !gizliAnahtar() || typeof password !== 'string' || !password || password.length > 200) return false;
  const [tur, turSayisi, tuzHex, ozetHex] = hash.trim().split(':');
  const iter = Number(turSayisi);
  if (tur !== 'pbkdf2' || !Number.isInteger(iter) || iter < 10000 || !tuzHex || !ozetHex) return false;
  const beklenen = hexBytes(ozetHex);
  const anahtar = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bitler = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: hexBytes(tuzHex), iterations: iter },
    anahtar,
    beklenen.length * 8
  );
  return sabitZamanliEsit(new Uint8Array(bitler), beklenen);
}

// ---------- oturum jetonu: base64url(yük).base64url(HMAC-SHA256) ----------
async function jetonUret(): Promise<string> {
  const gizli = gizliAnahtar();
  if (!gizli) throw new Error('ADMIN_SESSION_SECRET tanımlı değil');
  const yuk = b64u(enc.encode(JSON.stringify({ rol: 'admin', exp: Math.floor(Date.now() / 1000) + OTURUM_SURESI_SN })));
  const imza = await crypto.subtle.sign('HMAC', await hmacAnahtari(gizli), enc.encode(yuk));
  return `${yuk}.${b64u(new Uint8Array(imza))}`;
}

async function jetonGecerli(jeton: string): Promise<boolean> {
  const gizli = gizliAnahtar();
  if (!gizli) return false;
  const [yuk, imza, fazla] = jeton.split('.');
  if (!yuk || !imza || fazla !== undefined) return false;
  try {
    const dogru = await crypto.subtle.verify('HMAC', await hmacAnahtari(gizli), b64uBytes(imza), enc.encode(yuk));
    if (!dogru) return false;
    const veri = JSON.parse(new TextDecoder().decode(b64uBytes(yuk))) as { rol?: string; exp?: number };
    return veri.rol === 'admin' && typeof veri.exp === 'number' && veri.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

const cerezAyarlari = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
});

export async function setSessionCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, await jetonUret(), { ...cerezAyarlari(), maxAge: OTURUM_SURESI_SN });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, '', { ...cerezAyarlari(), maxAge: 0 });
}

export async function isAdmin(): Promise<boolean> {
  const jeton = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!jeton && (await jetonGecerli(jeton));
}

/** Admin değilse 401 yanıtı döner; admin ise null. */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
}

// ---------- kaba kuvvet freni ----------
// IP başına 15 dakikada en çok 10 hatalı deneme. Edge örnekleri arasında paylaşılmaz;
// asıl koruma güçlü şifre + PBKDF2. Yine de tek örneğe gelen denemeleri yavaşlatır.
const denemeler = new Map<string, { sayi: number; ilk: number }>();
const PENCERE_MS = 15 * 60 * 1000;
const EN_COK = 10;

export function istemciIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'yerel'
  );
}

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
