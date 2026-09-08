// Calistir: node turkce.test.js
import assert from 'node:assert/strict';
import { ekle } from './turkce.js';

const dogru = [
  // bulunma: buyuk unlu uyumu + sert unsuz benzesmesi
  ['Trabzon', 'de', "Trabzon'da"],
  ['İzmir', 'de', "İzmir'de"],
  ['Sinop', 'de', "Sinop'ta"],
  ['Gaziantep', 'de', "Gaziantep'te"],
  ['İstanbul', 'de', "İstanbul'da"],
  ['Kayseri', 'de', "Kayseri'de"],
  // ayrilma
  ['Bursa', 'den', "Bursa'dan"],
  ['Eskişehir', 'den', "Eskişehir'den"],
  ['Uşak', 'den', "Uşak'tan"],
  // yonelme: unluyle biten kelimede kaynastirma 'y'
  ['Elif', 'e', "Elif'e"],
  ['Ada', 'e', "Ada'ya"],
  ['Toprak', 'e', "Toprak'a"],
  ['Ömer', 'e', "Ömer'e"],
  ['Defne', 'e', "Defne'ye"],
  // belirtme: kucuk unlu uyumu (4'lu)
  ['Elif', 'i', "Elif'i"],
  ['Ada', 'i', "Ada'yı"],
  ['Kuzey', 'i', "Kuzey'i"],
  ['Bulut', 'i', "Bulut'u"],
  ['Gökçe', 'i', "Gökçe'yi"],
  // tamlayan: unluyle bitende kaynastirma 'n'
  ['Elif', 'in', "Elif'in"],
  ['Ada', 'in', "Ada'nın"],
  ['Yusuf', 'in', "Yusuf'un"],
  ['Öykü', 'in', "Öykü'nün"],
  // vasita
  ['Ada', 'le', "Ada'yla"],
  ['Elif', 'le', "Elif'le"],
  // cins isim: kesme isareti yok
  ['kasaba', 'de', 'kasabada', false],
  ['kasaba', 'in', 'kasabanın', false],
];

for (const [kelime, tip, beklenen, ozel = true] of dogru) {
  const c = ekle(kelime, tip, ozel);
  assert.equal(c, beklenen, `${kelime} + ${tip} => ${c}, beklenen ${beklenen}`);
}

// bos girdi cokmemeli
assert.equal(ekle('', 'de'), '');

console.log(`tamam: ${dogru.length + 1} durum gecti`);
