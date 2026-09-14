// Boyanabilir sahne kutuphanesi.
// Her sahne bir SVG dizesi. Kurallar:
//   class="b"  -> boyanabilir bolge (tiklayinca dolar). data-v = varsayilan renk.
//   class="c"  -> sadece kontur/dekor, tiklanamaz (pointer-events yok).
// LLM'e SVG cizdirmek yerine elle cizilmis sablon kullaniyoruz: kalite tutarli,
// gorsel uretim maliyeti sifir.
// Dokunma kurali: boyanabilir hicbir sekil en dar yerinde ~20 viewBox biriminden
// ince olmasin. Mobilde sahne ~341px genislikte cizildigi icin bu ~17 CSS px eder;
// altina inen sekilleri kucuk parmaklar isabet ettiremiyor.
// ponytail: sabit sahne listesi. Sahne sayisi artarsa ayri JSON'a tasinir.

export const SAHNELER = {

  // --- Cocuk odasi: duvar, pencere, ay, yatak, hali ---
  oda: `
    <rect class="b" data-ad="duvar" x="0" y="0" width="400" height="205"/>
    <rect class="b" data-ad="zemin" x="0" y="205" width="400" height="55"/>
    <rect class="b" data-ad="gece göğü" x="248" y="38" width="104" height="86" rx="4"/>
    <circle class="b" data-ad="ay" cx="322" cy="62" r="14"/>
    <path class="c parilti" style="--gecikme:0s"   d="M272 102 l3.5 7 7 3.5 -7 3.5 -3.5 7 -3.5 -7 -7 -3.5 7 -3.5 Z"/>
    <path class="c parilti" style="--gecikme:1.4s" d="M322 106 l2.5 5 5 2.5 -5 2.5 -2.5 5 -2.5 -5 -5 -2.5 5 -2.5 Z"/>
    <path class="c" d="M248 38 h104 v86 h-104 Z M300 38 v86 M248 81 h104"/>
    <rect class="b" data-ad="baş tahtası" x="28" y="136" width="26" height="78" rx="5"/>
    <rect class="b" data-ad="yatak"  x="46" y="174" width="176" height="40" rx="6"/>
    <rect class="b" data-ad="yorgan" x="112" y="162" width="110" height="34" rx="8"/>
    <rect class="b" data-ad="yastık" x="58" y="152" width="48" height="26" rx="11"/>
    <!--KARAKTER:310,242,0.9-->
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
    <path class="b canlanir-salla" data-ad="deniz yıldızı" d="M75 210 L80.3 224.7 L95.9 225.2 L83.6 234.8 L87.9 249.8 L75 241 L62.1 249.8 L66.4 234.8 L54.1 225.2 L69.7 224.7 Z"/>
    <path class="c dalga" style="--gecikme:0s"   d="M18 170 q11 -7 22 0 t22 0 M262 168 q11 -7 22 0 t22 0" fill="none"/>
    <!--KARAKTER:330,250,0.9-->
    <path class="c dalga" style="--gecikme:1.8s" d="M120 182 q11 -7 22 0 t22 0 M330 186 q11 -7 22 0 t22 0" fill="none"/>
  `,

  // --- Orman: gokyuzu, cimen, iki agac, tilki yavrusu ---
  orman: `
    <rect class="b" data-ad="gökyüzü" x="0" y="0" width="400" height="196"/>
    <rect class="b" data-ad="çimen"   x="0" y="196" width="400" height="64"/>
    <rect class="b" data-ad="gövde-1" x="58" y="120" width="26" height="80" rx="3"/>
    <path class="b" data-ad="yaprak-1" d="M71 24 L118 92 L94 92 L128 140 L14 140 L48 92 L24 92 Z"/>
    <rect class="b" data-ad="gövde-2" x="330" y="140" width="20" height="60" rx="3"/>
    <path class="b" data-ad="yaprak-2" d="M340 62 L378 120 L358 120 L384 156 L296 156 L322 120 L302 120 Z"/>
    <path class="b canlanir-salla" data-ad="tilki-kuyruk" d="M182 206 C132 186 104 230 144 241 C160 245 174 226 182 216 Z"/>
    <ellipse class="b" data-ad="tilki-gövde" cx="196" cy="212" rx="46" ry="25"/>
    <circle class="b" data-ad="tilki-kafa" cx="250" cy="196" r="24"/>
    <path class="b" data-ad="tilki-kulak-1" d="M236 180 L226 154 L250 168 Z"/>
    <path class="b" data-ad="tilki-kulak-2" d="M258 174 L280 150 L276 182 Z"/>
    <path class="b" data-ad="tilki-burun" d="M266 196 L294 205 L266 215 Z"/>
    <circle class="c" cx="256" cy="192" r="3" fill="#2c2a26" stroke="none"/>
    <rect class="b" data-ad="bacak-1" x="168" y="228" width="22" height="22" rx="5"/>
    <rect class="b" data-ad="bacak-2" x="208" y="228" width="22" height="22" rx="5"/>
    <path class="c" d="M0 204 q10 -8 20 0 M40 206 q10 -8 20 0 M380 204 q10 -8 20 0" fill="none"/>
    <!--KARAKTER:318,252,0.85-->
    <!-- dekoratif dusen yapraklar: boyanmaz, sadece agir agir suzulur -->
    <path class="c dusen-yaprak" style="--gecikme:0s"   d="M150 40 q7 -9 14 0 q-7 9 -14 0 Z"/>
    <path class="c dusen-yaprak" style="--gecikme:5s"   d="M290 30 q6 -8 12 0 q-6 8 -12 0 Z"/>
    <path class="c dusen-yaprak" style="--gecikme:9.5s" d="M216 52 q6 -8 12 0 q-6 8 -12 0 Z"/>
  `,

  // --- Gece gokyuzu: ay, yildizlar, tepeler, roket ---
  uzay: `
    <!-- gok, tepe egrisinin en alcak noktasindan (y~225) asagi uzatildi: aksi halde
         egri ile dikdortgen arasinda boyanmayan beyaz serit kaliyor -->
    <rect class="b" data-ad="gece göğü" x="0" y="0" width="400" height="245"/>
    <circle class="b" data-ad="ay" cx="62" cy="52" r="27"/>
    <path class="b" data-ad="yıldız-1" d="M129 48 l4 7.5 7.5 4 -7.5 4 -4 7.5 -4 -7.5 -7.5 -4 7.5 -4 Z"/>
    <path class="b" data-ad="yıldız-2" d="M330 34 l4 7.5 7.5 4 -7.5 4 -4 7.5 -4 -7.5 -7.5 -4 7.5 -4 Z"/>
    <path class="b" data-ad="yıldız-3" d="M350 110 l4 7.5 7.5 4 -7.5 4 -4 7.5 -4 -7.5 -7.5 -4 7.5 -4 Z"/>
    <path class="b" data-ad="yıldız-4" d="M110 130 l4 7.5 7.5 4 -7.5 4 -4 7.5 -4 -7.5 -7.5 -4 7.5 -4 Z"/>
    <path class="b canlanir-suzul" data-ad="alev" d="M234 178 Q250 220 266 178 Z"/>
    <path class="b canlanir-suzul" data-ad="kanat-1" d="M228 138 L204 184 L228 178 Z"/>
    <path class="b canlanir-suzul" data-ad="kanat-2" d="M272 138 L296 184 L272 178 Z"/>
    <path class="b canlanir-suzul" data-ad="roket" d="M250 60 C267 82 273 106 273 132 L273 178 L227 178 L227 132 C227 106 233 82 250 60 Z"/>
    <circle class="b canlanir-suzul" data-ad="pencere" cx="250" cy="118" r="14"/>
    <path class="b" data-ad="tepeler" d="M0 214 Q62 188 124 213 Q186 236 252 209 Q322 186 400 211 L400 260 L0 260 Z"/>
    <!--KARAKTER:90,244,0.8-->
    <!-- kucuk dekoratif yildizlar: bunlar boyanmaz, sadece parildar -->
    <path class="c parilti" style="--gecikme:0s"   d="M196 62 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 Z"/>
    <path class="c parilti" style="--gecikme:1.1s" d="M96 84 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 Z"/>
    <path class="c parilti" style="--gecikme:2.2s" d="M300 148 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 Z"/>
    <path class="c parilti" style="--gecikme:1.7s" d="M162 118 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 Z"/>
  `,

  // --- Kar: ciplak agac, kus, kardan adam ---
  kis: `
    <!-- gok, kar egrisinin altina uzatildi ki arada beyaz serit kalmasin -->
    <rect class="b" data-ad="gökyüzü" x="0" y="0" width="400" height="200"/>
    <path class="b" data-ad="kar" d="M0 176 Q100 164 200 174 Q300 184 400 170 L400 260 L0 260 Z"/>
    <rect class="b" data-ad="ağaç gövdesi" x="60" y="116" width="24" height="62" rx="3"/>
    <path class="c" d="M72 128 L46 100 M72 116 L56 90 M72 122 L92 96 M72 152 L50 136"/>
    <!-- egimli uzun dal: kus bunun ustunde oturuyor, govdenin altindan geciyor -->
    <path class="c" d="M76 140 Q108 134 150 140"/>
    <path class="b canlanir-suzul" data-ad="kuş kuyruğu" d="M126 120 L100 111 L103 131 Z"/>
    <ellipse class="b canlanir-suzul" data-ad="kuş" cx="142" cy="120" rx="17" ry="13"/>
    <circle class="b canlanir-suzul" data-ad="kuş başı" cx="158" cy="110" r="10"/>
    <path class="b canlanir-suzul" data-ad="gaga" d="M167 105 L182 111 L167 116 Z"/>
    <circle class="c" cx="161" cy="107" r="2.5" fill="#2c2a26" stroke="none"/>
    <circle class="b" data-ad="alt gövde" cx="285" cy="216" r="36"/>
    <circle class="b" data-ad="üst gövde" cx="285" cy="168" r="25"/>
    <path class="c" d="M252 200 L214 178 M318 200 L356 180"/>
    <path class="b" data-ad="burun" d="M283 164 L314 174 L283 184 Z"/>
    <rect class="b canlanir-salla" data-ad="şapka" x="266" y="118" width="38" height="26" rx="3"/>
    <path class="c" d="M251 144 h68"/>
    <circle class="c" cx="276" cy="162" r="2.5" fill="#2c2a26" stroke="none"/>
    <circle class="c" cx="294" cy="162" r="2.5" fill="#2c2a26" stroke="none"/>
    <!-- kar taneleri ayri ayri: farkli gecikmelerle dussunler -->
    <!--KARAKTER:225,252,0.85-->
    <path class="c kar-tanesi" style="--gecikme:0s"   d="M34 46 v16 M26 50 l16 8 M42 50 l-16 8"/>
    <path class="c kar-tanesi" style="--gecikme:3s"   d="M356 60 v14 M349 64 l14 6 M363 64 l-14 6"/>
    <path class="c kar-tanesi" style="--gecikme:6s"   d="M232 40 v12 M226 43 l12 6 M238 43 l-12 6"/>
    <path class="c kar-tanesi" style="--gecikme:1.5s" d="M150 52 v10 M145 55 l10 5 M155 55 l-10 5"/>
  `,

  // --- Yagmur sonrasi: gokkusagi, bulutlar, su birikintisi ---
  yagmur: `
    <rect class="b" data-ad="gökyüzü" x="0" y="0" width="400" height="210"/>
    <!-- gokkusagi: ic ice uc serit, hepsi ayri boyaniyor -->
    <path class="b" data-ad="kuşak-dış"  d="M64 208 A136 136 0 0 1 336 208 L316 208 A116 116 0 0 0 84 208 Z"/>
    <path class="b" data-ad="kuşak-orta" d="M84 208 A116 116 0 0 1 316 208 L296 208 A96 96 0 0 0 104 208 Z"/>
    <path class="b" data-ad="kuşak-iç"   d="M104 208 A96 96 0 0 1 296 208 L276 208 A76 76 0 0 0 124 208 Z"/>
    <path class="b" data-ad="bulut-1" d="M36 74 A17 17 0 0 1 53 57 A21 21 0 0 1 89 61 A15 15 0 0 1 97 74 Z"/>
    <path class="b" data-ad="bulut-2" d="M300 52 A15 15 0 0 1 315 37 A19 19 0 0 1 347 41 A13 13 0 0 1 354 52 Z"/>
    <rect class="b" data-ad="çimen" x="0" y="208" width="400" height="52"/>
    <ellipse class="b" data-ad="su birikintisi" cx="196" cy="232" rx="74" ry="21"/>
    <path class="c" d="M158 230 q12 -5 24 0 M212 236 q12 -5 24 0" fill="none"/>
    <!--KARAKTER:346,250,0.72-->
    <!-- dekoratif damlalar: kar-dus animasyonunu paylasiyorlar -->
    <path class="c kar-tanesi" style="--gecikme:0s"   d="M120 30 q4 8 0 11 q-4 -3 0 -11 Z"/>
    <path class="c kar-tanesi" style="--gecikme:2.5s" d="M250 22 q4 8 0 11 q-4 -3 0 -11 Z"/>
    <path class="c kar-tanesi" style="--gecikme:5s"   d="M180 44 q4 8 0 11 q-4 -3 0 -11 Z"/>
  `,

  // --- Bahce: laleler ve kelebek ---
  bahce: `
    <rect class="b" data-ad="gökyüzü" x="0" y="0" width="400" height="192"/>
    <circle class="b" data-ad="güneş" cx="338" cy="44" r="25"/>
    <rect class="b" data-ad="çimen" x="0" y="192" width="400" height="68"/>
    <path class="c" d="M62 238 L62 196 M150 240 L150 198 M258 240 L258 198"/>
    <path class="b" data-ad="yaprak-1" d="M62 222 Q40 216 32 232 Q48 238 62 228 Z"/>
    <path class="b" data-ad="lale-1" d="M45 198 Q44 172 54 162 Q62 172 70 162 Q80 172 79 198 Q62 208 45 198 Z"/>
    <path class="b" data-ad="yaprak-2" d="M150 226 Q172 220 180 236 Q164 242 150 232 Z"/>
    <path class="b" data-ad="lale-2" d="M133 200 Q132 174 142 164 Q150 174 158 164 Q168 174 167 200 Q150 210 133 200 Z"/>
    <path class="b" data-ad="yaprak-3" d="M258 228 Q236 222 228 238 Q244 244 258 234 Z"/>
    <path class="b" data-ad="lale-3" d="M241 200 Q240 174 250 164 Q258 174 266 164 Q276 174 275 200 Q258 210 241 200 Z"/>
    <path class="b canlanir-suzul" data-ad="kelebek-sol"  d="M196 128 Q168 106 164 130 Q166 152 196 140 Z"/>
    <path class="b canlanir-suzul" data-ad="kelebek-sağ"  d="M200 128 Q228 106 232 130 Q230 152 200 140 Z"/>
    <ellipse class="b canlanir-suzul" data-ad="kelebek gövdesi" cx="198" cy="134" rx="6" ry="15"/>
    <path class="c canlanir-suzul" d="M195 120 L188 108 M201 120 L208 108" fill="none"/>
    <!--KARAKTER:344,248,0.74-->
    <path class="c parilti" style="--gecikme:0s"   d="M96 62 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 Z"/>
    <path class="c parilti" style="--gecikme:1.6s" d="M292 96 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 Z"/>
  `,
};
