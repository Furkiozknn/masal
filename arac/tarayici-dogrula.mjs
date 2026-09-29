// Uygulamayi gercek bir tarayicida kullanir ve bir cocugun/ebeveynin
// karsilasacagi uc seyi denetler:
//
//     npx playwright-core install chromium     (bir kez)
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

// Govde tuketilmezse Node 24'te undici HTTP/1.0 baglanti kapanisinda AssertionError ile dusuyor.
async function hazirMi(adres) {
  const r = await fetch(adres);
  await r.arrayBuffer();
  return r.ok;
}

async function sunucuBaslat(kok, port) {
  const p = spawn('python3', [path.join(KOK, 'sunucu.py'), String(port)], { cwd: kok, stdio: 'ignore' });
  const adres = `http://127.0.0.1:${port}/`;
  for (let i = 0; i < 40; i++) {
    try { if (await hazirMi(adres)) return { p, adres }; } catch {}
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
    // Windows: sunucu sureci klasoru henuz birakmamis olabilir; gecici kopya, kalirsa sorun degil.
    try { fs.rmSync(kopya, { recursive: true, force: true }); } catch {}
  }
}

// 4. YENILEME: DIL KABUGU, DOKUNMA HEDEFLERI, MASAL SONU, ILERLEME, HAREKET
//    Tarayici dili en-US ise arayuz Ingilizce, tr-TR ise Turkce olmali; secilen
//    dil yenilemeden sonra da kalmali (localStorage). Butun dokunulabilir
//    ogeler >= 44 px (cocuk parmagi). Son sayfada "iyi geceler" karti cocugun
//    adiyla gorunmeli, boyama ilerleme cubugu gercek sayiyi tasimali ve
//    prefers-reduced-motion'da yeni animasyonlarin hicbiri calismamali.
async function yenileme(tarayici, adres) {
  const yeni = async (ayar) => {
    const baglam = await tarayici.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', ...ayar });
    const sayfa = await baglam.newPage();
    const hatalar = [];
    dinle(sayfa, hatalar, { swUyarisi: true });
    return { baglam, sayfa, hatalar };
  };
  const yazi = (sayfa, sec) => sayfa.textContent(sec);

  // --- dil kabugu
  {
    const { baglam, sayfa, hatalar } = await yeni({ locale: 'en-US' });
    try {
      await sayfa.goto(adres, { waitUntil: 'networkidle' });
      const lang = await sayfa.evaluate(() => document.documentElement.lang);
      if (lang !== 'en') sorun(`en-US tarayicida html lang=${lang}`);
      if ((await yazi(sayfa, '#olustur')).trim() !== 'Create the story') sorun('en-US: dugme Ingilizce degil');
      if (await sayfa.locator('#guven li').count() !== 3) sorun('en-US: guven satiri uc madde degil');
      if ((await sayfa.getAttribute('#dilSec', 'aria-label')) !== 'Language') sorun('en-US: dil secicinin etiketi Ingilizce degil');
      if (!/Skip/.test(await yazi(sayfa, '#atla'))) sorun('en-US: atlama baglantisi Ingilizce degil');
      await sayfa.selectOption('#dilSec', 'tr');
      if ((await yazi(sayfa, '#olustur')).trim() !== 'Masalı oluştur') sorun('dil Turkceye cevrilince dugme guncellenmedi');
      await sayfa.reload({ waitUntil: 'networkidle' });
      if ((await yazi(sayfa, '#olustur')).trim() !== 'Masalı oluştur') sorun('secilen dil yenilemeden sonra kayboldu');
      else tamam('dil kabugu: en-US -> Ingilizce, secim kalici, TR/EN degisiyor');
    } finally { await baglam.close(); }
    for (const h of hatalar) sorun(`dil kabugu ${h}`);
  }

  // --- tr-TR: varsayilan Turkce; dokunma hedefleri; masal sonu; ilerleme
  {
    const { baglam, sayfa, hatalar } = await yeni({ locale: 'tr-TR', hasTouch: true });
    const kucukler = () => sayfa.evaluate(() => {
      const sec = 'button, select, input, summary, a.atla';
      return [...document.querySelectorAll(sec)].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && e.offsetParent !== null && getComputedStyle(e).visibility !== 'hidden'
          && (r.width < 44 - 0.5 || r.height < 44 - 0.5);
      }).map((e) => `${e.tagName.toLowerCase()}#${e.id || ''}.${e.className || ''} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
    });
    try {
      await sayfa.goto(adres, { waitUntil: 'networkidle' });
      if ((await yazi(sayfa, '#olustur')).trim() !== 'Masalı oluştur') sorun('tr-TR: varsayilan dil Turkce degil');
      await sayfa.click('details.ozel summary');                    // gorunum secimleri acik olsun
      let k = await kucukler();
      if (k.length) sorun(`form: 44px'ten kucuk dokunma hedefi: ${k.join(' | ')}`);
      await sayfa.click('details.ozel summary');

      await sayfa.fill('#ad', 'Ada');
      await sayfa.selectOption('#tema', 'deniz');
      await sayfa.click('#olustur');
      await sayfa.waitForSelector('#okuyucuEkran:not([hidden])');
      const odak = await sayfa.evaluate(() => document.activeElement.id);
      if (odak !== 'hBaslik') sorun(`yeni ekranda odak basliga gitmedi: ${odak}`);
      await sayfa.click('#ileri');                                  // 2. sayfa: boyanabilir sahne
      k = await kucukler();
      if (k.length) sorun(`okuyucu: 44px'ten kucuk dokunma hedefi: ${k.join(' | ')}`);

      const n = await sayfa.locator('#sahne .b').count();
      await sayfa.locator('#palet .renk').nth(1).click();
      for (let i = 0; i < 3; i++) await sayfa.locator('#sahne .b').nth(i).dispatchEvent('click');
      const now = await sayfa.getAttribute('#ilerleme', 'aria-valuenow');
      const max = await sayfa.getAttribute('#ilerleme', 'aria-valuemax');
      if (now !== '3' || max !== String(n)) sorun(`ilerleme cubugu ${now}/${max}, beklenen 3/${n}`);
      else tamam(`boyama ilerlemesi: aria-valuenow ${now}/${max}`);
      if (!(await sayfa.locator('#sahne .b.pop').count())) sorun('boyanan bolgede geri bildirim (pop) yok');

      // son sayfaya kadar: masal sonu karti
      for (let i = 0; i < 12; i++) {
        if (await sayfa.isVisible('#secim')) await sayfa.click('#secimA');
        if (await sayfa.isDisabled('#ileri')) break;
        await sayfa.click('#ileri');
      }
      if (!(await sayfa.isVisible('#sonKart'))) sorun('son sayfada masal sonu karti gorunmuyor');
      else if (!(await yazi(sayfa, '#sonBaslik')).includes('Ada')) sorun('masal sonu karti cocugun adini tasimiyor');
      else tamam('masal sonu karti: "' + (await yazi(sayfa, '#sonBaslik')).trim() + '"');
      await sayfa.click('#bastan');
      if (!(await sayfa.isDisabled('#geri'))) sorun('"Baştan oku" ilk sayfaya donmedi');
      if (await sayfa.isVisible('#sonKart')) sorun('ilk sayfada masal sonu karti acik kaldi');
    } finally { await baglam.close(); }
    for (const h of hatalar) sorun(`kabuk ${h}`);
  }

  // --- prefers-reduced-motion: yeni animasyonlarin hicbiri calismamali
  {
    const { baglam, sayfa, hatalar } = await yeni({ locale: 'tr-TR', reducedMotion: 'reduce' });
    try {
      await sayfa.goto(adres, { waitUntil: 'networkidle' });
      await sayfa.fill('#ad', 'Ada');
      await sayfa.click('#olustur');
      await sayfa.waitForSelector('#okuyucuEkran:not([hidden])');
      await sayfa.click('#ileri');
      await sayfa.locator('#sahne .b').first().dispatchEvent('click');
      const hareket = await sayfa.evaluate(() => {
        const ad = (e) => (e ? getComputedStyle(e).animationName : 'yok');
        return { gecis: ad(document.querySelector('#hMetin')), pop: ad(document.querySelector('#sahne .b.pop')) };
      });
      if (hareket.gecis !== 'none' || hareket.pop !== 'none') sorun(`reduced-motion: animasyon calisiyor ${JSON.stringify(hareket)}`);
      for (let i = 0; i < 12; i++) {
        if (await sayfa.isVisible('#secim')) await sayfa.click('#secimA');
        if (await sayfa.isDisabled('#ileri')) break;
        await sayfa.click('#ileri');
      }
      const son = await sayfa.evaluate(() => getComputedStyle(document.querySelector('#sonKart')).animationName);
      if (son !== 'none') sorun(`reduced-motion: masal sonu animasyonu calisiyor (${son})`);
      else tamam('prefers-reduced-motion: sayfa gecisi, pop ve masal sonu animasyonu kapali');
    } finally { await baglam.close(); }
    for (const h of hatalar) sorun(`reduced-motion ${h}`);
  }
}

async function main() {
  const pw = yukle('playwright') || yukle('playwright-core');
  if (!pw) {
    console.log('playwright gerekiyor; bu deponun bagimliligi degil:');
    console.log('  npm install --no-save --no-package-lock playwright-core');
    console.log('  npx playwright-core install chromium');
    return 2;
  }
  const tarayici = await pw.chromium.launch(
    process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  );
  const { p, adres } = await sunucuBaslat(KOK, 8797);
  try {
    for (const g of [390, 1012]) await akis(tarayici, adres, g);
    await yenileme(tarayici, adres);
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
