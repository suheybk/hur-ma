// Admin şifresinden ADMIN_PASSWORD_HASH değeri üretir.
// Kullanım:  npm run admin:sifre -- "yeni-şifreniz"
import { randomBytes, scryptSync } from 'node:crypto';

const sifre = process.argv[2];
if (!sifre || sifre.length < 10) {
  console.error('En az 10 karakterlik bir şifre verin:  npm run admin:sifre -- "yeni-şifreniz"');
  process.exit(1);
}
const tuz = randomBytes(16);
const ozet = scryptSync(sifre, tuz, 64);
console.log(`ADMIN_PASSWORD_HASH=scrypt:${tuz.toString('hex')}:${ozet.toString('hex')}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString('hex')}`);
