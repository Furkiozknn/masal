// depo.js'in tek isi var: depo firlattiginda uygulamayi birlikte goturmemek.
// Bu yuzden testlerin cogu "firlatan bir localStorage" kuruyor - gercekte
// karsilasilan durum bu, "getItem null dondu" degil.
import test from 'node:test';
import assert from 'node:assert/strict';
import { oku, yaz, sil, okuJSON, yazJSON } from './depo.js';

/** Site verisini reddeden bir tarayici: her islem firlatiyor. */
function depoyuKapat() {
  globalThis.localStorage = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('SecurityError'); },
    removeItem() { throw new Error('SecurityError'); },
  };
}

/** Calisan bir depo. */
function depoyuAc(baslangic = {}) {
  const veri = { ...baslangic };
  globalThis.localStorage = {
    getItem: (k) => (k in veri ? veri[k] : null),
    setItem: (k, v) => { veri[k] = String(v); },
    removeItem: (k) => { delete veri[k]; },
  };
  return veri;
}

/** localStorage'in hic tanimli olmadigi ortam (eski/kisitli gomulu tarayici). */
function depoyuKaldir() {
  delete globalThis.localStorage;
}

test('kapali depo: okuma null doner, firlatmaz', () => {
  depoyuKapat();
  assert.equal(oku('masal:dil'), null);
});

test('kapali depo: yazma false doner, firlatmaz', () => {
  depoyuKapat();
  assert.equal(yaz('masal:dil', 'tr'), false);
});

test('kapali depo: silme false doner, firlatmaz', () => {
  depoyuKapat();
  assert.equal(sil('masal:dil'), false);
});

test('kapali depo: JSON okuma yedek degeri doner', () => {
  depoyuKapat();
  assert.deepEqual(okuJSON('masal:kitaplik', []), []);
  assert.deepEqual(okuJSON('masal:boya:1', { a: 1 }), { a: 1 });
});

test('kapali depo: JSON yazma false doner', () => {
  depoyuKapat();
  assert.equal(yazJSON('masal:kitaplik', [1, 2]), false);
});

test('localStorage hic yoksa da ayni sekilde davranir', () => {
  depoyuKaldir();
  assert.equal(oku('x'), null);
  assert.equal(yaz('x', '1'), false);
  assert.equal(sil('x'), false);
  assert.deepEqual(okuJSON('x', 'yedek'), 'yedek');
});

test('calisan depo: yazilan okunur', () => {
  depoyuAc();
  assert.equal(yaz('masal:dil', 'en'), true);
  assert.equal(oku('masal:dil'), 'en');
});

test('calisan depo: silinen kaybolur', () => {
  depoyuAc({ 'masal:dil': 'tr' });
  assert.equal(oku('masal:dil'), 'tr');
  sil('masal:dil');
  assert.equal(oku('masal:dil'), null);
});

test('calisan depo: JSON gidip geliyor', () => {
  depoyuAc();
  yazJSON('masal:kitaplik', [{ ad: 'Ada', tema: 'orman' }]);
  assert.deepEqual(okuJSON('masal:kitaplik', []), [{ ad: 'Ada', tema: 'orman' }]);
});

test('bozuk JSON yedek degere duser, firlatmaz', () => {
  depoyuAc({ 'masal:kitaplik': '{bu json degil' });
  assert.deepEqual(okuJSON('masal:kitaplik', []), []);
});

test('olmayan anahtar yedek degeri doner, null degil', () => {
  depoyuAc();
  assert.deepEqual(okuJSON('yok', []), []);
});

test('JSON.stringify firlatirsa yazma false doner', () => {
  depoyuAc();
  const dairesel = {};
  dairesel.kendi = dairesel;
  assert.equal(yazJSON('x', dairesel), false);
});
