// Boyamanin geri al gecmisi. DOM'a dokunmaz; app.js bolgeleri boyar, bu dosya
// neyin geri alinacagini tutar.
//
// Her adim bir DEGISIM: { bolgeNo: oncekiRenk }. Tek dokunus tek bolge tasir,
// "Temizle" o anki resmin tamamini tasir.
//
// Neden ayri dosya: ilk halinde "Temizle" gecmise hic yazilmiyordu. Palette
// "Geri al"in hemen yaninda duran bu dugmeye yanlislikla dokunan bir cocuk,
// bitirdigi resmi geri getiremiyordu -- "Geri al" temizlemeden onceki son
// dokunusu geri aliyor, o da zaten bos bir bolgeyi bos yapiyordu. Kural artik
// burada ve testli (boyama.test.js): temizle -> geri al = resim eskisi gibi.

/** Gecmis sinirsiz buyumesin: tek oturumda yuzlerce dokunus olagan. */
export const GECMIS_SINIRI = 200;

/**
 * Bir adimi gecmise ekler. Bos degisim eklenmez (bos sayfada "Temizle"
 * geri alinacak bir sey birakmamali).
 * @param {Array} gecmis   app.js'teki gecmis dizisi (yerinde degisir)
 * @param {string} anahtar Sayfanin kayit anahtari: gecmis sayfalar arasinda karismaz
 * @param {Record<number,string>} degisim { bolgeNo: oncekiRenk } ('' = boyasiz)
 */
export function adimEkle(gecmis, anahtar, degisim) {
  if (!degisim || !Object.keys(degisim).length) return;
  gecmis.push({ anahtar, degisim: { ...degisim } });
  if (gecmis.length > GECMIS_SINIRI) gecmis.splice(0, gecmis.length - GECMIS_SINIRI);
}

/**
 * Bu sayfanin son adimini gecmisten cikarir ve geri yuklenecek renkleri
 * dondurur; geri alinacak bir sey yoksa null. Baska sayfalarin adimlarina
 * dokunmaz.
 */
export function sonAdimiAl(gecmis, anahtar) {
  for (let i = gecmis.length - 1; i >= 0; i--) {
    if (gecmis[i].anahtar !== anahtar) continue;
    return gecmis.splice(i, 1)[0].degisim;
  }
  return null;
}

/** Temizlemeden once alinan goruntu: yalnizca boyali bolgeler. */
export function boyaliBolgeler(dolgular) {
  const d = {};
  dolgular.forEach((renk, i) => { if (renk) d[i] = renk; });
  return d;
}
