# hur-ma.com İkon Seti

Premium hurma e-ticaret sitesi için flat/minimal tasarım ikonları.

## 🎨 Renk Paleti

| Renk | Hex | Kullanım |
|------|-----|----------|
| Amber/Hurma | `#C4956A` | Ana vurgu, hurma meyvesi |
| Amber Açık | `#D4A574` | Highlight, parlak alanlar |
| Amber Koyu | `#A67B52` | Gölge, detaylar |
| Yeşil | `#6B8E5A` | Yaprak, doğallık, CTA |
| Yeşil Koyu | `#5A7D4A` | Detaylar, vurgular |
| Kahve | `#8B7355` | Sap, gövde |
| Krem | `#FDF9F3` | Arka plan, kontrastlar |

## 📁 Dosya Yapısı

```
hurma-icons/
├── favicon.svg              # Ana favicon (512x512, detaylı)
├── favicon-small.svg        # Küçük favicon (32x32, basitleştirilmiş)
├── feature-icons.svg        # Özellik ikonları (toplu görünüm)
├── health-icons.svg         # Sağlık/fayda ikonları (toplu görünüm)
├── category-icons.svg       # Kategori filtreleme ikonları
│
├── icon-natural.svg         # 🌿 Doğal & Taze
├── icon-delivery.svg        # ✈️ Hızlı Kargo
├── icon-premium.svg         # ⭐ Premium Kalite
├── icon-whatsapp.svg        # 💬 Kolay Sipariş
│
├── icon-heart.svg           # Kalp sağlığı
├── icon-energy.svg          # Enerji
├── icon-digestion.svg       # Sindirim
├── icon-bloodsugar.svg      # Kan şekeri dengesi
├── icon-bone.svg            # Kemik sağlığı
│
└── icon-palm.svg            # Medine hurma palmiyesi
```

## 🔧 Kullanım

### HTML'de Inline SVG
```html
<div class="feature-icon">
  <img src="/icons/icon-natural.svg" alt="Doğal & Taze" width="48" height="48">
</div>
```

### CSS Background
```css
.icon-natural {
  background-image: url('/icons/icon-natural.svg');
  background-size: contain;
  width: 48px;
  height: 48px;
}
```

### React/Next.js
```jsx
import NaturalIcon from '@/icons/icon-natural.svg';

<NaturalIcon className="w-12 h-12" />
```

## 📱 Favicon Kurulumu

```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

## 🎯 Önerilen Boyutlar

| Kullanım | Boyut |
|----------|-------|
| Özellik kartları | 48x48 veya 64x64 |
| Fayda listesi | 32x32 veya 40x40 |
| Kategori filtreleri | 24x24 veya 32x32 |
| Favicon | 16x16, 32x32, 180x180 |

## 📝 Notlar

- Tüm ikonlar SVG formatında, vektörel ve ölçeklenebilir
- Renk kodları CSS custom properties ile yönetilebilir
- Koyu tema için renkleri tersine çevirebilirsiniz

---
*hur-ma.com için özel tasarlanmıştır*
