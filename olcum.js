// Olcum noktalari.
//
// Neden simdi: hangi olaylarin sayilacagi urunun karar kriteri. Arastirma
// "kac ziyaretci hikaye uretiyor, kaci boyuyor, kaci son sayfaya variyor"
// diyordu; o uc sayi asagidaki olaylardan cikiyor. Noktalari sonradan koda
// serpistirmek zor, simdi ucuz.
//
// Su an HICBIR YERE GONDERMIYOR. UC null oldugu surece fonksiyon sessizce
// donuyor: sunucu yok, ucuncu taraf yok, cerez yok, istek yok.
// Yayin cozulunce buraya tek bir adres yazilir.
//
// GIZLILIK KURALI — bu dosyadan disari cocuga ait hicbir sey cikmaz:
// ad, sehir, boyama gorseli ve serbest metin asla gonderilmez. Yalnizca
// tema anahtari, yas kademesi ve sayilar gider. Yeni bir olay eklerken
// veriyi buradaki `temiz()` suzgecinden gecir.

const UC = null;                    // ornek: 'https://olcum.ornek/olay'
const IZIN_VERILEN = new Set(['tema', 'yasKademesi', 'sayfa', 'toplamSayfa', 'dal', 'bolge', 'dil']);

/** Yalnizca izin verilen, kisisel olmayan alanlari birakir. Disa aciliyor
 *  cunku gizlilik kurali testli olmali (bkz. olcum.test.js). */
export function temiz(veri) {
  const c = {};
  for (const [k, v] of Object.entries(veri || {})) {
    if (!IZIN_VERILEN.has(k)) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') c[k] = v;
  }
  return c;
}

/** Yasi tek tek degil grup olarak gonder: kisi tanimlamayi zorlastirir.
 *  (app.js'teki punto/hiz ayarlayan yasKademesi ile karistirma.) */
export function yasGrubu(yas) {
  const y = Number(yas) || 0;
  return y <= 4 ? '3-4' : y <= 6 ? '5-6' : '7-9';
}

export function olay(ad, veri = {}) {
  if (!UC) return;
  try {
    const govde = JSON.stringify({ ad, ...temiz(veri), t: Date.now() });
    if (navigator.sendBeacon) navigator.sendBeacon(UC, govde);
    else fetch(UC, { method: 'POST', body: govde, keepalive: true });
  } catch { /* olcum hicbir zaman urunu bozmaz */ }
}
