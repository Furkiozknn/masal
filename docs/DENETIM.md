# Denetim: masal (29 Eylül 2026)

Yenilemeden önce eski sürümde, yerelde (`python sunucu.py`) ve canlıda (`https://furkiozknn.github.io/masal/`) ölçüldü. Ölçülmeyen bir şey yazılmadı.

## README komutları

| Komut | Sonuç |
|---|---|
| `node --test` (`npm test`) | 108 test geçti (yenileme sonrası 125) |
| `python sunucu.py` | 8790'da açılıyor, önbellek kapalı, sayfa 200 |
| `node arac/sw-dogrula.mjs` | geçti |
| `node arac/erisim-denetle.mjs` | geçti (6 ekran, WCAG 2.1 AA) |
| `node arac/tarayici-dogrula.mjs` | akış, temizle/geri al, dağıtım, çevrimdışı geçti |
| `node arac/ekran-yakala.mjs` | README görsellerini üretiyor |

Bulunan iki araç hatası (uygulamada değil, `arac/` içinde), düzeltildi:
- Üç betik, sunucu hazır mı diye `fetch(...).ok` çağırıp gövdeyi hiç tüketmiyordu. Node 24.19'da bu, undici içinde `AssertionError: assert(!this.paused)` ile betiği daha ilk satırlarda öldürüyordu (yerelde `erisim-denetle` ve `tarayici-dogrula` hiç başlamadı). Gövde artık tüketiliyor (`hazirMi`).
- `tarayici-dogrula` sonunda Windows'ta geçici klasörü silerken `EPERM` ile çöküyordu; artık yutuluyor (geçici kopya).

## Ana akış (tarayıcıda, Chromium/Playwright)

Ad-yaş-şehir → masal → boyama → seçim → son sayfa → kitaplık → yenileyip kitaplıktan devam: 390 ve 1012 px'te çalışıyor, konsol temiz, yatay taşma yok. Ekran görüntüleri: `kanit/masal/once/` (390x844 ve 1280x800, 7'şer ekran).

Eski sürümde gözlenen eksikler (yeniden tasarımın gerekçesi):
- İlk ekranda dört alan + kahraman görünümü seçicisi (10+ nokta) birlikte; "Masalı oluştur" altta ve küçük.
- Dokunma hedefleri: palet 32 px, kahraman noktaları 27 px, "geri al/temizle" ~30 px yükseklik (çocuk için küçük).
- "‹ Önceki" düğmesi 390 px'te iki satıra kırılıyordu.
- Masal sonu yalnızca bir metin satırı ("Masal bitti. İyi geceler!") ve tema önerisiydi; bir son an yoktu.
- Boyamada dokunma geri bildirimi yok, ilerleme yalnızca "n/12" metni.
- Odak halkası yalnızca alanlarda; düğmelerde tarayıcı varsayılanı; ekran değişince odak taşınmıyordu; atlama bağlantısı yok.
- Altbilgi yok.
- `dilSec()` Node 20'de (`navigator` yok) argümansız çağrılırsa `ReferenceError` verirdi (uygulama tarayıcıda hiç tetiklemiyor, CI'da Node 20 matrisi var).

## Dil kabuğu (gerçek durum)

Talimatta "masal metinleri Türkçe, İngilizce masal uydurma" deniyordu; depo zaten altı temanın **İngilizce şablonlarını** taşıyor (`hikayeler.js`, `en` paketi; testler dil/tema eşliğini kilitliyor). Bu çalışan çekirdek olduğu için kaldırılmadı ve yenisi yazılmadı: arayüz dili seçilince masal o dilde geliyor. Türkçe ek motoru yalnızca `tr`'de devrede. Varsayılan dil `navigator.language` (`tr*` Türkçe, geri kalan İngilizce), tercih `localStorage` `masal:dil`'de (anahtar değişmedi).

## Lighthouse 12 (Chrome headless; mobil: simüle yavaş 4G)

| | Perf | Erişilebilirlik | Best practices | SEO | FCP | LCP | TBT | CLS | Boyut |
|---|---|---|---|---|---|---|---|---|---|
| Önce, canlı mobil | 100 | 100 | 100 | 100 | 1,0 s | 1,0 s | 0 | 0,009 | 45 KiB |
| Önce, canlı masaüstü | 100 | 100 | 100 | 100 | 0,2 s | 0,2 s | 0 | 0,003 | 45 KiB |
| Önce, yerel mobil | 100 | 100 | 100 | 100 | 1,0 s | 1,3 s | 0 | 0,009 | 103 KiB |
| Önce, yerel masaüstü | 100 | 100 | 100 | 100 | 0,4 s | 0,4 s | 0 | 0,003 | 103 KiB |
| Sonra, yerel mobil | 100 | 100 | 96-100 | 100 | 1,1 s | 1,2 s | 0 | 0 | 113 KiB |
| Sonra, yerel masaüstü | 100 | 100 | 100 | 100 | 0,3 s | 0,4 s | 0 | 0 | 113 KiB |

Not: yerel ölçümde `errors-in-console` denetimi ardışık koşularda bir kez mobilde, bir kez masaüstünde düştü (best practices 96); tekrar koşuda geçti. Playwright'ta her iki genişlikte konsol temiz, tarayıcı testi de temiz; yerel sunucudaki HTTP/1.0 bağlantı kapanışından kaynaklanan aralıklı bir istek olarak değerlendirildi, tekrarlanabilir bir hata bulunamadı. Yerel boyut (yalnızca sıkıştırmasız yerel sunucu) canlıdaki gzip'li değerle karşılaştırılamaz; yerel önce/sonra aynı koşulda (103 -> 113 KiB, +10 KiB, yeni CSS/JS ve i18n metinleri).

Lighthouse yalnızca formu ölçer; okuyucu ekranları `arac/erisim-denetle.mjs` ile ayrı denetleniyor.

## Erişilebilirlik ve kontrast

- axe-core WCAG 2.1 AA: yenileme sonrası **8 ekran** (form, kahraman ayarı açık, İngilizce form, okuyucu, boyanmış sayfa, seçim, son sayfa/masal sonu kartı, kitaplık) ihlalsiz.
- Kontrast (hesaplandı, `kontrast.test.js` kilitliyor): en düşük metin çifti 4,74:1 (soluk metin/beyaz), yeni çiftler 5,03-16,50:1; metin dışı en düşük 3,76:1 (ilerleme çubuğu).
- Dokunma hedefi: tarayıcı testi form ve okuyucuda 44 px altı görünür `button/select/input/summary` bırakmadı.
- Klavye/odak: 3 px görünür odak halkası, atlama bağlantısı, ekran değişince odak başlığa, `aria-live` metin, `role=progressbar`.
- `prefers-reduced-motion`: sayfa geçişi, pop, ödül ve masal sonu animasyonu kapanıyor (tarayıcı testi `animationName === none` doğruluyor).

## "Ekosistem denetimi" (#19)

Bu depoya ait tek bulgu: "project-meta.json 108, meta-source.json 92" (hub/profil sayfası ayrışması). Bu depoda düzeltilecek şey yok (doğru sayı depodakidir; yenileme sonrası 125, `project-meta.json` güncellendi); `meta-source.json` profil deposunda ve meta-source ayrışması kararı Furki'de. Konu bu işle kapatılmadı: kapatmak workflow'un işi ve konuda başka depolar var.

## Çözülemeyenler

- Eski sesli tanıtım videosu (`docs/reel/reel.mp4`) yeniden üretilemedi ve eski arayüzü gösteriyordu; README'den çıkarıldı, dosya silindi (git geçmişinde duruyor). Yerine gerçek kullanımdan sessiz ekran kaydı GIF'i kondu.
