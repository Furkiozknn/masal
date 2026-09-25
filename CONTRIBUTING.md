# Katki Rehberi -- masal

Katkida bulunmak istedigin icin tesekkurler. Bu rehber, daha once hic
katki yapmamis birinin de ilk pull request'ini sorunsuz acabilmesi icin
yazildi.

Takildigin yerde issue acmaktan cekinme. **"Bu rehber su noktada
anlasilmiyor" da gecerli bir issue'dur** ve dokumantasyon hatasi olarak
islenir.

## 1. Gelistirme ortami

Bagimlilik ve derleme adimi yok: gereken tek sey Python 3 ve Node 20+.
(`npm ci` calismaz; kurulacak bir sey olmadigi icin package-lock.json da yok.)

```
git clone https://github.com/Furkiozknn/masal.git
cd masal
python3 sunucu.py        # http://127.0.0.1:8790/  (onbellek kapali)
```

`python -m http.server` yerine `sunucu.py` kullan: tarayici ES modullerini
onbellege aliyor ve degisikligin gorunmedigini sanirsin.

## 2. Degisikligi yapmadan once

- **Once issue ac.** Kucuk bir yazim hatasi disinda, dogrudan PR acmak
  yerine once ne yapmak istedigini yaz. Bu, ayni isi iki kisinin
  yapmasini ve kabul edilmeyecek bir isin bosa gitmesini onler.
- Var olan issue'lara bak; belki konu zaten tartisilmis.

## 3. Dal ve commit

Dal adi, ne yaptigini soylesin:

```
git checkout -b fix/bos-girdi-cokmesi
git checkout -b feat/json-cikti-secenegi
git checkout -b docs/kurulum-adimlari
```

Commit mesaji, **neden** yaptigini anlatsin -- ne yaptigin zaten diff'te
gorunuyor:

```
Bos girdide cokme yerine acik hata dondur

Kullanici bos dosya verdiginde IndexError firlatiyordu; hatanin
kaynagini gostermiyordu. Artik girdi dogrulanip anlamli bir mesajla
donuluyor.
```

## 4. Testler

```
node --test                      # ya da: npm test
```

Yeni davranis ekliyorsan **testini de ekle**. Hata duzeltiyorsan, once
hatayi yakalayan testi yaz, sonra duzelt -- boylece testin gercekten o
hatayi yakaladigindan emin olursun. app.js DOM'a bagli oldugu icin saf
mantigi ayri bir modulde tut (ornek: `boyama.js` + `boyama.test.js`).

Arayuze dokunan bir degisiklikte gercek tarayici denetimlerini de kostur
(Playwright ve axe-core bu deponun bagimliligi degil, anlik kuruluyor):

```
npm install --no-save --no-package-lock playwright-core axe-core
npx --yes playwright@1 install chromium
node arac/tarayici-dogrula.mjs
node arac/erisim-denetle.mjs
```

Yeni bir modul eklersen `sw.js`'teki `KABUK` listesine de yaz; unutursan
`node arac/sw-dogrula.mjs` (ve CI) soyler.

PR acildiginda ci.yml calisir: testler (Node 20 ve 22), sozdizimi, sayfanin
sunulmasi, tarayicida akis, erisilebilirlik ve gizlilik kapilari (indirme yok,
depoya tek kapi, ag cagrisi yalnizca olcum.js'te). Hepsi yesil olmadan
birlestirilmez.

## 5. Pull request

PR aciklamasinda uc sey olsun: **ne degisti, neden, nasil dogrulandi**.
Dogrulama bolumu onemli: "testler gecti" yeterli degil, hangi komutu
calistirdigin ve ne gordugun yazilmali. Gorunen bir degisiklikse ekran
goruntusu ekle.

Inceleme sirasinda degisiklik istenmesi normaldir ve isin kotu oldugu
anlamina gelmez. Sorulari cevaplamak da katkinin bir parcasi.

## 6. Neyi kabul etmiyoruz

- Sadece bicimlendirme degistiren, davranisa dokunmayan buyuk diff'ler
  (kod tabaninin gecmisini okunmaz hale getiriyor).
- Gerekcesi yazilmamis yeni bagimliliklar.
- Testi olmayan yeni ozellikler.
- Cocuga ait bir veriyi (ad, sehir, boyama) cihazdan cikaran her degisiklik.

## Davranis kurallari

Bu depoda [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) gecerlidir.