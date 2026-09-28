// Geri al gecmisi: ozellikle "Temizle"nin geri alinabilmesi.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adimEkle, sonAdimiAl, boyaliBolgeler, GECMIS_SINIRI } from './boyama.js';

/** app.js'in yaptigini taklit eden kucuk bir sayfa: dolgular dizisi + gecmis. */
function sayfa(n = 4) {
  const dolgular = Array(n).fill('');
  const gecmis = [];
  const A = 'masal:boya:Ada:deniz:1';
  return {
    dolgular, gecmis,
    boya(i, renk) { adimEkle(gecmis, A, { [i]: dolgular[i] }); dolgular[i] = renk; },
    temizle() { adimEkle(gecmis, A, boyaliBolgeler(dolgular)); dolgular.fill(''); },
    geriAl() {
      const d = sonAdimiAl(gecmis, A);
      if (d) for (const [i, renk] of Object.entries(d)) dolgular[i] = renk;
      return d;
    },
  };
}

test('temizle -> geri al: bitmis resim oldugu gibi geri gelir', () => {
  const s = sayfa();
  s.boya(0, 'kirmizi'); s.boya(1, 'mavi'); s.boya(2, 'sari'); s.boya(3, 'yesil');
  s.temizle();
  assert.deepEqual(s.dolgular, ['', '', '', '']);
  s.geriAl();
  assert.deepEqual(s.dolgular, ['kirmizi', 'mavi', 'sari', 'yesil']);
});

test('temizle -> geri al -> geri al: temizlemeden onceki son dokunus da geri alinir', () => {
  const s = sayfa();
  s.boya(0, 'kirmizi'); s.boya(0, 'mavi');
  s.temizle();
  s.geriAl();
  assert.deepEqual(s.dolgular, ['mavi', '', '', '']);
  s.geriAl();
  assert.deepEqual(s.dolgular, ['kirmizi', '', '', '']);
});

test('bos sayfada temizle gecmise adim eklemez', () => {
  const s = sayfa();
  s.temizle();
  assert.equal(s.gecmis.length, 0);
  assert.equal(s.geriAl(), null);
});

test('tek dokunusu geri almak bolgenin onceki rengini geri getirir', () => {
  const s = sayfa();
  s.boya(2, 'mor'); s.boya(2, 'turuncu');
  s.geriAl();
  assert.deepEqual(s.dolgular, ['', '', 'mor', '']);
});

test('geri al yalnizca bu sayfanin adimlarini alir', () => {
  const gecmis = [];
  adimEkle(gecmis, 'sayfa1', { 0: '' });
  adimEkle(gecmis, 'sayfa2', { 0: 'mavi' });
  adimEkle(gecmis, 'sayfa1', { 1: 'sari' });
  assert.deepEqual(sonAdimiAl(gecmis, 'sayfa2'), { 0: 'mavi' });
  assert.equal(sonAdimiAl(gecmis, 'sayfa2'), null);
  assert.equal(gecmis.length, 2);
});

test('gecmis siniri asmaz; en eski adimlar dusurulur', () => {
  const gecmis = [];
  for (let i = 0; i < GECMIS_SINIRI + 50; i++) adimEkle(gecmis, 'a', { 0: String(i) });
  assert.equal(gecmis.length, GECMIS_SINIRI);
  assert.deepEqual(sonAdimiAl(gecmis, 'a'), { 0: String(GECMIS_SINIRI + 49) });
});

test('adimEkle degisimi kopyalar: cagiranin nesnesi sonradan degisse de gecmis bozulmaz', () => {
  const gecmis = [];
  const d = { 0: 'kirmizi' };
  adimEkle(gecmis, 'a', d);
  d[0] = 'mavi';
  assert.deepEqual(sonAdimiAl(gecmis, 'a'), { 0: 'kirmizi' });
});
