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
- Varsayılan Şifre: `hurma2024`

**Önemli**: Production'da şifreyi değiştirin!

## ⚙️ Ortam Değişkenleri

`.env` dosyasını düzenleyin:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_WHATSAPP="+905334862899"
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

### Vercel (Önerilen)
```bash
npm install -g vercel
vercel
```

### Manual Build
```bash
npm run build
npm start
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
