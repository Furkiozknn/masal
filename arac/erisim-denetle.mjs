// Erisilebilirligi, uygulamanin KULLANILDIGI ekranlarda olcer.
//
//     npx playwright-core install chromium     (bir kez)
//     node arac/erisim-denetle.mjs
//
// NEDEN VAR. README "Lighthouse mobil: erisilebilirlik ... 100" diyordu ve
// bu dogruydu - Lighthouse'un olctugu ekranda. Lighthouse sayfayi acar ve
// acildigi haliyle denetler; burada acilan ekran FORM. Cocugun masali
// okudugu ekran hic denetlenmemisti.
//
// Denetlenince iki WCAG AA ihlali cikti, ikisi de okuma ekraninda:
//
//   .metin b        #c0562f / kagit  = 4.37:1   (esik 4.5)
//   figcaption      #8a8178 / beyaz  = 3.82:1
//
// Birincisi cocugun KENDI ADI: her sayfada bu renkle kalin yaziliyor, yani
// sayfadaki en cok okunan kelime. Ve index.html'in o satirindaki yorum zaten
// "kagit uzerinde 4.37:1" yaziyordu - olculmus, yazilmis, oyle birakilmis.
//
// Bu betik o kor noktayi kapatiyor: form, okuyucu, boyanmis sayfa, secim
// ekrani ve kitaplik ayri ayri denetleniyor. axe-core ve playwright bu
// deponun bagimliligi DEGIL (masal'in hic bagimliligi yok); ekran-yakala.mjs
// ile ayni sekilde, elle ya da CI'da anlik kuruluyor.
//
// Cikis kodu: ihlal varsa 1, tarayici/axe yoksa 2.
import { spawn } from 'node:child_process';
import { setTimeout as bekle } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8793;
const ADRES = `http://127.0.0.1:${PORT}/`;

// WCAG 2.1 AA'nin tamami. "Best practice" kurallari bilerek disarida:
// onlar tavsiye, bu kapi ise gecilmesi gereken esik.
const ETIKETLER = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const require = createRequire(import.meta.url);

function yukle(ad) {
  try { return require(ad); } catch { return null; }
}

async function sunucuBaslat() {
  const p = spawn('python3', ['sunucu.py', String(PORT)], { cwd: KOK, stdio: 'ignore' });
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(ADRES)).ok) return p; } catch {}
    await bekle(250);
  }
  p.kill();
  throw new Error(`sunucu ${PORT} portunda acilmadi`);
}

let toplam = 0;

async function denetle(sayfa, axeKaynak, etiket) {
  await sayfa.addScriptTag({ content: axeKaynak });
  const sonuc = await sayfa.evaluate(
    async (etiketler) => await window.axe.run(document, {
      runOnly: { type: 'tag', values: etiketler },
    }),
    ETIKETLER,
  );
  const ihlaller = sonuc.violations;
  if (!ihlaller.length) {
    console.log(`ok    ${etiket}`);
    return;
  }
  toplam += ihlaller.length;
  console.log(`HATA  ${etiket}: ${ihlaller.length} ihlal`);
  for (const v of ihlaller) {
    console.log(`        [${v.impact}] ${v.id} x${v.nodes.length} - ${v.help}`);
    for (const n of v.nodes.slice(0, 3)) {
      const ozet = (n.failureSummary || '').split('\n').slice(1).join(' ').trim();
      console.log(`          ${n.target.join(' ')}`);
      if (ozet) console.log(`          ${ozet}`);
    }
  }
}

async function main() {
  const axeYol = (() => {
    try { return require.resolve('axe-core/axe.min.js'); } catch { return null; }
  })();
  const pw = yukle('playwright') || yukle('playwright-core');
  if (!axeYol || !pw) {
    console.log('axe-core ve playwright gerekiyor; bu deponun bagimliligi degiller:');
    console.log('  npm install --no-save axe-core playwright');
    console.log('  npx playwright-core install chromium');
    return 2;
  }
  const axeKaynak = fs.readFileSync(axeYol, 'utf8');

  const sunucu = await sunucuBaslat();
  const tarayici = await pw.chromium.launch(
    process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  );
  try {
    // Telefon genisligi: bu uygulamanin okundugu yer bir tablet ya da
    // telefon, ve dar ekranda metin buyuyup kontrast sorunlari gorunur hale
    // geliyor.
    const sayfa = await tarayici.newPage({ viewport: { width: 390, height: 844 } });

    await sayfa.goto(ADRES, { waitUntil: 'networkidle' });
    await denetle(sayfa, axeKaynak, 'form ekrani');

    await sayfa.fill('#ad', 'Elif');
    await sayfa.fill('#sehir', 'Trabzon');
    await sayfa.selectOption('#yas', '5');
    await sayfa.click('#olustur');
    await sayfa.waitForSelector('#sahne', { timeout: 10000 });
    await bekle(400);
    await denetle(sayfa, axeKaynak, 'okuyucu, ilk sayfa');

    // Secim ekrani ve boyanmis sayfa: ikisi de yalnizca ilerleyince cikiyor,
    // ve ikisi de yeni renk/metin getiriyor. Tek bir ileri-dongusu ikisini de
    // gorene kadar donuyor; ilk surum boyanabilir sayfada `break` ediyordu ve
    // secim ekrani (sayfa 3) hic denetlenmiyordu - tam da bu betigin
    // varolus sebebi olan hata, bir kez daha.
    let boyandi = false;
    let secimGoruldu = false;
    for (let i = 0; i < 12 && !(boyandi && secimGoruldu); i++) {
      if (!secimGoruldu && await sayfa.locator('#secimA').isVisible().catch(() => false)) {
        await denetle(sayfa, axeKaynak, 'secim ekrani');
        secimGoruldu = true;
        await sayfa.click('#secimA');
      } else if (!boyandi && !(await sayfa.$eval('#palet', (e) => e.hidden))) {
        const renk = sayfa.locator('.palet .renk').nth(3);
        await renk.click();
        await sayfa.$$eval('#sahne .b', (els) => {
          for (const el of els.slice(0, 4)) {
            el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
            el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
        });
        await bekle(300);
        await denetle(sayfa, axeKaynak, 'boyanmis sayfa');
        boyandi = true;
      } else if (await sayfa.locator('#ileri').isVisible().catch(() => false)) {
        await sayfa.click('#ileri');
      } else {
        break;
      }
      await bekle(350);
    }
    for (const [gorundu, ad] of [[boyandi, 'boyanabilir sayfa'], [secimGoruldu, 'secim ekrani']]) {
      if (!gorundu) {
        console.log(`HATA  ${ad} hic gorunmedi - akis degismis olabilir, denetim eksik kaldi`);
        toplam += 1;
      }
    }

    // Son sayfa: kutlama ve oneriler ayri renkler kullaniyor.
    for (let i = 0; i < 8; i++) {
      if (!(await sayfa.locator('#ileri').isVisible().catch(() => false))) break;
      if (await sayfa.locator('#ileri').isDisabled().catch(() => false)) break;
      await sayfa.click('#ileri');
      await bekle(250);
    }
    await denetle(sayfa, axeKaynak, 'son sayfa');

    // Kitaplik: forma donunce doluyor.
    await sayfa.goto(ADRES, { waitUntil: 'networkidle' });
    await bekle(500);
    await denetle(sayfa, axeKaynak, 'kitaplik dolu form ekrani');
  } finally {
    await tarayici.close();
    sunucu.kill();
  }

  console.log('');
  console.log(toplam ? `${toplam} ihlal` : 'butun ekranlar WCAG 2.1 AA gecti');
  return toplam ? 1 : 0;
}

process.exit(await main());
