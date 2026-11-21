# Fesîle — Hurmanın Yaratılışı

Three.js ile yapılmış, yalnızca fare hareketiyle (telefonda parmak sürükleyerek)
oynanan kısa bir tanıtım filmi. Yedi bölüm, açılış ve bitiş bahçesi. Tasarım
belgesi: `TASARIM.md`.

## Oynanış: oyuncu kontrolünde ilerleme

- **Okuma kapısı:** Yazı gösteren evreler (her bölümün açılış başlığı ve etiketleri,
  7. bölümdeki sakin âyet satırı) süre dolunca kendiliğinden geçmez. Alt ortada
  "Devam etmek için tıkla ya da aşağı kaydır" yazar; oyun **tıklama**, **fare
  tekerleğiyle aşağı kaydırma**, telefonda **dokunma** ya da Boşluk / Enter / ↓ /
  PageDown ile ilerler. Mantığı `src/bolumler/temel.js` (`okumaEvreleri`, `evreye`)
  ve `src/main.js` (`kapiAc`, `kapiGec`, `_kapiKur`) içindedir.
- **Yardımcı imleç:** Oyuncu fareyi oynatırken sahneye hiç karışmaz; yalnızca
  20 sn hiç hareket edilmezse sahne takılmasın diye devreye girer (`girdi.js`,
  `enAzBekleme`).
- Bazı etiketler (kalp, kök sözü, çiftçi) okunabilsin diye daha uzun açık kalır.

## Siteye derleme

```bash
npm install
npm run siteye     # çıktıyı doğrudan ../../public/fesile/ klasörüne yazar
```

Site, oyunu `/oyun` sayfasında `<iframe src="/fesile/index.html">` ile gösterir.

## Çalıştırma

Node 18 ya da üstü gerekir.

```bash
npm install        # bağımlılıklar (three, vite, @fontsource/fraunces, @fontsource/inter)
npm run dev        # geliştirme sunucusu: http://127.0.0.1:5173/
npm run build      # yayın çıktısı: dist/
npm run preview    # dist/ klasörünü yerelde dener
```

## Siteye koymak

`npm run build` sonrası oluşan `dist/` klasörü tamamen durağandır ve göreli
yollar kullanır (`base: './'`). Çalışırken hiçbir dış alana istek atmaz (font,
CDN, analitik yok).

**Alt klasör olarak:** `dist/` içindekileri sitenizde istediğiniz klasöre
kopyalayın, ör. `https://ornek.com/fesile/`. `index.html` o klasörden açılır.

**`<iframe>` ile gömmek:**

```html
<iframe src="/fesile/index.html"
        title="Fesîle — Hurmanın Yaratılışı"
        style="width:100%;height:100vh;border:0;display:block"
        allow="fullscreen; autoplay"
        allowfullscreen></iframe>
```

Ses için kullanıcının "Başla"ya basması gerekir (tarayıcı kuralı). Tam ekran
düğmesinin iframe içinde çalışması için `allowfullscreen` gerekir.

Open Graph görseli (`og-gorsel.jpg`) göreli yolla verilmiştir; paylaşım
önizlemesi için `index.html` içindeki `og:image` değerini yayınlandığı adresin
tam URL'si ile değiştirin (ör. `https://ornek.com/fesile/og-gorsel.jpg`).

## Dosya düzeni

```
index.html               sayfa iskeleti, DOM arayüzü, WebGL yedeği
vite.config.js           base './' (alt klasörde çalışır)
public/og-gorsel.jpg     paylaşım görseli
src/
  main.js                işleyici, döngü, bölüm akışı, kalite, kayıt, test kancaları
  icerik.js              BÜTÜN ayet/hadis metinleri + kartlar, sözlük, etiketler
  stil.css               arayüz stilleri, fontlar
  cekirdek/              kamera düzeneği, girdi (imleç + yardımcı), arayüz, ses
  dunya/                 gök + ay evresi, kum tepeleri, hurma ağacı, salkım,
                         yay.js (urcûn ⇄ hilal ortak yay fonksiyonu), urcun.js
  fx/                    son işlem zinciri (bloom, ton eşleme, gren, vinyet,
                         radyal bulanıklık), GPU parçacıkları
  bolumler/              acilis, b1-cekirdek … b7-urcun, bitis
test/                    Playwright test betikleri (aşağıda)
ekran-goruntuleri/       son ekran görüntüleri
```

## Test kancaları

Adres parametreleri:

- `?bolum=1..7` doğrudan o bölüme gider (`8` = bitiş bahçesi)
- `?hiz=N` oyunu N kat hızlandırır
- `?kalite=dusuk|orta|yuksek` kaliteyi sabitler (uyarlanır kalite kapanır)
- `?hareket=az` hareket azaltma kipini zorlar (sarsıntı, radyal bulanıklık, hız çizgileri kapalı)

Tarayıcı konsolunda `window.__oyun`:

- `__oyun.durum` — durum, bölüm, evre, evre süresi, bölüme özgü sayaçlar
- `__oyun.info()` — `renderer.info` (çizim çağrısı, üçgen, nokta…)
- `__oyun.git(n)` — bölüme geçer
- `__oyun.imlec(x, y)` — imleci programla sürer (NDC, −1…1)
- `__oyun.atla()` — bulunulan evreyi atlar
- `__oyun.devam()` — kartı geçer
- `__oyun.ilerle(sn)` — döngüyü durdurup simülasyonu sabit adımla ilerletir, sonra bir kare çizer
  (yazılım işleyicili başsız tarayıcıda hızlı test için)

Test betikleri (önce `npm run build`; `dist/` bir alt yoldan sunulur):

```bash
node test/icerik-dogrula.mjs                     # src/icerik.js ↔ TASARIM.md §9, harf harf
node test/oyna.mjs bos                           # baştan sona, hiç girdi yok
node test/oyna.mjs fare                          # baştan sona, gerçek fare hareketi
node test/oyna.mjs dokun 390 844 _telefon        # dikey telefon, dokunmatik sürükleme
node test/adim.mjs "?bolum=7&kalite=yuksek" ad "5:urun,25:morf" bos   # belirli anlarda görüntü
```

## Yayından önce: `src/icerik.js` içinde ehil birinin doğrulaması gerekenler

Bütün ayet ve hadis metinleri yalnızca `src/icerik.js` dosyasındadır ve
`TASARIM.md` §9 listesinden harfiyen alınmıştır. Hiçbiri ezberden yazılmamıştır.
Her kayıtta `dogrulandi: false` vardır. Yayından önce:

1. `METINLER` içindeki her ayetin meâlini ve sûre/âyet numarasını (`kaynak`) kontrol edin.
   Arap harfli metin kasıtlı olarak yoktur.
2. Her hadisin meâlini ve kaynak gösterimini (kitap, bab, numara) kontrol edin; özellikle
   Ahmed b. Hanbel / el-Edebü'l-müfred künyesini ve "Kim sabahleyin yedi acve…" hadisinin
   kaynağını.
3. Doğrulanan kayıtlarda `dogrulandi: true` yapın. Metin düzeltilirse `TASARIM.md` §9 da
   güncellenmeli; `node test/icerik-dogrula.mjs` ikisini karşılaştırır.
4. Kart eşleşmelerini (`KARTLAR`), Defter'de sözlük maddelerinin altına konan ayetleri
   (`SOZLUK[].dini`) ve Acve hadisinin yalnız Acve kartında durduğunu gözden geçirin.
   Kâf 50:10-11 ve Rahmân 55:10-11 "tal‘" maddesinin, Yâsîn 36:68 ve Rûm 30:54 "urcûn"
   maddesinin altına konmuştur (tasarımda yer belirtilmemişti).
5. `İbrâhim 14:24-25` kaydındaki "Birçok müfessir bu ağacı hurma olarak açıklar." notu.
6. Dinî olmayan botanik bilgiler (`ETIKETLER`, `SOZLUK`, `TURLER`, `SATIRLAR`) de bir
   uzmanca okunmalıdır; özellikle Medine hurma türlerinin kısa tanımları.
7. Kullanılmayacaklar listesindeki hiçbir öğe (§9.7) dosyada yoktur; değişikliklerde de
   eklenmemelidir.
