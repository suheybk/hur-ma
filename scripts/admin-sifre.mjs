// Admin şifresinden ADMIN_PASSWORD_HASH ve ADMIN_SESSION_SECRET değerlerini üretir.
// Kullanım:  npm run admin:sifre -- "yeni-şifreniz"
// Biçim: pbkdf2:<tur>:<tuz-hex>:<özet-hex>  (PBKDF2-SHA256; Cloudflare Workers üst sınırı 100000 tur)
import { pbkdf2Sync, randomBytes } from 'node:crypto';

const sifre = process.argv[2];
if (!sifre || sifre.length < 10) {
  console.error('En az 10 karakterlik bir şifre verin:  npm run admin:sifre -- "yeni-şifreniz"');
  process.exit(1);
}
const TUR = 100000;
const tuz = randomBytes(16);
const ozet = pbkdf2Sync(sifre, tuz, TUR, 32, 'sha256');
console.log(`ADMIN_PASSWORD_HASH=pbkdf2:${TUR}:${tuz.toString('hex')}:${ozet.toString('hex')}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString('hex')}`);
