// Calistir: node --test
// Sablonlarin yapisal tutarliligi. Yeni tema/dil eklenince ilk bunu calistir.
import test from 'node:test';
import assert from 'node:assert/strict';
import { METINLER, hikayeUret, dilSec } from './hikayeler.js';
import { SAHNELER } from './sahneler.js';

const diller = Object.keys(METINLER);
const temalar = Object.keys(METINLER[diller[0]].hikayeler).sort();
const uiAnahtar = Object.keys(METINLER[diller[0]].ui).sort();

test('en az iki dil var', () => {
  assert.ok(diller.length >= 2, 'en az iki dil olmali');
});

// Dil/tema basina ayri test: eksigin hangi dilde oldugu kosu ciktisinda
// gorunsun, tek bir toplu "tema listesi farkli" satiri yerine.
for (const d of diller) {
  test(`${d}: tema listesi butun dillerle ayni`, () => {
    // Biri eksikse o dilde tema secilemez.
    assert.deepEqual(Object.keys(METINLER[d].hikayeler).sort(), temalar, `${d}: tema listesi farkli`);
    assert.deepEqual(Object.keys(METINLER[d].temalar).sort(), temalar, `${d}: tema adlari eksik`);
  });

  test(`${d}: ui anahtarlari butun dillerle ayni`, () => {
    // Yoksa cevrilmemis alan ekranda bos gorunur.
    assert.deepEqual(Object.keys(METINLER[d].ui).sort(), uiAnahtar, `${d}: ui anahtarlari farkli`);
  });
}

for (const d of diller) {
  for (const t of temalar) {
    const etiket = `${d}/${t}`;

    test(`${etiket}: dallanma yapisi tutarli`, () => {
      const s = METINLER[d].hikayeler[t].sayfalar;

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
    });

    test(`${etiket}: yer tutucular tamamen cozuluyor`, () => {
      // Ekranda "{ad}" gormek istemiyoruz.
      const h = hikayeUret({ dil: d, tema: t, ad: 'Ada', yas: 5, sehir: 'Uşak' });
      assert.ok(!/\{[a-z]+(:[a-z]+)?\}/.test(h.baslik), `${etiket}: baslikta cozulmemis yer tutucu`);
      for (const s of h.sayfalar) {
        assert.ok(!/\{[a-z]+(:[a-z]+)?\}/.test(s.metin), `${etiket}: metinde cozulmemis yer tutucu: ${s.metin}`);
      }
    });

    test(`${etiket}: her sayfanin sahnesi tanimli`, () => {
      // Eksik sahne sessizce bos cizilir, hata vermez.
      for (const s of METINLER[d].hikayeler[t].sayfalar) {
        if (!s.sahne) continue;
        assert.ok(SAHNELER[s.sahne], `${etiket}: tanimsiz sahne "${s.sahne}"`);
        // Boyanabilir sayfada gercekten boyanacak bolge bulunmali.
        if (s.boya) {
          const bolge = (SAHNELER[s.sahne].match(/class="b"/g) || []).length;
          assert.ok(bolge >= 5, `${etiket}: "${s.sahne}" sahnesinde yalnizca ${bolge} bolge var`);
        }
      }
    });
  }
}

test('kullanilmayan sahne yok', () => {
  // Kullanilmayan sahne olu agirlik: dosyayi buyutur, kimse cizmez.
  const kullanilan = new Set();
  for (const d of diller) {
    for (const t of temalar) {
      for (const s of METINLER[d].hikayeler[t].sayfalar) {
        if (s.sahne) kullanilan.add(s.sahne);
      }
    }
  }
  for (const ad of Object.keys(SAHNELER)) {
    assert.ok(kullanilan.has(ad), `"${ad}" sahnesi hicbir hikayede kullanilmiyor`);
  }
});

test('turkce ekler sablondan degil ek motorundan geliyor', () => {
  const trDeniz = hikayeUret({ dil: 'tr', tema: 'deniz', ad: 'Ada', yas: 5, sehir: 'Sinop' });
  assert.ok(trDeniz.sayfalar[0].metin.startsWith("Sinop'ta"), 'sert unsuz benzesmesi uygulanmadi');
  const trSehirsiz = hikayeUret({ dil: 'tr', tema: 'orman', ad: 'Ömer', yas: 4, sehir: '' });
  assert.ok(trSehirsiz.sayfalar[0].metin.startsWith('Kasabanın'), 'sehirsiz durumda cins isim + buyuk harf bekleniyordu');
});

test('bilinmeyen dil ve tema cokmuyor', () => {
  assert.equal(dilSec('de'), 'en');
  assert.ok(hikayeUret({ dil: 'tr', tema: 'yokboyle', ad: 'Ada', yas: 5, sehir: '' }).sayfalar.length > 0);
});

// Ad vurgusu: yalnizca {ad} yer tutucusundan gelen gecisler kalinlasmali.
// Eskiden vurgu app.js'te "metinde adi ara ve sar" diye konuyordu; Turkcede
// ekler ada dogrudan yapistigi ve kisa adlar baska kelimelerin icinde gectigi
// icin bu yaklasim yanlis yerleri vuruyordu.
test('kisa ad baska kelimenin icinde vurgulanmiyor: "Su"', () => {
  const h = hikayeUret({ dil: 'tr', tema: 'orman', ad: 'Su', yas: 5, sehir: 'Rize' });
  const tumu = h.sayfalar.map((s) => s.metinHtml).join('\n');

  // "Suda gökyüzü görünüyordu." sablonun kendi kelimesi, cocugun adi degil.
  assert.ok(/Suda gökyüzü/.test(tumu), 'sablon metni degismis, test guncellenmeli');
  assert.ok(!/<b>Su<\/b>da/.test(tumu), '"Suda" kelimesinin ici vurgulanmis');
  assert.ok(!/<b>Su<\/b>\w/u.test(tumu), 'vurgu bir kelimenin ortasinda kapanmis');

  // Ad gercekten gectigi yerlerde vurgulaniyor, hal eki vurgunun disinda kaliyor.
  assert.ok(/<b>Su<\/b> o sabah/.test(tumu), 'ad hic vurgulanmamis');
  assert.ok(/<b>Su<\/b>'ya baktı/.test(tumu), "hal eki vurgunun disinda beklenirdi: <b>Su</b>'ya");
});

test('ad sablondaki ozel isimle cakisinca vurgulanmiyor: "Ay"', () => {
  const h = hikayeUret({ dil: 'tr', tema: 'yildizlar', ad: 'Ay', yas: 5, sehir: 'Rize' });
  const tumu = h.sayfalar.map((s) => s.metinHtml).join('\n');

  // Sablonda gokteki Ay'dan soz eden cumleler var; onlar cocugun adi degil.
  assert.ok(/Roket Ay'a doğru döndü/.test(tumu), 'sablon metni degismis, test guncellenmeli');
  assert.ok(!/<b>Ay<\/b>'a doğru döndü/.test(tumu), 'gokteki Ay cocugun adi sanilmis');
  assert.ok(!/<b>Ay<\/b>'ın yanından/.test(tumu), "\"Ay'ın\" sablon kelimesi vurgulanmis");
  assert.ok(!/<b>Ay<\/b>aklarına/.test(tumu), '"Ayaklarına" kelimesinin ici vurgulanmis');

  // Cocugun adi gectigi yerde vurgulu.
  assert.ok(/<b>Ay<\/b> yatağından kalkıp/.test(tumu), 'ad hic vurgulanmamis');
});

test('metinHtml kullanici girdisini kaciriyor, metin duz kaliyor', () => {
  const h = hikayeUret({ dil: 'tr', tema: 'deniz', ad: '<Ada>', yas: 5, sehir: 'Rize' });
  const tumu = h.sayfalar.map((s) => s.metinHtml).join('\n');
  assert.ok(tumu.includes('<b>&lt;Ada&gt;</b>'), 'ad HTML olarak kacilmamis');
  assert.ok(!/<b><Ada>/.test(tumu), 'ham < > metinHtml icine sizmis');
  // Seslendirme ve kitaplik duz metni okur: orada etiket olmamali.
  for (const s of h.sayfalar) {
    assert.ok(!/<b>|<\/b>|&lt;/.test(s.metin), `duz metne isaret sizmis: ${s.metin}`);
  }
});
