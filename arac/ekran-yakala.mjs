// README gorsellerini uretir. Uygulamayi gercekten acar, formu doldurur,
// sayfayi cevirir ve boyama alanini gercekten boyar - palette bir renge
// tiklar, sonra bolgeye tiklar, tipki cocugun yaptigi gibi. Elle duzenlenmis
// bir kompozisyon yok; ekranda ne varsa o.
//
// Playwright bu deponun bagimliligi DEGIL: masal'in hic bagimliligi yok ve
// CI'da `npm ci` adimi bilerek bulunmuyor. Bu betik elle calistirilir:
//
//     npx --yes playwright@1 install chromium      (bir kez)
//     node arac/ekran-yakala.mjs
//
// Not: bu betik cizimi PNG'ye ceviriyor, ama uygulamanin "indirme yok"
// vaadiyle catismiyor - vaat uygulamanin cocuga sundugu yollarla ilgili.
// Betik index.html'den yuklenmiyor, uygulamanin parcasi degil ve yalnizca
// bakimci elle calistiriyor. CI'daki indirme-yok kontrolu de uygulamanin
// dosyalarina bakar; orada hicbir sey degismedi.
//
// Cikti: assets/ekran-goruntusu.png  (boyanmis bir hikaye sayfasi)
//        assets/sahneler.png         (uc temanin boyanmis sahnesi yan yana)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as bekle } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8792;
const ADRES = `http://127.0.0.1:${PORT}/`;

// app.js: RENKLER dizisinin sirasi. Palet dugmeleri de bu sirada.
const R = { kirmizi:0, turuncu:1, sari:2, acikYesil:3, yesil:4,
            acikMavi:5, mavi:6, mor:7, kahve:8, pembe:9, krem:10, siyah:11 };

// Bolge adi -> renk. Ilk esleyen kural kazanir; {} icindekiler sirayla dagilir.
// Adlar sahneler.js'teki data-ad degerleri (uc temanin hepsi kapsanir).
const KURALLAR = [
  [/^gece göğü$/,        R.mor],
  [/^gökyüzü$/,          R.acikMavi],
  [/^(deniz|su birikintisi)$/, R.mavi],
  [/^kum$/,              R.sari],
  [/^güneş$/,            R.turuncu],
  [/^ay$/,               R.krem],
  [/^bulut/,             R.krem],
  [/^kabuk-/,            [R.pembe, R.mor, R.turuncu, R.acikYesil, R.kirmizi]],
  [/^deniz yıldızı$/,    R.kirmizi],
  [/^yıldız-/,           R.sari],
  [/^alev$/,             R.turuncu],
  [/^kanat-/,            R.kirmizi],
  [/^roket$/,            R.krem],
  [/^pencere$/,          R.acikMavi],
  [/^tepeler$/,          R.kahve],
  [/^çimen$/,            R.acikYesil],
  [/^(gövde-|ağaç gövdesi)/, R.kahve],
  [/^yaprak-/,           R.yesil],
  [/^tilki-burun$/,      R.siyah],
  [/^(tilki-|bacak-)/,   R.turuncu],
  [/^kar$/,              R.krem],
  [/^gaga$/,             R.turuncu],
  [/^(kuş|kuş başı|kuş kuyruğu)$/, R.kirmizi],
  [/^(alt|üst) gövde$/,  R.krem],
  [/^burun$/,            R.turuncu],
  [/^şapka$/,            R.siyah],
  [/^kuşak-dış$/,        R.kirmizi],
  [/^kuşak-orta$/,       R.sari],
  [/^kuşak-iç$/,         R.yesil],
  [/^lale-/,             [R.kirmizi, R.pembe, R.mor]],
  [/^kelebek gövdesi$/,  R.siyah],
  [/^kelebek-/,          R.turuncu],
  [/^kıyafet$/,          R.yesil],
];

function renkSec(ad, sayaclar) {
  for (const [kalip, deger] of KURALLAR) {
    if (!kalip.test(ad)) continue;
    if (!Array.isArray(deger)) return deger;
    const k = kalip.source;
    const i = sayaclar.get(k) ?? 0;
    sayaclar.set(k, i + 1);
    return deger[i % deger.length];
  }
  return R.acikMavi;                       // yeni bolge eklenirse gorunur kalsin
}

async function sunucuBaslat() {
  const p = spawn('python3', ['sunucu.py', String(PORT)], { cwd: KOK, stdio: 'ignore' });
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(ADRES)).ok) return p; } catch {}
    await bekle(250);
  }
  p.kill(); throw new Error(`sunucu ${PORT} portunda acilmadi`);
}

/** Masali olusturur ve boyanabilir sayfaya kadar ilerler. */
async function boyanabilirSayfayaGit(sayfa, { ad, sehir, yas, tema }) {
  await sayfa.goto(ADRES, { waitUntil: 'networkidle' });
  await sayfa.fill('#ad', ad);
  await sayfa.fill('#sehir', sehir);
  await sayfa.selectOption('#yas', String(yas));
  await sayfa.selectOption('#tema', tema);
  await sayfa.click('#olustur');
  await sayfa.waitForSelector('#sahne', { timeout: 10000 });
  for (let i = 0; i < 6; i++) {
    await bekle(400);
    if (!(await sayfa.$eval('#palet', (e) => e.hidden))) return true;
    if (await sayfa.locator('#secimA').isVisible().catch(() => false)) await sayfa.click('#secimA');
    else await sayfa.click('#ileri');
  }
  throw new Error(`${tema}: boyanabilir sayfa bulunamadi`);
}

async function boya(sayfa) {
  const renkler = sayfa.locator('.palet .renk');
  const adlar = await sayfa.$$eval('#sahne .b', (e) => e.map((x) => x.dataset.ad));
  const sayaclar = new Map();
  for (const ad of adlar) {
    await renkler.nth(renkSec(ad, sayaclar)).click();
    // Konuma tiklamak yerine olayi dogrudan bolgeye gonderiyoruz: buyuk
    // bolgelerin (ornegin "kum") merkezi baska bir seklin altinda kaliyor ve
    // tiklama ustteki sekle gidiyordu. Uygulamanin isleyicisi yine ayni.
    await sayfa.locator(`#sahne .b[data-ad="${ad}"]`).first().dispatchEvent('click');
    await bekle(60);
  }
  return adlar.length;
}

const sunucu = await sunucuBaslat();
const tarayici = await chromium.launch();
try {
  const baglam = await tarayici.newContext({
    viewport: { width: 1180, height: 1000 }, deviceScaleFactor: 2, locale: 'tr-TR',
  });

  // --- 1: boyanmis bir hikaye sayfasi (tam kart)
  const sayfa = await baglam.newPage();
  await boyanabilirSayfayaGit(sayfa, { ad: 'Elif', sehir: 'İzmir', yas: 6, tema: 'deniz' });
  const n = await boya(sayfa);
  await bekle(500);
  await sayfa.locator('#okuyucuEkran').screenshot({
    path: path.join(KOK, 'assets', 'ekran-goruntusu.png'),
  });
  console.log(`yazildi: assets/ekran-goruntusu.png  (${n} bolge boyandi)`);

  // --- 2: uc temanin sahnesi yan yana
  // Sahnelerin SVG'si uygulamadan oldugu gibi alinip tek sayfada birlestirilir;
  // yeniden cizim yok, yalnizca yan yana konuyor.
  const parcalar = [];
  for (const [tema, baslik] of [['deniz','Deniz'], ['bahce','Bahçe'], ['yildizlar','Yıldızlar']]) {
    const s = await baglam.newPage();
    await boyanabilirSayfayaGit(s, { ad: 'Elif', sehir: 'İzmir', yas: 6, tema });
    await boya(s);
    await bekle(300);
    parcalar.push({ baslik, svg: await s.$eval('#sahne', (e) => e.outerHTML) });
    await s.close();
    console.log(`  sahne alindi: ${tema}`);
  }
  const stil = await sayfa.$$eval('style', (e) => e.map((x) => x.textContent).join('\n'));
  const birlesik = `<!doctype html><meta charset="utf-8"><style>${stil}
    body{margin:0;background:#faf6ef;font-family:Georgia,serif}
    .sira{display:flex;gap:18px;padding:20px}
    .hucre{flex:1;background:#fff;border:2px solid #e6ded0;border-radius:14px;padding:10px}
    .ad{font-size:13px;color:#8a8178;text-align:center;margin:2px 0 8px}
    svg.sahne .b{transition:none}
  </style><div class="sira">${
    parcalar.map((p) => `<div class="hucre"><div class="ad">${p.baslik}</div>${p.svg}</div>`).join('')
  }</div>`;
  const birlesikSayfa = await baglam.newPage();
  await birlesikSayfa.setViewportSize({ width: 1180, height: 320 });
  await birlesikSayfa.setContent(birlesik);
  await bekle(400);
  await birlesikSayfa.locator('.sira').screenshot({ path: path.join(KOK, 'assets', 'sahneler.png') });
  console.log('yazildi: assets/sahneler.png');

  await baglam.close();
} finally {
  await tarayici.close();
  sunucu.kill();
}
