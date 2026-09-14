// Calistir: node --test
// Gizlilik suzgeci: cocuga ait hicbir bilgi olcume sizmamali.
import test from 'node:test';
import assert from 'node:assert/strict';
import { temiz, yasGrubu } from './olcum.js';

test('kisisel alanlar her durumda dusuyor', () => {
  const kirli = {
    tema: 'kar',
    ad: 'Ada',                       // cocugun adi
    sehir: 'Uşak',                   // konum
    eposta: 'a@b.c',
    not: 'serbest metin',
    boyamaGorseli: 'data:image/png;base64,AAAA',
    yasKademesi: '3-4',
    sayfa: 2,
  };
  const c = temiz(kirli);
  assert.deepEqual(Object.keys(c).sort(), ['sayfa', 'tema', 'yasKademesi']);
  assert.ok(!('ad' in c), 'cocugun adi sizdi');
  assert.ok(!('sehir' in c), 'sehir sizdi');
  assert.ok(!('boyamaGorseli' in c), 'boyama gorseli sizdi');
});

test('izin verilen alan bile nesne/dizi ise gecmiyor', () => {
  // Ic ice veri kacagi olur: {tema: {cocuk: 'Ada'}} izinli anahtar tasiyor
  // ama degeri cocugun adini iceriyor.
  assert.deepEqual(temiz({ tema: { ad: 'kar', cocuk: 'Ada' } }), {});
  assert.deepEqual(temiz({ tema: ['kar', 'Ada'] }), {});
  assert.deepEqual(temiz({ tema: null }), {});
});

test('bos ve bozuk girdi cokmuyor', () => {
  assert.deepEqual(temiz(), {});
  assert.deepEqual(temiz(null), {});
  assert.deepEqual(temiz({}), {});
});

test('yas tek tek degil grup olarak raporlaniyor', () => {
  assert.equal(yasGrubu(3), '3-4');
  assert.equal(yasGrubu(4), '3-4');
  assert.equal(yasGrubu(5), '5-6');
  assert.equal(yasGrubu(6), '5-6');
  assert.equal(yasGrubu(7), '7-9');
  assert.equal(yasGrubu(9), '7-9');
});

test('yas gruplama bozuk girdiye dayaniyor', () => {
  assert.equal(yasGrubu('5'), '5-6');       // form string veriyor
  assert.equal(yasGrubu(undefined), '3-4'); // bozuk girdide en dar grup
});
