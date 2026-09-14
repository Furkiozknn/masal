// Tarayici deposuna tek kapi.
//
// `localStorage` site verisini reddeden bir tarayicida null dondurmuyor,
// **firlatiyor**. Safari'nin gizli sekmesi boyle yapiyor, "tum cerezleri
// engelle" boyle yapiyor. app.js bu dosyadan once dil tercihini modul
// seviyesinde okuyordu: o cagri firladiginda betik daha ilk satirinda oluyor
// ve cocuga bos bir sayfa aciliyordu. Hicbir konsola bakmayan bunu gormez.
//
// Dosya icindeki bazi cagrilar zaten try/catch icindeydi, bazilari degildi -
// sorun bir satir degil, tutarsizlik. Artik butun erisim buradan geciyor ve
// CI `localStorage.` kelimesinin baska bir dosyada gecmesine izin vermiyor,
// yani korumasiz bir cagri yeniden eklenemiyor.
//
// Depo kapaliysa uygulama calismaya devam eder, sadece hatirlamaz. Bu dogru
// takas: bir cocugun masali okuyamamasindansa ilerlemesinin kaydedilmemesi.

/** Okur; depo kapaliysa veya anahtar yoksa null. */
export function oku(anahtar) {
  try {
    return localStorage.getItem(anahtar);
  } catch {
    return null;
  }
}

/** Yazar; basarili olduysa true. Cagiran isterse bakar, cogu bakmaz. */
export function yaz(anahtar, deger) {
  try {
    localStorage.setItem(anahtar, deger);
    return true;
  } catch {
    return false;
  }
}

/** Siler; depo kapaliysa sessizce gecer. */
export function sil(anahtar) {
  try {
    localStorage.removeItem(anahtar);
    return true;
  } catch {
    return false;
  }
}

/** JSON okur. Bozuk icerik de kapali depo da ayni sonucu verir: yedek deger.
 *  Iki ayri try/catch yazmaya gerek kalmasin diye burada birlesiyor. */
export function okuJSON(anahtar, yedek) {
  const ham = oku(anahtar);
  if (ham === null) return yedek;
  try {
    return JSON.parse(ham);
  } catch {
    return yedek;
  }
}

/** JSON yazar. */
export function yazJSON(anahtar, deger) {
  try {
    return yaz(anahtar, JSON.stringify(deger));
  } catch {
    // Dairesel yapi gibi seyler JSON.stringify'i firlatir; kayit yoksa yok.
    return false;
  }
}
