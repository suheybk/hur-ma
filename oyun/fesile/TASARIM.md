# Fesîle — Hurmanın Yaratılışı

Three.js ile oynanabilir tanıtım filmi · tasarım belgesi (sürüm 2)

> Sürüm 1 (2D canvas, mobil bahçe simülasyonu) iptal edildi. Bu belge onun yerini alır.

## 1. Özet

Web sitesine konacak, tam ekran, **three.js** ile yapılmış kısa bir deneyim.
Hurma, bir amiral gemisi ürün gibi tanıtılır: büyük tipografi, sinematik kamera,
3B nesneye iliştirilmiş "özellik" etiketleri. Ama her özellik izlenmez, **oynanır**:
yedi kısa, hareketli sahne; hepsi **yalnızca fare hareketiyle** (telefonda parmak
sürükleme) yönetilir.

Altında yatan niyet değişmedi: hurmanın yaratılışına bakan kişi kendi yaratılışını
görsün ve Rabbine yönelsin. Hareket ve gösteriş araçtır; her sahnenin sonunda ekran
durulur ve bir tefekkür kartı gelir.

Çekirdek cümle: *"Allah sizi yerden bir bitki gibi bitirdi."* (Nûh 71:17)

- Süre: baştan sona 5–7 dakika. Tek oturumda biter; istenirse tekrar oynanır.
- Dil: Türkçe. Reklam, puan, can, kaybetme, süre baskısı **yok**.
- "Aksiyon" doğadan gelir: düşüş, hız, fırtına, rüzgâr, su, büyüme. Düşman, dövüş yok.

## 2. Üç ilke

1. **Tek girdi: imleç konumu.** Oyun içinde tıklama, tuş, kaydırma tekerleği gerekmez.
   Tıklama yalnızca "Başla" (sesi açmak için de gerekli) ve kart geçmek içindir.
   Dokunmatikte parmak sürükleme = imleç. Kaybetmek mümkün değildir; oyuncu hiçbir şey
   yapmasa bile sahne yavaşça kendi kendine tamamlanır (yardımcı mıknatıs).
2. **Ürün tanıtımı dili.** Her bölüm bir "özellik"tir: numara + başlık ("02 — Kök"),
   kahraman nesnenin yavaş dönüşü, ince çizgili etiketler, tek cümlelik iddialı ama
   doğru botanik bilgi. Pazarlama dili **yalnızca botanik bilgiler** içindir; ayet ve
   hadisler asla slogan gibi kullanılmaz (bkz. §9).
3. **Hareket → durgunluk.** Her bölüm: tanıtım planı (6–8 sn) → aksiyon (25–45 sn) →
   kart (sahne yavaşlar, kararır, bulanır; sade bir DOM kartı). Zıtlık tefekkürü taşır.

## 3. Teknik kararlar

- **Vite + three (npm, güncel kararlı sürüm), saf JavaScript ES modülleri.**
  React/R3F yok. `WebGLRenderer` (WebGL2); WebGPU kullanılmaz (uyumluluk).
- Çıktı: `npm run build` → `dist/` statik klasör, `base: './'` (sitede herhangi bir
  alt klasöre atılabilir ya da `<iframe>` ile gömülebilir). Çalışma anında dış alana
  **hiçbir ağ isteği yok** (CDN, font servisi, analitik yok).
- Bütün 3B içerik **kodla üretilir** (procedural geometri + shader). Model, doku,
  HDRI dosyası yok. İzinli ek paketler: `three` (ve `three/examples/jsm`),
  `@fontsource*` (Türkçe karakterli, latin-ext; bir gösterişli serif + bir sade sans),
  istenirse `gsap`. Geliştirme için `vite`, `playwright` zaten kurulu.
- Görüntü zinciri: ACES ton eşleme, sRGB çıktı, `EffectComposer` ile **bloom**,
  vinyet + film greni, hızda hafif renk sapması/radyal bulanıklık (özel ShaderPass).
  Tanıtım planlarında alan derinliği (P2).
- Hareket: bütün toplu hareketler GPU'da (vertex shader'da zaman/rüzgâr uniform'ları,
  `InstancedMesh`, `Points`; gerekirse `GPUComputationRenderer`). Kare başına JS ile
  on binlerce nesne güncellenmez.
- Kamera: bölüm arası spline uçuşları (yumuşatmalı), her zaman hafif imleç paralaksı,
  çarpmalarda sarsıntı, hızda FOV açılması.
- Performans bütçesi: orta sınıf dizüstünde (tümleşik GPU) 60 fps hedefi;
  `pixelRatio` üst sınırı 2; **uyarlanır kalite** (ortalama kare süresi kötüleşirse
  parçacık sayısı, bloom çözünürlüğü, pixelRatio kademeli düşer); sekme gizliyken durur;
  sahne değişiminde `dispose`. Sıkıştırılmış toplam JS ≈ 350 KB'ı aşmamalı (fontlar hariç).
- Yerleşim: tam görüntü alanı; yatay masaüstü birincil, dikey telefon desteklenir
  (kamera kadrajı en-boy oranına göre uyarlanır, tipografi küçülür).
- WebGL yoksa: sade bir yedek sayfa (başlık, kısa metin, durağan görsel/CSS hilal).
- `<html lang="tr">`, anlamlı `<title>`, meta açıklama, Open Graph görseli (P2).
- Ses (P1): WebAudio ile üretilen rüzgâr, hız uğultusu, su, hafif çıngırak. Müzik yok.
  "Başla"dan önce ses başlamaz; köşede aç/kapa.
- Kayıt: yalnızca "hangi bölümdeyim, hangi kartlar açıldı" (`localStorage`, try/catch).
- Test kancaları: `?bolum=1..7` doğrudan bölüme gider; `?hiz=N` hızlandırır;
  `?kalite=dusuk|orta|yuksek`; `window.__oyun` (durum okuma, bölüm atlama, imleci
  programla sürme, `renderer.info`).

Klasördeki eski 2D dosyalar (`js/cizim/*`, `js/durum.js`, `js/zaman.js` …) sürüm 1'den
kalmadır: `js/icerik.js` içeriği §9 listesiyle karşılaştırılıp yeniden kullanılabilir,
gerisi silinebilir.

## 4. Dünya

Medine civarını çağrıştıran çöl vadisi: kum tepeleri, uzakta koyu bazalt (harre)
sırtları, bir sulama arkı. Tek bir hurma ağacının ekseni: **toprak altı → gövde →
taç → gök**. Kamera bu eksende gezer ("kökü sağlam, dalları gökte", İbrâhim 14:24).

**Ay, zaman göstergesidir:** yedi bölüm tek bir kamerî aya yayılır. B1'de ince yeni
hilal, B5'te (hasat) dolunay, B7'de incelmiş son hilal. Ay her zaman doğru evreyle
çizilir (aydınlanma sınırı shader'da hesaplanır) ve günün saati bölümle değişir
(alacakaranlık, öğle fırtınası, altın saat, dolunay gecesi, karanlık gece).

Görsel dil: stilize ama zengin; sıcak altın/kehribar ışık, derin lacivert gece,
parlayan parçacıklar. İnsan ve canlı figürü çizilmez (el dahil).

## 5. Açılış ve arayüz

- **Açılış (hero):** alacakaranlık; kahraman hurma yavaşça döner, imleçle paralaks;
  dev başlık "Fesîle", alt satır "Hurmanın yaratılışı. Yedi sahnede.", tek düğme "Başla".
  Yüklenirken CSS ile çizilmiş ince bir hilal.
- **Bölüm rayı:** kenarda yedi nokta (ay evresi simgeleri); geçilen bölümlere dönülebilir.
- **Etiketler:** 3B noktaya iliştirilmiş ince çizgi + kısa yazı (DOM, her karede projekte).
- **Kart:** ortalanmış, sakin, geniş boşluklu; "meâlen" ibaresi, kaynak, tek cümlelik
  bağ. "Devam" ile geçilir. Kart üstünde efekt, parçacık, hareketli yazı yok.
- **Köşe:** ses aç/kapa, Defter (açılan kartlar + sözlük), tam ekran.
- **Bitiş:** gece bahçesi (imleç = rüzgâr), "Baştan oyna", "Defter".
- Dokunma/tıklama hedefleri en az 48 px. `prefers-reduced-motion` açıkken kamera
  sarsıntısı, radyal bulanıklık ve hız çizgileri kapanır (P2).

## 6. Yedi bölüm

Her bölümde: **Tanıtım** (ürün planı + etiketler) → **Aksiyon** (fareyle) → **Kart**.

### 01 · Çekirdek — "Düşüş"  (ay: yeni hilal, alacakaranlık)
- Tanıtım: boşlukta dönen dev bir hurma çekirdeği, stüdyo ışığı gibi kenar ışığı.
  İmleç üç bölgenin üzerine gelince etiket açılır: **kıtmîr** (çekirdeği saran zar),
  **nakîr** (sırtındaki minik çukur), **fetîl** (yarığındaki ipçik).
  Satır: "Bütün bir ağaç, bunun içinde."
- Aksiyon: çekirdek gökten çöle düşer. İmleç onu rüzgâr akımlarının (parlak şeritler)
  arasından nemli, hafif ışıyan toprağa yönlendirir. Hız çizgileri, FOV açılması;
  çarpışta kum patlaması, krater, kamera sarsıntısı; kum üstünü örter.
- Kart: En'âm 6:95 + İnsân 76:1. Bağ: "Sen de bir zamanlar bu kadar küçüktün."

### 02 · Kök — "Dalış"  (toprak altı)
- Tanıtım: toprağın kesiti; çekirdek çatlar. Satır: "Önce aşağı. Yaprak sonra."
  (Gerçek: hurma çimlenirken önce toprağın altına iner.)
- Aksiyon: kamera, ışıyan kök ucuyla birlikte katmanların içinden hızla aşağı dalar
  (tünel hissi). İmleç kök ucunu yönlendirir: taşlardan sıyrıl (çarpınca yalnızca
  kıvılcım ve yavaşlama), üç **su damarına** ulaş (mavi ışık patlaması; arkada kök
  dallanarak büyür). Final: kamera kök boyunca yukarı fırlar, yüzeyde ilk yaprak kumu deler.
- Çiftçi sözü (etiket olarak): "Hurmanın ayağı suda, başı ateşte gerek."
- Kart: İbrâhim 14:24-25. Bağ: "Görünmeyen kök, görünen dalı taşır."

### 03 · Kalp — "Fırtına"  (öğle, kum fırtınası)
- Tanıtım: hızlandırılmış büyüme; gövde halka halka yükselir, yapraklar tepeden açılır.
  Etiketler: **kürnâf** (yaprak dipleri gövdeyi örer), **lîf**, **cummâr**.
  Satır: "Tek bir büyüme noktası. Yedeği yok."
- Aksiyon: kum fırtınası bastırır. İmleç hızla kuru (sarı-kahve) yaprakların üzerinden
  geçince yapraklar kopup fırtınaya savrulur (hızlı süpürme hareketi). Tepedeki yeşil
  öz ışır; imleç oraya gelince yumuşak bir kalkan dalgası onu geri iter:
  "Burası ağacın kalbi." Kısa röntgen görünümü cummârı gösterir. Fırtına diner,
  ağaç temiz ve dimdik kalır.
- Kart: "Bedende bir et parçası vardır…" hadisi + hurma–müslüman hadisi.
  Bağ: "Senin de korunacak tek bir merkezin var."

### 04 · Çift — "Rüzgâr"  (altın saat, ay büyüyor)
- Tanıtım: iki ağaç; kınlar (tal‘) yarılır. Satır: "Meyveyi dişi verir. Ama tek başına değil."
  Etiketler: erkek ağaç (fahl), dişi ağaç, telkîh.
- Aksiyon: **imleç rüzgârdır.** Erkek ağaçtan on binlerce altın çiçek tozu salınır;
  oyuncu imleciyle bulutu sürükleyip dişi ağacın yedi salkımına taşır. Yeterince toz
  ulaşan salkım ışıkla tutuşur. Akış alanı (curl noise), ışıma, girdaplar.
- Bilgi etiketi: "Çiftçiler bunu asırlardır elle yapar. Bir erkek ağaç onlarca dişiye yeter."
- Kart: Yâsîn 36:36 + Zâriyât 51:49. Bağ: "Sen de bir çiftten geldin."

### 05 · Meyve — "Hasat"  (dolunay gecesi)
- Tanıtım: ay dolarken salkımlardan bir renk dalgası geçer:
  **kimrî** (yeşil) → **halâl** (sarı/kızıl) → **rutab** (bal) → **temr** (koyu).
  Dört etiket sırayla yanar. Satır: "Dört evre. Tek salkım."
- Aksiyon: imleç salkım dalına yaklaşınca dal imlece "tutunur"; fareyi sağa sola
  sallayınca dal silkelenir, hurmalar yağar. İkinci yarı: alttaki kap imleci izler,
  düşen hurmaları yakalar (yedi hurma). Sonra **ikram**: yedi hurma kaptan yükselir,
  ışığa dönüp ufka doğru uçar; uzakta kandiller yanar.
- Kart: Meryem 19:25-26 + "Yarım hurma ile de olsa…" hadisi.
  Bağ: "Rızık O'ndan; dalı silkelemek senden."

### 06 · Fesîle — "Su"  (sabah)
- Tanıtım: ağacın dibinde yavrular. Röntgen: yavrunun kendi kökleri oluşuyor.
  Satır: "Çekirdek kura çeker. Yavru, annesinin aynısıdır."
  (Gerçek: yavru annenin birebir kopyasıdır; çekirdekten çıkanın cinsi ve meyvesi belirsizdir.
  Yavru, kendi kökünü salana dek annesine bağlı beslenir.)
- Aksiyon 1 (yavaş, hassas): ışıyan ayırma çizgisi; imleç çizgiyi sakince izler,
  tek temiz kesim. Saparsa kesim bekler, kaldığı yerden sürer.
- Aksiyon 2 (hızlı): yavru yakındaki çukura dikilir; arktan su salınır. Su başı
  çatallarda imlece doğru akar; oyuncu suyu fidana ulaştırır. Fidan yeşerir; kamera
  geri çekilir ve hızlandırılmış çekimde yavrulardan koca bir hurmalık büyür.
- Kart: Ra‘d 13:4 + Nisâ 4:1 + fesîle hadisi. Bağ: "Ayrı gövdeler, tek kök, aynı su."

### 07 · Urcûn — "Dönüş"  (son hilal, koyu gece)
- Tanıtım: hasattan kalan boş salkım sapı (**urcûn**): altın sarısı, yay gibi.
  Satır yok; sessizlik.
- Aksiyon ve geçiş (oyunun sanatsal doruğu):
  1. Sap solar, incelir, ucu içe kıvrılır, kurur.
  2. Sap imleci ataletle izler; oyuncu onu **yukarı, göğe kaldırır**. Ağaç aşağıda siluet olur.
  3. Göğün belli bir yerine (soluk bir iz) yaklaşınca sap yerine oturur, ışımaya başlar,
     dokusu silinir ve **incelmiş son hilal** olur. Yıldızlar imlece tepki verir.
  4. Kart yerine ayet doğrudan sakin bir satır olarak belirir (Yâsîn 36:39). Uzun sessizlik.
  5. Hilal de kaybolur; karanlık gök. Sonra ufukta yeni ayın ince hilali doğar;
     yerde yavru fidanın yeni yaprağı açılır.
- **Teknik şart:** sap ile hilal **aynı yay fonksiyonundan** üretilmeli (ortak eğri +
  kalınlık profili), biri diğerine sıçrama olmadan dönüşmeli. Bu geçiş özensiz olursa
  eser amacına ulaşmaz.
- Kapanış kartı: Nûh 71:17-18. Bağ: "İncelen yok olmuyor; dönüyor."
- Ardından bitiş sahnesi (gece bahçesi).

## 7. Defter

Açılan kartlar, sözlük (kıtmîr, nakîr, fetîl, cummâr, kürnâf, lîf, tal‘, fahl, telkîh,
kimrî, halâl, rutab, temr, fesîle, urcûn) ve Medine hurma türleri sayfası:
**Acve** (koyu, yumuşak; Medine'nin simgesi), **Anber**, **Safâvî**, **Mebrûm**,
**Sağâî** (iki renkli), **Bernî**, **Rûsâne**, **Rabîa**, **Hulve**.
(Sükkerî ve Medjûl Medine türü değildir; eklenmez.) Sade DOM sayfası; P1.

## 8. Öncelik sırası

- **P0:** Açılış; yedi bölümün her biri (tanıtım + fareyle aksiyon + kart) baştan sona
  oynanır; doğru ay evreleri; B7 urcûn→hilal geçişi tam kalite; bloom ve temel efekt
  zinciri; bölüm rayı; `npm run build` ile çalışan `dist/`.
- **P1:** Ses; Defter; bitiş bahçesi; uyarlanır kalite; dikey telefon kadrajı; kayıt.
- **P2:** Alan derinliği; hareket azaltma; Open Graph görseli; klavye erişimi; WebGL yedeği cilası.

Yedi bölümün hepsi orta kalitede olacağına, önce 01, 04 ve 07 çok iyi olsun;
sonra diğerleri aynı seviyeye çekilsin.

## 9. Dinî içerik kuralları (kesin)

1. Ayet ve hadis metinleri **yalnızca aşağıdaki listeden** alınır. Listede olmayan
   hiçbir ayet/hadis ezberden yazılmaz, tamamlanmaz, yeniden ifade edilmez.
2. Arap harfli Kur'an metni **kullanılmaz**. Türkçe meâl + sûre/âyet numarası gösterilir.
3. Bütün meâller "meâlen" ibaresiyle sunulur; metinler tek dosyada (`src/icerik.js`)
   durur, her kayıtta `kaynak` ve `dogrulandi: false` bulunur. Yayın öncesi ehil biri doğrulayacak.
4. Ayet/hadis oyunlaştırılmaz ve **pazarlama dili olmaz**: slogan, başlık, etiket, ödül,
   toplanacak nesne olmaz; üzerinde parçacık, parıltı, harf harf animasyon olmaz.
   Aksiyon sırasında ekranda ayet/hadis bulunmaz. Kart geldiğinde sahne durulur.
5. Peygamber, sahâbî, melek, hiçbir insan tasvir edilmez.
6. Çiftçi sözleri ve botanik bilgiler görsel olarak dinî metinlerden ayrı durur.
7. **Kullanılmayacaklar:** "Halanız hurmaya ikram edin" (zayıf/uydurma sayılır);
   "yavru annesini görmezse ölür, anne küser" (kaynağı yok); "hurmanın ömrü insanla
   aynı, 60–70 yıl" (hurma yüz yılı aşabilir); "ayağı cennette".

### İçerik listesi (meâlen)

Ayetler:
- **Nûh 71:17-18** — "Allah sizi yerden bir bitki gibi bitirdi. Sonra sizi yine oraya
  döndürecek ve sizi yeniden çıkaracaktır."
- **En'âm 6:95** — "Şüphesiz Allah, taneyi ve çekirdeği yarıp filizlendirendir.
  Ölüden diriyi çıkarır; diriden de ölüyü çıkarandır."
- **İnsân 76:1** — "İnsanın üzerinden, henüz anılmaya değer bir şey olmadığı uzun bir
  süre geçmedi mi?"
- **Fâtır 35:13** (kıtmîr) — "O'nu bırakıp da yalvardıklarınız bir çekirdek zarına bile
  sahip değillerdir."
- **Nisâ 4:124** (nakîr) — "Erkek olsun kadın olsun, kim mümin olarak iyi işler yaparsa,
  işte onlar cennete girerler ve zerre kadar haksızlığa uğratılmazlar."
- **Nisâ 4:77** (fetîl) — "…Size kıl kadar haksızlık edilmez."
- **İbrâhim 14:24-25** — "Görmedin mi Allah nasıl bir misal getirdi: Güzel söz, kökü
  sağlam, dalları göğe yükselen güzel bir ağaç gibidir. O ağaç, Rabbinin izniyle her
  zaman meyvesini verir." (Not: birçok müfessir bu ağacı hurma olarak açıklar.)
- **Yâsîn 36:36** — "Yerin bitirdiklerinden, kendilerinden ve daha bilmedikleri şeylerden
  bütün çiftleri yaratan Allah'ın şanı yücedir."
- **Zâriyât 51:49** — "Düşünüp öğüt alasınız diye her şeyi çift çift yarattık."
- **Kâf 50:10-11** — "Salkımları üst üste dizilmiş yüksek hurma ağaçları bitirdik;
  kullara rızık olarak. O suyla ölü bir beldeyi dirilttik. İşte (kabirden) çıkış da böyledir."
- **Meryem 19:25-26** — "Hurma dalını kendine doğru silkele ki üzerine taze, olgun
  hurmalar dökülsün. Ye, iç, gözün aydın olsun."
- **Ra‘d 13:4** — "Yeryüzünde birbirine komşu kıtalar, üzüm bağları, ekinler, bir kökten
  çatallanmış ve çatallanmamış hurmalıklar vardır. Hepsi aynı suyla sulanır; ama
  yemişlerinde birini ötekine üstün kılarız. Şüphesiz bunda aklını kullanan bir topluluk
  için ibretler vardır."
- **Nisâ 4:1** — "Ey insanlar! Sizi tek bir nefisten yaratan, ondan eşini yaratan ve
  ikisinden pek çok erkek ve kadın yayan Rabbinize karşı gelmekten sakının."
- **Yâsîn 36:39** — "Ay için de menziller belirledik; nihayet o, eski hurma salkımının
  kurumuş, eğrilmiş sapı gibi olur."
- **Yâsîn 36:68** — "Kime uzun ömür verirsek, onu yaratılışında tersine çeviririz.
  Hiç düşünmezler mi?"
- **Rûm 30:54** — "Allah sizi güçsüz yaratan, güçsüzlükten sonra kuvvet veren,
  kuvvetten sonra da güçsüzlük ve ihtiyarlık verendir."
- **Rahmân 55:10-11** — "Yeri canlılar için yaydı. Orada meyveler ve salkımlı hurma
  ağaçları vardır."

Hadisler:
- "Ağaçlar içinde öyle bir ağaç vardır ki yaprağını dökmez; o, müslümana benzer…
  O, hurma ağacıdır." (Buhârî, İlim 4; Müslim, Münâfikîn 63)
- "Dikkat edin! Bedende bir et parçası vardır; o iyi olursa bütün beden iyi olur,
  o bozulursa bütün beden bozulur. Dikkat edin, o kalptir."
  (Buhârî, Îmân 39; Müslim, Müsâkât 107)
- "Yarım hurma ile de olsa ateşten korunun." (Buhârî, Zekât 10; Müslim, Zekât 67)
- "Kıyamet koparken birinizin elinde bir hurma fidanı varsa, onu dikmeye gücü yeterse
  hemen diksin." (Ahmed b. Hanbel, Müsned, III, 191; Buhârî, el-Edebü'l-müfred, 479)
- "Kim sabahleyin yedi acve hurması yerse, o gün ona ne zehir ne de sihir zarar verir."
  (Buhârî, Et‘ime 43; Müslim, Eşribe 155) — yalnızca Defter'deki Acve tür kartında.

Kartlarda kullanılmayan liste öğeleri (Fâtır 35:13, Nisâ 4:124, Nisâ 4:77, Kâf 50:10-11,
Yâsîn 36:68, Rûm 30:54, Rahmân 55:10-11) Defter'de ilgili sözlük maddesinin altında durur.

## 10. Kabul ölçütleri

- 1440×900 masaüstü ve 390×844 dokunmatik görünümde her bölüm yalnızca imleç/parmak
  hareketiyle tamamlanıyor; oyuncu hiçbir şey yapmasa da sahne takılı kalmıyor.
- Konsolda hata yok; çalışma anında dış alana ağ isteği yok.
- `npm run build` hatasız; `dist/` statik sunucudan ve alt klasörden açılınca çalışıyor.
- Ay evresi her bölümde doğru; B7'de sap→hilal dönüşümünde gözle görülür sıçrama yok.
- Ayet/hadis metni yalnızca `src/icerik.js` içinde ve §9 listesiyle birebir.
- `renderer.info` ile ölçülen çizim çağrısı sayısı sahne başına makul (hedef < 150).
