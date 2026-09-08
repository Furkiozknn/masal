// Turkce cekim eki uretici: isim ve sehir adlarina dogru eki takar.
// Kisisellestirilmis metinde "Trabzon'de" gibi bir hata urunu aninda ucuz gosterir,
// o yuzden bu kurallar sablonlara elle yazilmaz, buradan uretilir.
// Kapsam: buyuk/kucuk unlu uyumu, sert unsuz benzesmesi, kaynastirma harfi.
// ponytail: "saat'te / kalp'e" gibi ince okunan kalin yazimlar ve yabanci
// kokenli istisnalar kapsam disi. Istisna listesi gerekirse ISTISNA'ya eklenir.

const KALIN = 'aıou';
const SERT = 'fstkçşhp';
const UNLULER = 'aıoueiöü';

/** Kelimenin son unlusu; bulunamazsa ince kabul edilir. */
function sonUnlu(kelime) {
  const k = kelime.toLocaleLowerCase('tr');
  for (let i = k.length - 1; i >= 0; i--) if (UNLULER.includes(k[i])) return k[i];
  return 'e';
}

/**
 * @param {string} kelime  Ek takilacak sozcuk (ornek: "Trabzon", "Ada")
 * @param {'de'|'den'|'e'|'i'|'in'|'le'} tip  Hal eki
 * @param {boolean} ozel   Ozel isim mi? Ozel isimde ek kesme isaretiyle ayrilir.
 * @returns {string} Sadece ek (ornek: "'da"). Kelimeyle birlestirmek cagirana ait.
 */
export function ek(kelime, tip, ozel = true) {
  const k = String(kelime || '').trim();
  if (!k) return '';
  const u = sonUnlu(k);
  const son = k[k.length - 1].toLocaleLowerCase('tr');
  const unluBitis = UNLULER.includes(son);
  const kalin = KALIN.includes(u);

  const iki = kalin ? 'a' : 'e';                                  // buyuk unlu uyumu
  const dort = 'aı'.includes(u) ? 'ı' : 'ei'.includes(u) ? 'i'    // kucuk unlu uyumu
             : 'ou'.includes(u) ? 'u' : 'ü';
  const d = SERT.includes(son) ? 't' : 'd';                       // sert unsuz benzesmesi
  const ayir = ozel ? "'" : '';

  switch (tip) {
    case 'de':  return `${ayir}${d}${iki}`;                       // Trabzon'da / Sinop'ta
    case 'den': return `${ayir}${d}${iki}n`;                      // İzmir'den
    case 'e':   return `${ayir}${unluBitis ? 'y' : ''}${iki}`;    // Elif'e / Ada'ya
    case 'i':   return `${ayir}${unluBitis ? 'y' : ''}${dort}`;   // Elif'i / Ada'yı
    case 'in':  return `${ayir}${unluBitis ? 'n' : ''}${dort}n`;  // Elif'in / Ada'nın
    case 'le':  return `${ayir}${unluBitis ? 'y' : ''}l${iki}`;   // Elif'le / Ada'yla
    default:    return '';
  }
}

/** Kelime + ek. */
export const ekle = (kelime, tip, ozel = true) => kelime + ek(kelime, tip, ozel);
