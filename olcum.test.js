// Calistir: node olcum.test.js
// Gizlilik suzgeci: cocuga ait hicbir bilgi olcume sizmamali.
import assert from 'node:assert/strict';
import { temiz, yasGrubu } from './olcum.js';

// Kisisel alanlar her durumda dusmeli
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

// Izin verilen alan bile nesne/dizi ise gecmemeli: ic ice veri kacagi olur
assert.deepEqual(temiz({ tema: { ad: 'kar', cocuk: 'Ada' } }), {});
assert.deepEqual(temiz({ tema: ['kar', 'Ada'] }), {});
assert.deepEqual(temiz({ tema: null }), {});

// Bos ve bozuk girdi cokmemeli
assert.deepEqual(temiz(), {});
assert.deepEqual(temiz(null), {});
assert.deepEqual(temiz({}), {});

// Yas tek tek degil grup olarak
assert.equal(yasGrubu(3), '3-4');
assert.equal(yasGrubu(4), '3-4');
assert.equal(yasGrubu(5), '5-6');
assert.equal(yasGrubu(6), '5-6');
assert.equal(yasGrubu(7), '7-9');
assert.equal(yasGrubu(9), '7-9');
assert.equal(yasGrubu('5'), '5-6');       // form string veriyor
assert.equal(yasGrubu(undefined), '3-4'); // bozuk girdide en dar grup

console.log('tamam: gizlilik suzgeci ve yas gruplama dogrulandi');
