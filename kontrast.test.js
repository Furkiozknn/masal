// Yenilemede eklenen renk ciftlerinin okunurlugu (WCAG 2.1 AA, metin >= 4.5:1,
// metin olmayan ogeler >= 3:1). Cift index.html'de gercekten geciyor mu de
// bakiliyor: renk degisip test eski degeri olcmeye devam etmesin.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8').toLowerCase();

const L = (h) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const oran = (a, b) => {
  const [x, y] = [L(a), L(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [ad, on, arka, esik]
const CIFTLER = [
  ['guven satiri', '#5f574d', '#f4efe4', 4.5],
  ['soluk metin, beyaz', '#7a7268', '#ffffff', 4.5],
  ['masal sonu baslik, mavi ucu', '#2c2a26', '#d6e4ff', 4.5],
  ['masal sonu baslik, sari ucu', '#2c2a26', '#fff0b3', 4.5],
  ['masal sonu metin, mavi ucu', '#4a453e', '#d6e4ff', 4.5],
  ['masal sonu metin, sari ucu', '#4a453e', '#fff0b3', 4.5],
  ['ana dugme metni', '#ffffff', '#b5512c', 4.5],
  ['altbilgi metni', '#f1ece2', '#0e0d0b', 4.5],
  ['altbilgi baglantisi', '#ffc21a', '#0e0d0b', 4.5],
  ['atlama baglantisi', '#ffffff', '#2c2a26', 4.5],
  ['odak halkasi, kagit', '#1f45c9', '#fdfaf3', 3],
  ['ilerleme cubugu, iz', '#b5512c', '#e6ded0', 3],
  ['secili nokta halkasi', '#7a7268', '#ffffff', 3],
];

for (const [ad, on, arka, esik] of CIFTLER) {
  test(`kontrast: ${ad} >= ${esik}:1`, () => {
    // beyaz index.html'de #fff olarak da yaziliyor
    const gecer = (c) => (c === '#ffffff' ? html.includes('#fff') : html.includes(c));
    for (const c of [on, arka]) assert.ok(gecer(c), `${c} index.html'de gecmiyor: cift eskimis olabilir`);
    const o = oran(on, arka);
    assert.ok(o >= esik, `${ad}: ${o.toFixed(2)}:1 (${on} / ${arka})`);
  });
}
