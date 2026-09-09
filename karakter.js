// Hikayenin kahramani: sahnede gorunen cocuk figuru.
//
// Tasarim karari — hangi parca boyanir:
//   ten, sac, goz, agiz  -> class="c", BOYANMAZ. Bunlar cocugun kendi gorunumu;
//                           kisisellestirmeden geliyor ve oyle kalmali.
//   kiyafet              -> class="b", BOYANIR. Cocuk kahramanini giydiriyor.
// Boyle olmasinin ikinci sebebi: kisisel parcalar varsayilan renkle gelseydi
// boyama sayaci onlari "boyanmis" sayardi ve "resmi bitirdin" hic tetiklenmezdi.
//
// Koordinatlar yerel: ayaklarin ortasi (0,0), yukarisi negatif. Toplam ~86 birim.
// Sahneye yerlestirme transform ile yapiliyor (bkz. sahneler.js yer tutucusu).

export const TEN_RENKLERI = ['#f6d3b8', '#e8b98f', '#c98d5f', '#a2673f', '#6f452a'];
export const SAC_RENKLERI = ['#2c2a26', '#5b3a1e', '#8a5a3b', '#c98b3a', '#e3c07a', '#a33b28'];
export const SAC_TIPLERI = ['kisa', 'uzun', 'kivircik'];

const SAC = {
  // kafa: merkez (0,-66), yaricap 16
  kisa: 'M-16 -68 A16 16 0 0 1 16 -68 Q0 -78 -16 -68 Z',
  // Uc ayri alt yol: ust sac + iki yandan sarkan tutam. Tek parca olarak
  // cizilirse yuzu tamamen kapatiyor; yuz acik kalmali.
  uzun: 'M-16 -68 A16 16 0 0 1 16 -68 Q0 -78 -16 -68 Z'
      + ' M-15 -71 L-20 -40 L-10 -44 L-12 -67 Z'
      + ' M15 -71 L20 -40 L10 -44 L12 -67 Z',
  kivircik: 'M-16 -68 a7 7 0 0 1 5 -9 a7 7 0 0 1 10 -5 a7 7 0 0 1 12 0 a7 7 0 0 1 5 14 Q0 -78 -16 -68 Z',
};

/**
 * @param {object} g gorunum: { ten, sac, sacTipi, kiyafet }
 * @returns {string} <g> icerigi; cagiran taraf transform verir.
 */
export function karakterSVG(g = {}) {
  const ten = g.ten || TEN_RENKLERI[0];
  const sac = g.sac || SAC_RENKLERI[1];
  const sacYolu = SAC[g.sacTipi] || SAC.kisa;
  return `
    <rect class="kisisel" fill="${ten}" x="-11" y="-24" width="9" height="25" rx="4"/>
    <rect class="kisisel" fill="${ten}" x="2" y="-24" width="9" height="25" rx="4"/>
    <rect class="kisisel" fill="${ten}" x="-27" y="-50" width="9" height="25" rx="4"/>
    <rect class="kisisel" fill="${ten}" x="18" y="-50" width="9" height="25" rx="4"/>
    <path class="b" data-ad="kıyafet" d="M-17 -53 h34 v29 a4 4 0 0 1 -4 4 h-26 a4 4 0 0 1 -4 -4 Z"/>
    <circle class="kisisel" fill="${ten}" cx="0" cy="-66" r="16"/>
    <path class="kisisel" fill="${sac}" d="${sacYolu}"/>
    <circle class="goz" cx="-6" cy="-66" r="2.2"/>
    <circle class="goz" cx="6" cy="-66" r="2.2"/>
    <path class="agiz" d="M-6 -59 q6 5 12 0"/>
  `;
}

/** Kaydedilebilir varsayilan gorunum. */
export function varsayilanGorunum() {
  return { ten: TEN_RENKLERI[0], sac: SAC_RENKLERI[1], sacTipi: 'kisa' };
}
