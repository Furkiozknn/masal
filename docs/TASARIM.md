# Tasarım: masal arayüz yenilemesi (29 Eylül 2026)

## Hedef

Bir ebeveyn ilk 30 saniyede şunu anlamalı ve yapabilmeli: "çocuğumun adına masal yazıyor, kayıt/indirme yok" ve tek büyük düğmeyle masalı açmalı. Çocuk için: büyük dokunma hedefleri, boyarken anlık geri bildirim, bitirince bir ödül anı, masal sonunda sakin bir kapanış.

Kimlik korunur: sıcak kâğıt zemin, Georgia başlıklar, terrakota vurgu, altı temanın sahneleri. FRK-OS'in siyah-krem-sarı dili yalnızca altbilgideki küçük "FRK-OS" satırında.

Kullanıcı kuralları korunur: **indirme yok**, boyama hikâyenin içinde. Yerel kayıt anahtarları (`masal:son`, `masal:dil`, `masal:gorunum`, `masal:kitaplik`, `masal:boya:*`) değişmedi; taşıma kodu gerekmedi.

## Önce / sonra

| Konu | Önce | Sonra |
|---|---|---|
| İlk ekran | 4 alan + kahraman seçici + küçük düğme | 4 alan, güven satırı (Kayıt yok · İndirme yok · Veri cihazdan çıkmaz), kahraman ayarı **isteğe bağlı açılır kutu** (önizleme her zaman görünür), tek 58 px "Masalı oluştur" |
| Dokunma hedefi | palet 32, kahraman noktası 27 px | hepsi >= 44 px (nokta görünümü aynı, dokunma alanı büyük) |
| Boyama | yalnızca dolgu, "n/12" metni | dokunulan bölge "pop", destekleyen cihazda kısa titreşim, ilerleme çubuğu (`progressbar`), bitince renk akışı çerçevesi + gökkuşağı çubuk |
| Sayfa çevirme | aşağıdan belirme | yön duyarlı yumuşak yatay itme (ileri sağdan, geri soldan) |
| Masal sonu | tek satır metin | "İyi geceler, Ada!" kartı: ay + yıldızlar, dairesel açılış, "Baştan oku"; altında tema önerileri |
| Diller | TR/EN seçici, bazı kabuk metinleri sabit Türkçe | TR/EN kabuğun tamamı (etiketler, atlama bağlantısı, güven satırı, masal sonu, altbilgi); varsayılan `navigator.language` |
| Erişilebilirlik | odak halkası yalnız alanlarda | her yerde görünür odak, atlama bağlantısı, odak yönetimi, `aria-live` metin |
| Altbilgi | yok | küçük FRK-OS satırı |

Görseller: `kanit/masal/once/`, `sonra/` (TR), `sonra-en/` (EN); mobil 390x844 ve masaüstü 1280x800: form, masal, boyama, seçim, son, son-alt, kitaplık.

## Ekranlar

1. **Form**: başlık, tek cümle, güven satırı, ad/yaş/şehir/konu, kahraman ayarı (kapalı), büyük düğme, kitaplık (doluysa).
2. **Okuyucu**: metin (yaşa göre punto), Dinle, seçim noktası, boyanabilir sahne + palet + geri al/temizle + ilerleme, gezinti.
3. **Masal sonu**: son sayfada metnin altında kart; tema önerileri ve "Yeni masal".

## Video sisteminden alınanlar

Kaynak: `sosyal/uret/sahne.js` ve `tema.mjs`.

| Ne | Nereden | Nerede kullanıldı |
|---|---|---|
| `iris` (ortadan büyüyen daire, 0,45 sn, power2.inOut) | `sahne.js` geçişleri | masal sonu kartının açılışı (`clip-path: circle`, 0,9 sn, sola yakın merkezli) |
| `yatay` / `itme` (xPercent kayma, expo çıkış) | `sahne.js` geçişleri | sayfa çevirme: 24 px yatay itme + belirme, `cubic-bezier(.16,1,.3,1)` |
| "kâğıt" temasının sakin renk akışı (`#ffd9cf #fff0b3 #d9f2dc #d6e4ff`) | `tema.mjs` `kagit.akis` | resim bitince çerçevenin sırayla renk değiştirmesi; masal sonu kartı zemini (mavi-sarı degrade) |

Bilerek alınmayanlar: glitch, blok, flaş, zoom, kararma (çocuk için sert veya uykuyu böler). Video temalarının koyu/neon paletleri ürün kimliğine uymadığı için alınmadı.

## Kararlar ve sınırlar

- Servis işçisi: uygulama kabuğu "önce ağ" olduğu için yayında kullanıcıya ilk yenilemede ulaşır; yeni dosya eklenmediği için `KABUK` listesi ve `SURUM` değişmedi (yalnızca önbellek biçimi değişirse artırılır). `sw-dogrula` ve dağıtım testi geçti.
- Koyu (gece) tema yapılmadı; kapsam dışı.
- Ödül anı çocuğa özel mesaj içermez, ses yok.
- Kayıt aracı (README GIF'i, günlük video ekran kaydı) dokunma halkasını yalnızca kayıt betiğinde çizer; ürünün parçası değil.

## Test

`node --test`: 108 -> 125 (dil kabuğu, kabuk metinleri, kontrast). Tarayıcı: dil kabuğu (en-US/tr-TR, kalıcılık), 44 px hedefler, odak yönetimi, ilerleme çubuğu, pop, masal sonu kartı, "Baştan oku", `prefers-reduced-motion`. axe: 8 ekran.
