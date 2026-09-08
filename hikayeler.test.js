// Calistir: node hikayeler.test.js
// Sablonlarin yapisal tutarliligi. Yeni tema/dil eklenince ilk bunu calistir.
import assert from 'node:assert/strict';
import { METINLER, hikayeUret, dilSec } from './hikayeler.js';
import { SAHNELER } from './sahneler.js';

const diller = Object.keys(METINLER);
assert.ok(diller.length >= 2, 'en az iki dil olmali');

// Butun dillerde ayni temalar bulunmali: biri eksikse o dilde tema secilemez.
const temalar = Object.keys(METINLER[diller[0]].hikayeler).sort();
for (const d of diller) {
  assert.deepEqual(Object.keys(METINLER[d].hikayeler).sort(), temalar, `${d}: tema listesi farkli`);
  assert.deepEqual(Object.keys(METINLER[d].temalar).sort(), temalar, `${d}: tema adlari eksik`);
}

// UI anahtarlari her dilde ayni olmali, yoksa cevrilmemis alan bos gorunur.
const uiAnahtar = Object.keys(METINLER[diller[0]].ui).sort();
for (const d of diller) {
  assert.deepEqual(Object.keys(METINLER[d].ui).sort(), uiAnahtar, `${d}: ui anahtarlari farkli`);
}

for (const d of diller) {
  for (const t of temalar) {
    const h = METINLER[d].hikayeler[t];
    const s = h.sayfalar;
    const etiket = `${d}/${t}`;

    const secimler = s.filter((x) => x.secim);
    assert.equal(secimler.length, 1, `${etiket}: tam bir secim noktasi olmali`);
    assert.ok(secimler[0].secim.a && secimler[0].secim.b, `${etiket}: iki secenek de dolu olmali`);

    const a = s.filter((x) => x.dal === 'a').length;
    const b = s.filter((x) => x.dal === 'b').length;
    assert.ok(a > 0, `${etiket}: 'a' dali bos`);
    // Dal uzunluklari esit olmali: toplam sayfa sayisi 'a' dalindan hesaplaniyor,
    // farkli olursa 'b' yolunda sayfa sayaci yanlis gorunur.
    assert.equal(a, b, `${etiket}: dal uzunluklari esit degil (a=${a}, b=${b})`);

    // Son sayfa ortak olmali: iki yol da ayni kapanisa varsin.
    assert.ok(!s[s.length - 1].dal, `${etiket}: son sayfa bir dala ait olmamali`);

    // Bilinmeyen dal etiketi sessizce kaybolur, sayfa hic gosterilmez.
    for (const sayfa of s) {
      assert.ok(!sayfa.dal || ['a', 'b'].includes(sayfa.dal), `${etiket}: bilinmeyen dal ${sayfa.dal}`);
      assert.ok(sayfa.metin && sayfa.metin.trim(), `${etiket}: bos sayfa metni`);
    }
  }
}

// Yer tutucular tamamen cozulmeli: ekranda "{ad}" gormek istemiyoruz.
for (const d of diller) {
  for (const t of temalar) {
    const h = hikayeUret({ dil: d, tema: t, ad: 'Ada', yas: 5, sehir: 'Uşak' });
    assert.ok(!/\{[a-z]+(:[a-z]+)?\}/.test(h.baslik), `${d}/${t}: baslikta cozulmemis yer tutucu`);
    for (const s of h.sayfalar) {
      assert.ok(!/\{[a-z]+(:[a-z]+)?\}/.test(s.metin), `${d}/${t}: metinde cozulmemis yer tutucu: ${s.metin}`);
    }
  }
}

// Turkce ekler sablondan degil ek motorundan gelmeli.
const trDeniz = hikayeUret({ dil: 'tr', tema: 'deniz', ad: 'Ada', yas: 5, sehir: 'Sinop' });
assert.ok(trDeniz.sayfalar[0].metin.startsWith("Sinop'ta"), 'sert unsuz benzesmesi uygulanmadi');
const trSehirsiz = hikayeUret({ dil: 'tr', tema: 'orman', ad: 'Ömer', yas: 4, sehir: '' });
assert.ok(trSehirsiz.sayfalar[0].metin.startsWith('Kasabanın'), 'sehirsiz durumda cins isim + buyuk harf bekleniyordu');

// Her sayfanin sahnesi tanimli olmali: eksik sahne sessizce bos cizilir,
// hata vermez. Kullanilmayan sahne de olu agirliktir.
const kullanilanSahne = new Set();
for (const d of diller) {
  for (const t of temalar) {
    for (const s of METINLER[d].hikayeler[t].sayfalar) {
      if (!s.sahne) continue;
      assert.ok(SAHNELER[s.sahne], `${d}/${t}: tanimsiz sahne "${s.sahne}"`);
      kullanilanSahne.add(s.sahne);
      // Boyanabilir sayfada gercekten boyanacak bolge bulunmali.
      if (s.boya) {
        const bolge = (SAHNELER[s.sahne].match(/class="b"/g) || []).length;
        assert.ok(bolge >= 5, `${d}/${t}: "${s.sahne}" sahnesinde yalnizca ${bolge} bolge var`);
      }
    }
  }
}
for (const ad of Object.keys(SAHNELER)) {
  assert.ok(kullanilanSahne.has(ad), `"${ad}" sahnesi hicbir hikayede kullanilmiyor`);
}

// Bilinmeyen dil ve tema cokmemeli.
assert.equal(dilSec('de'), 'en');
assert.ok(hikayeUret({ dil: 'tr', tema: 'yokboyle', ad: 'Ada', yas: 5, sehir: '' }).sayfalar.length > 0);

console.log(`tamam: ${diller.length} dil x ${temalar.length} tema, ${Object.keys(SAHNELER).length} sahne dogrulandi`);
