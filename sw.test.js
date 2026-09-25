// sw.js'in fetch davranisi, sahte bir servis iscisi ortaminda.
//
// Neden: sw.js ilk halinde "once onbellek" calisiyordu ve onbellek adi sabitti
// (masal-v1). Tarayici servis iscisini yalnizca sw.js'in kendisi degisince
// yeniler; app.js ya da index.html degisince degil. Sonuc: sayfayi bir kez
// acmis herkes, sonraki her dagitimda ESKI uygulamayi gormeye devam ediyordu.
// Bu gercekten oldu: servis iscisinden iki saat sonra index.html'e giren
// kontrast duzeltmesi (a8aeef9), onceden ziyaret etmis hicbir cihaza ulasmadi.
//
// Buradaki ilk test o hatayi yakalar: ag yeni bir surum verirken yanit
// onbellekteki eski surum olmamali. Geri kalanlar cevrimdisi sozunu ve
// gizlilik sinirini (baska kaynak, GET disi) kilitliyor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const KAYNAK = fs.readFileSync(new URL('./sw.js', import.meta.url), 'utf8');
const KOK = 'https://furkiozknn.github.io/masal/';

/** sw.js'i sahte bir ortamda kosturur; olay dinleyicilerini ve onbellegi dondurur. */
function ortam({ ag }) {
  const dinleyici = {};
  const depolar = new Map();                       // ad -> Map(url -> yanit)
  const anahtar = (x) => new URL(typeof x === 'string' ? x : x.url, KOK).href;
  const depo = (ad) => {
    if (!depolar.has(ad)) depolar.set(ad, new Map());
    const m = depolar.get(ad);
    return {
      put: async (istek, yanit) => { m.set(anahtar(istek), yanit); },
      match: async (istek) => m.get(anahtar(istek)),
      addAll: async (liste) => { for (const u of liste) m.set(anahtar(u), await ag({ url: anahtar(u) })); },
    };
  };
  const caches = {
    open: async (ad) => depo(ad),
    match: async (istek) => {
      for (const m of depolar.values()) { const y = m.get(anahtar(istek)); if (y) return y; }
      return undefined;
    },
    keys: async () => [...depolar.keys()],
    delete: async (ad) => depolar.delete(ad),
  };
  const self = {
    location: { origin: new URL(KOK).origin },
    addEventListener: (tur, fn) => { dinleyici[tur] = fn; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };
  vm.runInNewContext(KAYNAK, {
    self, caches, URL, Promise,
    fetch: (istek) => ag(istek),
    Response: { error: () => ({ tur: 'hata' }) },
  });
  const surum = KAYNAK.match(/const SURUM = '([^']+)'/)[1];
  return { dinleyici, depolar, depo, surum };
}

const yanit = (govde) => ({ status: 200, type: 'basic', govde, clone() { return this; } });

/** Bir fetch olayi gonderir; respondWith cagrilmadiysa undefined doner. */
async function iste(d, url, { method = 'GET', mode = 'cors' } = {}) {
  let sonuc;
  d.dinleyici.fetch({
    request: { url: new URL(url, KOK).href, method, mode },
    respondWith: (p) => { sonuc = p; },
  });
  return sonuc === undefined ? undefined : await sonuc;
}

test('sw: ag varken yeni surum gelir, onbellekteki eski surum degil (dagitim kullaniciya ulasir)', async () => {
  let surum = 'eski';
  const d = ortam({ ag: async () => yanit(surum) });
  await d.depo(d.surum).put(KOK + 'app.js', yanit('eski'));   // onceki ziyaretten kalan
  surum = 'yeni';                                              // yeni dagitim
  const y = await iste(d, 'app.js');
  assert.equal(y.govde, 'yeni');
});

test('sw: agdan gelen yanit onbellegi tazeler (bir sonraki cevrimdisi acilis guncel)', async () => {
  const d = ortam({ ag: async () => yanit('yeni') });
  await d.depo(d.surum).put(KOK + 'app.js', yanit('eski'));
  await iste(d, 'app.js');
  await new Promise((r) => setImmediate(r));
  assert.equal((await d.depo(d.surum).match(KOK + 'app.js')).govde, 'yeni');
});

test('sw: ag yokken onbellekteki surumle acilir (cevrimdisi sozu)', async () => {
  const d = ortam({ ag: async () => { throw new TypeError('Failed to fetch'); } });
  await d.depo(d.surum).put(KOK + 'app.js', yanit('onbellek'));
  assert.equal((await iste(d, 'app.js')).govde, 'onbellek');
});

test('sw: ag yok, sayfa onbellekte yok -> gezinmede uygulama kabugu acilir', async () => {
  const d = ortam({ ag: async () => { throw new TypeError('Failed to fetch'); } });
  await d.depo(d.surum).put(KOK + 'index.html', yanit('kabuk'));
  const y = await iste(d, '?utm_source=whatsapp', { mode: 'navigate' });
  assert.equal(y.govde, 'kabuk');
});

test('sw: ag yok, dosya onbellekte yok -> hata yaniti (sahte bir icerik uydurmaz)', async () => {
  const d = ortam({ ag: async () => { throw new TypeError('Failed to fetch'); } });
  assert.deepEqual(await iste(d, 'yok.js'), { tur: 'hata' });
});

test('sw: basarisiz ag yaniti (404, 500) onbellege yazilmaz', async () => {
  const d = ortam({ ag: async () => ({ status: 404, type: 'basic', govde: 'yok', clone() { return this; } }) });
  await d.depo(d.surum).put(KOK + 'app.js', yanit('saglam'));
  const y = await iste(d, 'app.js');
  await new Promise((r) => setImmediate(r));
  assert.equal(y.status, 404);                                  // sayfa gercegi gorur
  assert.equal((await d.depo(d.surum).match(KOK + 'app.js')).govde, 'saglam');   // onbellek bozulmaz
});

test('sw: baska kaynaga giden istek (olcum ucu) karsilanmaz ve onbellege girmez', async () => {
  let cagri = 0;
  const d = ortam({ ag: async () => { cagri++; return yanit('x'); } });
  assert.equal(await iste(d, 'https://olcum.ornek/olay'), undefined);
  assert.equal(cagri, 0);
});

test('sw: GET disindaki istekler karsilanmaz', async () => {
  const d = ortam({ ag: async () => yanit('x') });
  assert.equal(await iste(d, 'app.js', { method: 'POST' }), undefined);
});

test('sw: yeni surum etkinlesince eski onbellekler silinir', async () => {
  const d = ortam({ ag: async () => yanit('x') });
  await d.depo('masal-eski').put(KOK + 'app.js', yanit('eski'));
  await d.depo(d.surum).put(KOK + 'app.js', yanit('yeni'));
  let bekleyen;
  d.dinleyici.activate({ waitUntil: (p) => { bekleyen = p; } });
  await bekleyen;
  assert.deepEqual([...d.depolar.keys()], [d.surum]);
});
