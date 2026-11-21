# hur-ma.com - Premium Hurma E-Ticaret Sitesi

Modern, şık ve kullanıcı dostu bir hurma satış sitesi. WhatsApp entegrasyonu ile kolay sipariş.

## 🌴 Özellikler

- **Ürün Kataloğu**: 22 farklı hurma çeşidi, kategori filtreleme
- **Sepet Sistemi**: Ürün seçimi, miktar ayarlama
- **WhatsApp Sipariş**: Sepet içeriği otomatik mesaj olarak hazırlanır
- **Admin Paneli**: Ürün ekleme, düzenleme, silme
- **Responsive Tasarım**: Mobil uyumlu
- **Premium Tasarım**: Özel logo, altın-kahve renk paleti

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Veritabanını Hazırla
```bash
npx prisma db push
npm run db:seed
```

### 3. Geliştirme Sunucusunu Başlat
```bash
npm run dev
```

Site http://localhost:3000 adresinde çalışacaktır.

## 📁 Proje Yapısı

```
hur-ma/
├── prisma/
│   ├── schema.prisma    # Veritabanı şeması
│   └── seed.ts          # Başlangıç verileri
├── src/
│   ├── app/
│   │   ├── page.tsx     # Ana sayfa
│   │   ├── admin/       # Admin paneli
│   │   └── api/         # API endpoints
│   ├── components/
│   │   ├── Logo.tsx     # Özel logo
│   │   ├── Header.tsx   # Üst menü
│   │   ├── ProductCard.tsx
│   │   ├── Cart.tsx     # Sepet + WhatsApp
│   │   └── Footer.tsx
│   └── lib/
│       ├── prisma.ts    # Veritabanı bağlantısı
│       ├── types.ts     # TypeScript tipleri
│       └── initialData.ts
└── .env                 # Ortam değişkenleri
```

## 🔐 Admin Paneli

- URL: `/admin`
- Varsayılan şifre **yoktur**. Şifre ortam değişkeninde, özet (hash) olarak tutulur:

```bash
npm run admin:sifre -- "yeni-şifreniz"
```

Komutun yazdığı iki satırı (`ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`) canlıda
**Cloudflare Pages → Settings → Variables and Secrets** altına *secret* olarak ekleyin
(Production ve gerekiyorsa Preview). Yerelde `next dev` için `.env.local` dosyasına yazın.
Bu değerler yoksa admin girişi kapalıdır.

- Giriş başarılı olunca 8 saat geçerli, imzalı, `httpOnly` bir oturum çerezi verilir.
- `/api/admin/*` uçları her istekte bu çerezi sunucuda doğrular; ürün ekleme / düzenleme /
  silme yalnızca giriş yapmış admin ile mümkündür.
- 15 dakikada 10 hatalı denemeden sonra giriş geçici olarak engellenir.

## ⚙️ Ortam Değişkenleri

Örnek için `.env.example` dosyasına bakın. Veritabanı Cloudflare D1'dir (`wrangler.toml` → `DB`).

```env
ADMIN_PASSWORD_HASH=pbkdf2:100000:...
ADMIN_SESSION_SECRET=...
```

## 📱 WhatsApp Entegrasyonu

Sipariş verirken sepet içeriği otomatik olarak WhatsApp mesajına dönüştürülür:

```
Merhaba, aşağıdaki ürünleri sipariş etmek istiyorum:

1. Acve Duble
   Miktar: 2 KG
   Fiyat: 1.640 TL

2. Mejdul Jumbo
   Miktar: 1 KG
   Fiyat: 1.110 TL

---
Toplam: 2.750 TL
```

## 🎨 Renk Paleti

- **Altın**: #D4A574
- **Koyu Kahve**: #2C1810
- **Kahve**: #4A3728
- **Krem**: #FDF8F3

## 🚀 Production Deploy

Site **Cloudflare Pages** üzerinde çalışır; veritabanı Cloudflare **D1**'dir (`wrangler.toml`).

### Cloudflare Pages (Git bağlantısıyla)
Cloudflare Pages projesinin derleme ayarları:

- Build command: `npx @cloudflare/next-on-pages`
- Build output directory: `.vercel/output/static`
- Compatibility flag: `nodejs_compat`
- D1 binding: `DB` → `hur-ma-db`
- Secrets: `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`

> Not: `.vercel/output` klasörü ve `vercel` paketi Cloudflare'in `next-on-pages` aracının
> kendi çıktı biçimidir; Vercel hesabı ya da bağlantısı gerektirmez.

### Elle yayın (Wrangler)
```bash
npm run pages:deploy
```

### Veritabanı (D1) migration
```bash
npx wrangler d1 migrations apply hur-ma-db --remote
```

## 📝 Notlar

- Fiyatlar Riyal kuruna endekslidir
- Kargo ücreti fiyatlara dahil değildir
- Ürün görselleri eklenebilir (admin panelden)

## 📞 İletişim

- WhatsApp: +90 533 486 28 99
- Adres: Şenyuva Mah. Keçiören/ANKARA

---

© 2024 hur-ma.com
