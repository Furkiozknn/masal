# Masal

Çocuğun adına, yaşına ve şehrine göre yazılan uyku öncesi masalı, **içine
gömülü boyama alanlarıyla** birlikte tarayıcıda okutan web uygulaması.

İndirme yok, PDF yok: hikaye de boyama da uygulamanın içinde kalır.

## Ne çalışıyor (8 Eylül 2026)

| | |
|---|---|
| Hikaye üretimi | Şablon motoru — **API anahtarı gerektirmez**, maliyeti sıfır |
| Diller | Türkçe, İngilizce. Açılışta tarayıcı dilinden seçilir, üstten değiştirilebilir |
| Temalar | Deniz, Orman, Yıldızlar. Her biri 6 sayfa |
| Seçim noktası | Üçüncü sayfada hikaye ikiye ayrılıyor; üç tema × iki yol = altı okuma |
| Kitaplık | Okunan masallar birikiyor, kaldığı sayfadan devam ediliyor |
| Yaş | Punto ve sesli okuma hızı yaşa göre üç kademe |
| Kapanış | Masal bitince aynı çocuk için okunmamış temalar öneriliyor |
| Boyama | Sayfaya gömülü SVG sahne, bölgeye dokununca dolar |
| Kayıt | Boyama tarayıcıda saklanır, sayfa yenilense de durur |
| Türkçe ekler | Ünlü uyumu ve sert ünsüz benzeşmesi otomatik (`turkce.js`) |
| Sesli okuma | Tarayıcının konuşma motoru; cihazda o dilde ses yoksa düğme görünmez |
| Erişilebilirlik | Lighthouse mobil: erişilebilirlik, en iyi uygulamalar, SEO ve agentic browsing dördü de 100 |

## Çalıştırma

```
python -m http.server 8790
```
Sonra `http://127.0.0.1:8790/`. Derleme adımı yok, bağımlılık yok.

Test: `node turkce.test.js` ve `node hikayeler.test.js`

## Neden vektör (SVG) boyama

Rakipler raster (piksel) görsel üretiyor; o görseller ya boyanamıyor ya da
taşarak boyanıyor. Burada her boyanabilir bölge ayrı bir SVG şekli:

- Dokunulan bölge **temiz** dolar, konturun dışına taşmaz.
- Görsel üretim maliyeti **sıfır** — sahneler elle çizilmiş şablon.
- Boyama durumu birkaç yüz bayt; resim değil, bölge→renk eşlemesi saklanıyor.

## Dosyalar

| Dosya | İş |
|---|---|
| `index.html` | İki ekran: form ve okuyucu |
| `app.js` | Durum, sayfa geçişi, dallar, boyama, kitaplık, sesli okuma, dil |
| `hikayeler.js` | Şablon metinler (tr/en) ve doldurma motoru |
| `sahneler.js` | Boyanabilir SVG sahneler: oda, kumsal, orman, uzay |
| `turkce.js` | Hal eki üretici + `turkce.test.js` (28 durum) |
| `hikayeler.test.js` | Şablon yapısı: dil/tema eşliği, dal uzunlukları, çözülmemiş yer tutucu |

### Şablonlarda Türkçe ek

Şablona ek elle yazılmaz, yer tutucuyla istenir:

```
{sehir:de}  ->  Trabzon'da / Sinop'ta / İzmir'de
{ad:e}      ->  Elif'e / Ada'ya
{ad:i}      ->  Elif'i / Ada'yı
{sehir:in}  ->  Uşak'ın / kasabanın
```

"Trabzon'de" gibi tek bir hata ürünü anında ucuz gösterdiği için bu kurallar
koda gömülü ve testli.

## Sonraki adımlar

1. **LLM katmanı** — şablon yerine özgün hikaye. Anahtar sunucuda kalmalı,
   tarayıcıya konmaz. Şablon motoru yedek olarak kalır: API düşerse ürün çalışır.
2. **Sahne kütüphanesini büyütmek** — şu an 4 sahne. Hikaye çeşitliliği
   sahne sayısına bağlı.
3. **Ücretlendirme** — Türkiye'den tahsilat için Polar.sh / Lemon Squeezy
   (Stripe ve PayPal Türkiye'de yok).
4. **Ölçüm** — kaç ziyaretçi hikaye üretiyor, kaçı boyuyor, kaçı son sayfaya
   varıyor. Karar bu üç sayıya bakarak verilecek.

## Bilinen sınırlar

- Şablon hikayeler LLM kadar çeşitli değil. Seçim noktası tema başına iki yol
  veriyor ama olay örgüsü yine sabit.
- Ek motoru "saat'te / kalp'e" gibi ince okunan kalın yazımları bilmez.
- Boyama sadece o tarayıcıda durur; cihaz değişince gider.
- Sesli okuma cihazın yüklü seslerine bağlı: Türkçe sesi olmayan bir masaüstünde
  düğme hiç çıkmaz. Telefon ve tablette Türkçe ses standart.
