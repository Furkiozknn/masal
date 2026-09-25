# Guvenlik Politikasi

## Desteklenen surumler

Bu proje GitHub Pages'te `master` dalindan yayinlanan bir web uygulamasi;
yalnizca **`master`'in son hali** (yani canli site) desteklenir. Duzeltme
`master`'a girdigi anda yayina cikar.

## Kapsam icinde ozellikle

Bu bir cocuk uygulamasi ve verdigi sozler guvenlik konusu sayilir:

- Cocuga ait bir verinin (ad, sehir, kahramanin gorunumu, boyama) cihazdan
  cikmasi -- ag istegi, servis iscisi, indirme ya da baska bir yolla.
- Kullanici girdisinin (ad, sehir) sayfaya HTML olarak girmesi (XSS).
- `olcum.js` gizlilik suzgecini atlatan bir alan.

## Acik bildirimi

**Guvenlik aciklarini normal issue olarak acmayin.** Acik issue, yama
hazir olmadan once sorunu herkese duyurur.

Bunun yerine GitHub'in ozel bildirim kanalini kullanin:

1. Bu deponun **Security** sekmesine gidin.
2. **Report a vulnerability** baglantisina tiklayin.
3. Formu doldurun. Bildirim yalnizca depo sahibine gorunur.

Bu kanal kapaliysa veya calismiyorsa, GitHub uzerinden depo sahibine
dogrudan mesaj gonderip ozel bir kanal talep edin.

## Bildirimde ne olmali

Faydali bir bildirim su dordunu icerir:

- **Etkilenen surum veya commit.** `git rev-parse HEAD` ciktisi ideal.
- **Yeniden uretme adimlari.** Mumkunse en kucuk calisan ornek.
- **Etki.** Saldirgan bu acikla ne yapabiliyor -- veri okuma, kod
  calistirma, servis disi birakma?
- **Ortam.** Tarayici ve surumu, isletim sistemi.

## Sureclerin takvimi

| Adim | Hedef sure |
|---|---|
| Bildirimin alindiginin teyidi | 72 saat |
| Ilk degerlendirme (gecerli mi, ne kadar ciddi) | 7 gun |
| Duzeltme veya azaltma plani | 30 gun |
| Kamuya aciklama | Duzeltme yayinlandiktan sonra |

Bu bir taahhut degil hedeftir; tek kisilik bir projede gecikme olabilir.
Sure asilirsa bildirimi yapan kisiye durum bilgisi verilir.

## Kapsam disi

Asagidakiler guvenlik acigi olarak islenmez:

- Otomatik tarayici ciktilarinin, gercek bir saldiri senaryosu
  gosterilmeden dogrudan yapistirilmasi.
- Yalnizca kullanicinin kendi makinesinde, kendi yetkisiyle
  yapabilecegi islemler.
- Bagimliliklardaki, bu projenin kullandigi kod yolunu etkilemeyen
  bildirilmis acikla. (Yine de bildirmek isterseniz normal issue uygun.)

## Tesekkur

Sorumlu bildirim yapan kisiler, aksini istemedikleri surece duzeltme
notlarinda anilir.