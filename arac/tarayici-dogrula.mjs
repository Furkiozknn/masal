// Uygulamayi gercek bir tarayicida kullanir ve bir cocugun/ebeveynin
// karsilasacagi uc seyi denetler:
//
//     npx --yes playwright@1 install chromium     (bir kez)
//     node arac/tarayici-dogrula.mjs
//
// 1. AKIS, IKI EKRAN GENISLIGINDE (390 telefon, 1012 tablet/masaustu)
//    Form -> masal -> boya -> secim -> son sayfa -> kitaplik. Konsolda hata ya
//    da uyari, yakalanmamis istisna, yatay tasma: hepsi kirmizi. `node --test`
//    saf mantigi sinar; app.js'in DOM'a baglandigi yeri hicbir test gormez.
//
// 2. TEMIZLE GERI ALINABILIR
//    Ilk halinde bitmis bir resimde "Temizle" kutlamayi ve kimildayan sahneyi
//    acik birakiyordu, "Geri al" da resmi geri getiremiyordu. boyama.test.js
//    gecmis kuralini sinar; burasi o kuralin app.js'e gercekten bagli oldugunu.
//
// 3. DAGITIM, SAYFAYI ONCEDEN ACMIS KULLANICIYA ULASIYOR
//    Deponun bir kopyasi sunuluyor, sayfa acilip servis iscisi kuruluyor,
//    sonra kopyadaki hikayeler.js degistiriliyor (yeni dagitim) ve sayfa
//    yenileniyor: yeni metin gorunmeli. Ardindan ag kesiliyor: uygulama yine
//    acilmali. Ilk sw.js (once onbellek, sabit surum) birinci kontrolde
//    kaliyordu: kullanici eski surumde takili kaliyordu.
//
// Cikis kodu: sorun varsa 1, playwright yoksa 2.
import { spawn } from 'node:child_process';
import { setTimeout as bekle } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const yukle = (ad) => { try { return require(ad); } catch { return null; } };

let sorunSayisi = 0;
const sorun = (m) => { sorunSayisi++; console.log('HATA  ' + m); };
const tamam = (m) => console.log('ok    ' + m);

async function sunucuBaslat(kok, port) {
  const p = spawn('python3', [path.join(KOK, 'sunucu.py'), String(port)], { cwd: kok, stdio: 'ignore' });
  const adres = `http://127.0.0.1:${port}/`;
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(adres)).ok) return { p, adres }; } catch {}
    await bekle(250);
  }
  p.kill();
  throw new Error(`sunucu ${port} portunda acilmadi`);
}

/** Konsol hatalari, istisnalar ve basarisiz istekler. */
function dinle(sayfa, liste, { swUyarisi = false } = {}) {
  sayfa.on('pageerror', (e) => liste.push('istisna: ' + e.message));
  sayfa.on('console', (m) => {
    if (m.type() !== 'error' && m.type() !== 'warning') return;
    // serviceWorkers:'block' baglaminda Playwright'in kendi uyarisi; uygulamadan degil
    if (swUyarisi && /Service Worker registration blocked by Playwright/.test(m.text())) return;
    liste.push(`${m.type()}: ${m.text()}`);
  });
  sayfa.on('requestfailed', (r) => liste.push('istek dustu: ' + r.url()));
}

async function akis(tarayici, adres, genislik) {
  const baglam = await tarayici.newContext({ viewport: { width: genislik, height: 844 }, serviceWorkers: 'block' });
  const sayfa = await baglam.newPage();
  const hatalar = [];
  dinle(sayfa, hatalar, { swUyarisi: true });
  const tasma = () => sayfa.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const durum = () => sayfa.evaluate(() => ({
    kutlama: document.querySelector('#durum').classList.contains('kutlama'),
    canli: document.querySelector('#sahne').classList.contains('canli'),
    boyali: [...document.querySelectorAll('#sahne .b')].filter((e) => e.style.fill).length,
    toplam: document.querySelectorAll('#sahne .b').length,
  }));
  const et = `${genislik}px`;

  try {
    await sayfa.goto(adres, { waitUntil: 'networkidle' });
    if (await tasma() > 0) sorun(`${et} form ekrani yatay tasiyor`);

    await sayfa.fill('#ad', 'Ada');
    await sayfa.fill('#sehir', 'Sinop');
    await sayfa.selectOption('#tema', 'deniz');
    await sayfa.click('#olustur');
    await sayfa.waitForSelector('#okuyucuEkran:not([hidden])');
    const metin = await sayfa.textContent('#hMetin');
    if (!metin.includes('Ada') || !metin.includes('Sinop')) sorun(`${et} masal metni ad/sehir icermiyor: ${metin.slice(0, 60)}`);

    let temizlendi = false, secildi = false, sonaVarildi = false;
    for (let i = 0; i < 12; i++) {
      if (await tasma() > 0) sorun(`${et} okuyucu sayfa ${i + 1} yatay tasiyor`);
      if (await sayfa.isVisible('#secim')) { await sayfa.click('#secimA'); secildi = true; }

      if (!temizlendi && await sayfa.isVisible('#palet')) {
        await sayfa.locator('#palet .renk').nth(0).click();
        const n = (await durum()).toplam;
        for (let k = 0; k < n; k++) await sayfa.locator('#sahne .b').nth(k).dispatchEvent('click');
        const bitti = await durum();
        if (!(bitti.kutlama && bitti.canli && bitti.boyali === n)) sorun(`${et} resim bitince kutlama yok: ${JSON.stringify(bitti)}`);

        await sayfa.click('#palet [data-rol=temizle]');
        const temiz = await durum();
        if (temiz.boyali || temiz.kutlama || temiz.canli) {
          sorun(`${et} temizle sonrasi resim/kutlama kaldi: ${JSON.stringify(temiz)}`);
        }
        await sayfa.click('#palet [data-rol=geriAl]');
        const geri = await durum();
        if (geri.boyali !== n || !geri.kutlama) sorun(`${et} temizle geri alinamadi: ${geri.boyali}/${n} bolge geri geldi`);
        else tamam(`${et} temizle -> geri al: ${n}/${n} bolge geri geldi`);
        temizlendi = true;
      }

      if (await sayfa.isDisabled('#ileri')) { sonaVarildi = true; break; }
      await sayfa.click('#ileri');
    }
    if (!temizlendi) sorun(`${et} boyanabilir sayfa gorulmedi`);
    if (!secildi) sorun(`${et} secim ekrani gorulmedi`);
    if (!sonaVarildi) sorun(`${et} son sayfaya varilamadi`);
    if (!(await sayfa.isVisible('#oneri'))) sorun(`${et} son sayfada baska masal onerisi yok`);

    await sayfa.click('#yeniden');
    const kitaplik = await sayfa.textContent('#kitaplik');
    if (!kitaplik.includes('Ada')) sorun(`${et} kitaplikta okunan masal yok`);
    // Kitaplik, sayfa yenilendikten sonra da masali acabiliyor mu
    await sayfa.reload({ waitUntil: 'networkidle' });
    await sayfa.locator('#kitaplik .kitap-ac').first().click();
    if (await tasma() > 0) sorun(`${et} kitaplik yatay tasiyor`);

    if (hatalar.length) for (const h of hatalar) sorun(`${et} ${h}`);
    else tamam(`${et} akis tamam: form -> masal -> boya -> secim -> son -> kitaplik, konsol temiz, tasma yok`);
  } finally {
    await baglam.close();
  }
}

async function dagitim(tarayici) {
  // Deponun izlenen uygulama dosyalarinin bir kopyasi: asil depoya dokunulmaz.
  const kopya = fs.mkdtempSync(path.join(os.tmpdir(), 'masal-sw-'));
  for (const ad of fs.readdirSync(KOK)) {
    if (/\.(js|html|webmanifest)$/.test(ad) && !ad.endsWith('.test.js')) fs.copyFileSync(path.join(KOK, ad), path.join(kopya, ad));
  }
  fs.cpSync(path.join(KOK, 'assets'), path.join(kopya, 'assets'), { recursive: true });

  const { p, adres } = await sunucuBaslat(kopya, 8794);
  const baglam = await tarayici.newContext({ viewport: { width: 390, height: 844 } });
  const sayfa = await baglam.newPage();
  const hatalar = [];
  dinle(sayfa, hatalar);
  try {
    await sayfa.goto(adres, { waitUntil: 'networkidle' });
    await sayfa.evaluate(() => navigator.serviceWorker.ready);
    await sayfa.reload({ waitUntil: 'networkidle' });
    if (!(await sayfa.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
      sorun('servis iscisi sayfayi kontrol etmiyor');
      return;
    }
    const once = await sayfa.textContent('#fBaslik');

    // Yeni dagitim: formun basligi degisiyor, sw.js degismiyor.
    const f = path.join(kopya, 'hikayeler.js');
    const YENI = 'YENI DAGITIM';
    fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replaceAll(`'${once}'`, `'${YENI}'`));
    await sayfa.reload({ waitUntil: 'networkidle' });
    const sonra = await sayfa.textContent('#fBaslik');
    if (sonra !== YENI) sorun(`yeni dagitim onceden ziyaret etmis kullaniciya ulasmadi: "${sonra}" (beklenen "${YENI}")`);
    else tamam('yeni dagitim, sayfayi onceden acmis kullaniciya ilk yenilemede ulasti');

    // Cevrimdisi: ag kesik, uygulama yine acilmali -- ve son gorulen surumle.
    await baglam.setOffline(true);
    await sayfa.reload();
    await sayfa.waitForSelector('#form');
    const cevrimdisi = await sayfa.textContent('#fBaslik');
    if (cevrimdisi !== YENI) sorun(`cevrimdisi acilis eski/bos: "${cevrimdisi}"`);
    else tamam('ag kesikken uygulama son gorulen surumle acildi');
    await sayfa.fill('#ad', 'Ada');
    await sayfa.click('#olustur');
    if (!(await sayfa.isVisible('#okuyucuEkran'))) sorun('cevrimdisi masal olusturulamadi');
    else tamam('ag kesikken masal olusturuldu');
    await baglam.setOffline(false);

    const gercek = hatalar.filter((h) => !/istek dustu|ERR_INTERNET_DISCONNECTED/.test(h));
    for (const h of gercek) sorun(`servis iscisi: ${h}`);
  } finally {
    await baglam.close();
    p.kill();
    fs.rmSync(kopya, { recursive: true, force: true });
  }
}

async function main() {
  const pw = yukle('playwright') || yukle('playwright-core');
  if (!pw) {
    console.log('playwright gerekiyor; bu deponun bagimliligi degil:');
    console.log('  npm install --no-save --no-package-lock playwright-core');
    console.log('  npx --yes playwright@1 install chromium');
    return 2;
  }
  const tarayici = await pw.chromium.launch(
    process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  );
  const { p, adres } = await sunucuBaslat(KOK, 8797);
  try {
    for (const g of [390, 1012]) await akis(tarayici, adres, g);
    await dagitim(tarayici);
  } finally {
    await tarayici.close();
    p.kill();
  }
  console.log('');
  console.log(sorunSayisi ? `${sorunSayisi} sorun` : 'tarayicida her sey yolunda');
  return sorunSayisi ? 1 : 0;
}

process.exit(await main());
