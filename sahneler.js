// Boyanabilir sahne kutuphanesi.
// Her sahne bir SVG dizesi. Kurallar:
//   class="b"  -> boyanabilir bolge (tiklayinca dolar). data-v = varsayilan renk.
//   class="c"  -> sadece kontur/dekor, tiklanamaz (pointer-events yok).
// LLM'e SVG cizdirmek yerine elle cizilmis sablon kullaniyoruz: kalite tutarli,
// gorsel uretim maliyeti sifir.
// ponytail: sabit sahne listesi. Sahne sayisi artarsa ayri JSON'a tasinir.

export const SAHNELER = {

  // --- Cocuk odasi: duvar, pencere, ay, yatak, hali ---
  oda: `
    <rect class="b" data-ad="duvar" x="0" y="0" width="400" height="205"/>
    <rect class="b" data-ad="zemin" x="0" y="205" width="400" height="55"/>
    <rect class="b" data-ad="gece göğü" x="248" y="38" width="104" height="86" rx="4"/>
    <circle class="b" data-ad="ay" cx="322" cy="62" r="14"/>
    <path class="c" d="M272 102 l3.5 7 7 3.5 -7 3.5 -3.5 7 -3.5 -7 -7 -3.5 7 -3.5 Z"/>
    <path class="c" d="M322 106 l2.5 5 5 2.5 -5 2.5 -2.5 5 -2.5 -5 -5 -2.5 5 -2.5 Z"/>
    <path class="c" d="M248 38 h104 v86 h-104 Z M300 38 v86 M248 81 h104"/>
    <rect class="b" data-ad="baş tahtası" x="34" y="138" width="18" height="76" rx="4"/>
    <rect class="b" data-ad="yatak"  x="46" y="174" width="176" height="40" rx="6"/>
    <rect class="b" data-ad="yorgan" x="112" y="162" width="110" height="34" rx="8"/>
    <rect class="b" data-ad="yastık" x="58" y="152" width="48" height="26" rx="11"/>
    <path class="c" d="M62 214 v18 M208 214 v18"/>
  `,

  // --- Kumsal: gokyuzu, deniz, kum, gunes, bulut, tarak kabugu, deniz yildizi ---
  kumsal: `
    <rect class="b" data-ad="gökyüzü" x="0" y="0" width="400" height="155"/>
    <rect class="b" data-ad="deniz"   x="0" y="155" width="400" height="45"/>
    <rect class="b" data-ad="kum"     x="0" y="200" width="400" height="60"/>
    <circle class="b" data-ad="güneş" cx="336" cy="46" r="26"/>
    <path class="b" data-ad="bulut" d="M62 78 A18 18 0 0 1 80 60 A22 22 0 0 1 118 64 A16 16 0 0 1 126 78 Z"/>
    <path class="b" data-ad="kabuk-1" d="M200 248 L148 248 A52 52 0 0 1 157.9 217.4 Z"/>
    <path class="b" data-ad="kabuk-2" d="M200 248 L157.9 217.4 A52 52 0 0 1 183.9 198.5 Z"/>
    <path class="b" data-ad="kabuk-3" d="M200 248 L183.9 198.5 A52 52 0 0 1 216.1 198.5 Z"/>
    <path class="b" data-ad="kabuk-4" d="M200 248 L216.1 198.5 A52 52 0 0 1 242.1 217.4 Z"/>
    <path class="b" data-ad="kabuk-5" d="M200 248 L242.1 217.4 A52 52 0 0 1 252 248 Z"/>
    <path class="b" data-ad="deniz yıldızı" d="M75 210 L80.3 224.7 L95.9 225.2 L83.6 234.8 L87.9 249.8 L75 241 L62.1 249.8 L66.4 234.8 L54.1 225.2 L69.7 224.7 Z"/>
    <path class="c" d="M18 170 q11 -7 22 0 t22 0 M120 182 q11 -7 22 0 t22 0 M262 168 q11 -7 22 0 t22 0 M330 186 q11 -7 22 0 t22 0" fill="none"/>
  `,

  // --- Orman: gokyuzu, cimen, iki agac, tilki yavrusu ---
  orman: `
    <rect class="b" data-ad="gökyüzü" x="0" y="0" width="400" height="196"/>
    <rect class="b" data-ad="çimen"   x="0" y="196" width="400" height="64"/>
    <rect class="b" data-ad="gövde-1" x="58" y="120" width="26" height="80" rx="3"/>
    <path class="b" data-ad="yaprak-1" d="M71 24 L118 92 L94 92 L128 140 L14 140 L48 92 L24 92 Z"/>
    <rect class="b" data-ad="gövde-2" x="330" y="140" width="20" height="60" rx="3"/>
    <path class="b" data-ad="yaprak-2" d="M340 62 L378 120 L358 120 L384 156 L296 156 L322 120 L302 120 Z"/>
    <path class="b" data-ad="tilki-kuyruk" d="M182 206 C132 186 104 230 144 241 C160 245 174 226 182 216 Z"/>
    <ellipse class="b" data-ad="tilki-gövde" cx="196" cy="212" rx="46" ry="25"/>
    <circle class="b" data-ad="tilki-kafa" cx="250" cy="196" r="24"/>
    <path class="b" data-ad="tilki-kulak-1" d="M234 178 L230 156 L248 170 Z"/>
    <path class="b" data-ad="tilki-kulak-2" d="M262 172 L274 154 L272 180 Z"/>
    <path class="b" data-ad="tilki-burun" d="M268 200 L286 205 L268 212 Z"/>
    <circle class="c" cx="256" cy="192" r="3" fill="#2c2a26" stroke="none"/>
    <rect class="b" data-ad="bacak-1" x="172" y="230" width="14" height="18" rx="4"/>
    <rect class="b" data-ad="bacak-2" x="212" y="230" width="14" height="18" rx="4"/>
    <path class="c" d="M0 204 q10 -8 20 0 M40 206 q10 -8 20 0 M380 204 q10 -8 20 0" fill="none"/>
  `,
};

// Sahnenin varsayilan (bos) hali disinda ilk acilista bazi bolgeler dolu gelsin
// istemiyoruz: bos boyama kitabi mantigi. Renk secimi tamamen cocugun.
export const SAHNE_ADLARI = Object.keys(SAHNELER);
