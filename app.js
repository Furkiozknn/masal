import { SAHNELER } from './sahneler.js';
import { METINLER, dilSec, hikayeUret } from './hikayeler.js';

const $ = (id) => document.getElementById(id);
// Acik ve koyu tonlar birlikte: gokyuzu ile deniz, cimen ile yaprak ayirt edilebilsin.
const RENKLER = ['#e8574a','#f2a03d','#f5d547','#8fcf7a','#5aa469','#8ec5e0','#3d7ea6','#8e6bbf','#8a5a3b','#f4a9a0','#fff6e0','#2c2a26'];

let dil = dilSec(localStorage.getItem('masal:dil'));
let hikaye = null;          // { baslik, sayfalar }
let kimlik = null;          // { ad, yas, sehir, tema } — kayit anahtarinin parcasi
let sayfaNo = 0;            // gorunur sayfalar icindeki sira (dala gore degisir)
let dal = null;             // 'a' | 'b' | null — secim noktasinda belirlenir
let renk = RENKLER[6];
const gecmis = [];          // { anahtar, i, onceki } — geri al

// ---------- dil ----------
function ui() { return METINLER[dil].ui; }

function dilleriKur() {
  const s = $('dilSec');
  s.innerHTML = '';
  for (const [kod, paket] of Object.entries(METINLER)) {
    const o = document.createElement('option');
    o.value = kod; o.textContent = paket.ad; o.selected = kod === dil;
    s.appendChild(o);
  }
  s.onchange = () => {
    dil = s.value;
    localStorage.setItem('masal:dil', dil);
    document.documentElement.lang = dil;
    metinleriYaz();
    sesiDurdur();
    kitapligiCiz();                   // basliklar da yeni dilde uretilsin
    if (hikaye) { hikaye = hikayeUret({ dil, ...kimlik }); sayfaCiz(); }
  };
}

function metinleriYaz() {
  const t = ui();
  document.documentElement.lang = dil;
  $('fBaslik').textContent = t.baslik;
  $('fAciklama').textContent = t.altBaslik;
  $('lAd').textContent = t.adAlan;
  $('lYas').textContent = t.yasAlan;
  $('lSehir').textContent = t.sehirAlan;
  $('lTema').textContent = t.temaAlan;
  $('olustur').textContent = t.olustur;
  $('geri').textContent = '‹ ' + t.geri;
  $('ileri').textContent = t.ileri + ' ›';
  $('yeniden').textContent = t.yeniden;
  $('boyaIpucu').textContent = t.boyaIpucu;

  // yas listesi (3-9)
  const y = $('yas'), secili = y.value || '5';
  y.innerHTML = '';
  for (let i = 3; i <= 9; i++) {
    const o = document.createElement('option');
    o.value = i; o.textContent = i; o.selected = String(i) === secili;
    y.appendChild(o);
  }
  // tema listesi
  const tm = $('tema'), seciliTema = tm.value || 'deniz';
  tm.innerHTML = '';
  for (const [kod, ad] of Object.entries(METINLER[dil].temalar)) {
    const o = document.createElement('option');
    o.value = kod; o.textContent = ad; o.selected = kod === seciliTema;
    tm.appendChild(o);
  }
}

// ---------- dallar ----------
// Hikaye bir secim noktasi tasiyor. Dal sayfalari yalnizca secilen dalda gorunur;
// gerisi herkese ortak. Boylece ayni temayi secen iki aile ayni seyi okumuyor.
function aktifSayfalar() {
  return hikaye.sayfalar.filter((s) => !s.dal || s.dal === dal);
}

/** Gosterilecek toplam sayfa: ortak sayfalar + bir dalin uzunlugu. Secim
 *  yapilmamisken de dogru sayiyi gostermek icin 'a' dali olculuyor. */
function toplamSayfa() {
  const ortak = hikaye.sayfalar.filter((s) => !s.dal).length;
  return ortak + hikaye.sayfalar.filter((s) => s.dal === 'a').length;
}

// ---------- boyama ----------
// Anahtar gorunur sirayi degil sablondaki gercek sirayi kullanir: dal degisince
// gorunur sira kayiyor, boyamanin baska sayfaya gecmemesi gerekiyor.
function anahtar(sayfa = aktifSayfalar()[sayfaNo]) {
  return `masal:boya:${kimlik.ad}:${kimlik.tema}:${hikaye.sayfalar.indexOf(sayfa)}`;
}

function paletiKur() {
  const p = $('palet');
  if (p.dataset.kuruldu) return;
  p.dataset.kuruldu = '1';
  RENKLER.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'renk'; b.style.background = c;
    b.setAttribute('aria-label', c);
    b.setAttribute('aria-pressed', String(c === renk));
    b.onclick = () => {
      renk = c;
      p.querySelectorAll('.renk').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
    };
    p.appendChild(b);
  });
  [['geriAl', geriAl], ['temizle', temizle]].forEach(([ad, fn]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'arac'; b.dataset.rol = ad;
    b.onclick = fn;
    p.appendChild(b);
  });
}

function araclariAdlandir() {
  const t = ui();
  document.querySelectorAll('.arac').forEach((b) => { b.textContent = t[b.dataset.rol]; });
}

function bolgeler() { return [...$('sahne').querySelectorAll('.b')]; }

/** Durum satiri: bos, "kaydedildi n/m" ya da resim bitince kutlama. */
function durumYaz(n, toplam) {
  const el = $('durum');
  const bitti = toplam > 0 && n === toplam;
  el.classList.toggle('kutlama', bitti);
  el.textContent = bitti ? `${ui().kutlama} 🎉`
                 : n ? `${ui().kaydedildi} · ${n}/${toplam}` : '';
}

function boyaKaydet() {
  const bs = bolgeler();
  const d = {};
  bs.forEach((el, i) => { if (el.style.fill) d[i] = el.style.fill; });
  // kota dolu / gizli sekme olabilir: kayit basarisiz olsa da boyama calismaya devam eder
  try { localStorage.setItem(anahtar(), JSON.stringify(d)); } catch {}
  durumYaz(Object.keys(d).length, bs.length);
}

function boyaYukle() {
  let d = {};
  try { d = JSON.parse(localStorage.getItem(anahtar()) || '{}'); } catch {}
  const bs = bolgeler();
  Object.entries(d).forEach(([i, c]) => { if (bs[i]) bs[i].style.fill = c; });
  durumYaz(Object.keys(d).length, bs.length);
}

function geriAl() {
  const a = anahtar();
  for (let i = gecmis.length - 1; i >= 0; i--) {
    if (gecmis[i].anahtar !== a) continue;
    const [s] = gecmis.splice(i, 1);
    const el = bolgeler()[s.i];
    if (el) el.style.fill = s.onceki;
    boyaKaydet();
    return;
  }
}

function temizle() {
  bolgeler().forEach((el) => { el.style.fill = ''; });
  localStorage.removeItem(anahtar());
  $('durum').textContent = '';
}

// ---------- sesli okuma ----------
// Tarayicinin kendi konusma motoru: sunucu yok, maliyet yok, anahtar yok.
// Ses listesi asenkron gelir ve cihaza gore degisir; o dilde ses yoksa
// dugmeyi hic gostermiyoruz (Turkce sesi olmayan Windows'ta oldugu gibi).
const konusmaVar = 'speechSynthesis' in window;

function dilinSesi() {
  if (!konusmaVar) return null;
  const hedef = dil === 'tr' ? 'tr' : 'en';
  return speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(hedef)) || null;
}

function sesDugmesiniTazele() {
  const d = $('sesli');
  const ses = dilinSesi();
  d.hidden = !ses;
  if (ses) d.textContent = speechSynthesis.speaking ? ui().durdur : ui().dinle;
  d.setAttribute('aria-pressed', String(Boolean(konusmaVar && speechSynthesis.speaking)));
}

function sesiDurdur() {
  if (konusmaVar) speechSynthesis.cancel();
  sesDugmesiniTazele();
}

function seslendir() {
  const ses = dilinSesi();
  if (!ses) return;
  if (speechSynthesis.speaking) { sesiDurdur(); return; }
  const s = new SpeechSynthesisUtterance($('hMetin').textContent);
  s.voice = ses;
  s.lang = ses.lang;
  s.rate = 0.9;                       // cocuk icin biraz yavas
  s.onend = sesDugmesiniTazele;
  s.onerror = sesDugmesiniTazele;
  speechSynthesis.speak(s);
  sesDugmesiniTazele();
}

if (konusmaVar) {
  speechSynthesis.addEventListener('voiceschanged', sesDugmesiniTazele);
  $('sesli').onclick = seslendir;
}

// ---------- kitaplik ----------
// Okunan masallar birikir ve kaldigi sayfadan devam edilir: geri donmek icin
// sebep olur. Kayit tarayicida durur, sunucu yok.
const KITAPLIK = 'masal:kitaplik';

function kitapligiOku() {
  try {
    const v = JSON.parse(localStorage.getItem(KITAPLIK) || '[]');
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

function kitapligaYaz(liste) {
  try { localStorage.setItem(KITAPLIK, JSON.stringify(liste.slice(0, 12))); } catch {}
}

/** Ayni cocuk + ayni tema tek kayit: ilerleme uzerine yazilir. */
function kitapligaKaydet() {
  if (!kimlik) return;
  const liste = kitapligiOku().filter((k) => !(k.ad === kimlik.ad && k.tema === kimlik.tema));
  // Dil bilerek saklanmiyor: kitaplik her zaman o an secili dilde gosterilir.
  // Dal saklaniyor: devam edince cocuk kendi sectigi yolda kalsin.
  liste.unshift({ ...kimlik, sayfaNo, dal, sayfaSayisi: toplamSayfa(),
                  hamSayfa: hikaye.sayfalar.length, guncelleme: Date.now() });
  kitapligaYaz(liste);
}

/** Bir kayittaki toplam boyali bolge sayisi. Anahtarlar sablondaki ham sirayi
 *  kullandigi icin dal sayfalari dahil hepsi taraniyor. */
function boyaliSayisi(k, hamSayfa) {
  let n = 0;
  for (let i = 0; i < (hamSayfa || k.hamSayfa || 12); i++) {
    try {
      const d = JSON.parse(localStorage.getItem(`masal:boya:${k.ad}:${k.tema}:${i}`) || '{}');
      n += Object.keys(d).length;
    } catch {}
  }
  return n;
}

function kitapligiCiz() {
  const liste = kitapligiOku();
  const t = ui();
  $('kitaplikBaslik').textContent = t.kitaplik;
  $('kitaplikBolum').hidden = liste.length === 0;
  const ul = $('kitaplik');
  ul.innerHTML = '';

  for (const k of liste) {
    // dil sonra yayiliyor: eski kayitlarda saklanmis bir dil alani secili dili ezmesin
    const h = hikayeUret({ ...k, dil });
    const baslik = h.baslik;
    const toplam = k.sayfaSayisi || 6;
    const bitti = k.sayfaNo >= toplam - 1;
    const boyali = boyaliSayisi(k, h.sayfalar.length);
    const yuzde = Math.round(((k.sayfaNo + 1) / toplam) * 100);

    const li = document.createElement('li');

    const ac = document.createElement('button');
    ac.type = 'button'; ac.className = 'kitap-ac';
    const ad = document.createElement('div');
    ad.className = 'kitap-ad'; ad.textContent = baslik;
    const alt = document.createElement('div');
    alt.className = 'kitap-alt';
    const durum = bitti ? t.bitti : `${t.sayfa} ${k.sayfaNo + 1}/${toplam}`;
    alt.textContent = boyali
      ? `${durum} · ${boyali} ${t.bolgeBoyandi}`
      : durum;
    const cubuk = document.createElement('div');
    cubuk.className = 'kitap-ilerleme';
    cubuk.innerHTML = `<i style="width:${yuzde}%"></i>`;
    ac.append(ad, alt, cubuk);
    // aria-label yok: dugmenin kendi metni (baslik + kalinan sayfa) zaten okunuyor.
    // Ayri bir etiket koymak gorunen metinle uyusmuyor ve ekran okuyucuda sorun cikariyor.
    ac.onclick = () => kitaptanAc(k);

    const sil = document.createElement('button');
    sil.type = 'button'; sil.className = 'kitap-sil'; sil.textContent = t.sil;
    sil.setAttribute('aria-label', `${baslik} — ${t.sil}`);
    sil.onclick = () => kitaptanSil(k);

    li.append(ac, sil);
    ul.appendChild(li);
  }
}

function kitaptanAc(k) {
  kimlik = { ad: k.ad, yas: k.yas, sehir: k.sehir, tema: k.tema };
  hikaye = hikayeUret({ ...kimlik, dil });
  dal = k.dal || null;                                // cocuk kendi sectigi yolda devam etsin
  sayfaNo = Math.min(k.sayfaNo || 0, aktifSayfalar().length - 1);
  okuyucuyaGec();
}

function kitaptanSil(k) {
  if (!confirm(ui().silOnay)) return;                 // boyamalar da gidiyor: once sor
  kitapligaYaz(kitapligiOku().filter((x) => !(x.ad === k.ad && x.tema === k.tema)));
  for (let i = 0; i < (k.hamSayfa || 12); i++) {
    localStorage.removeItem(`masal:boya:${k.ad}:${k.tema}:${i}`);
  }
  kitapligiCiz();
}

// ---------- okuyucu ----------
function secimCiz(s) {
  const kutu = $('secim');
  if (!s.secim) { kutu.hidden = true; return; }
  kutu.hidden = false;
  const doldur = (x) => x.replaceAll('{ad}', kimlik.ad);
  $('secimSoru').textContent = doldur(s.secim.soru || '');
  for (const [harf, dugme] of [['a', $('secimA')], ['b', $('secimB')]]) {
    dugme.textContent = s.secim[harf];
    dugme.setAttribute('aria-pressed', String(dal === harf));
    dugme.onclick = () => {
      dal = harf;
      sayfaCiz();                     // secim degisince sonraki sayfalar yenilenir
    };
  }
}

function sayfaCiz() {
  sesiDurdur();                       // sayfa degisince okuma devam etmesin
  const sayfalar = aktifSayfalar();
  const s = sayfalar[sayfaNo];
  const t = ui();

  $('hBaslik').textContent = hikaye.baslik;
  // cocugun adini metin icinde vurgula. Ad kullanici girdisi: once kacir, sonra ara.
  const kacir = (x) => x.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const adGuvenli = kacir(kimlik.ad);
  $('hMetin').innerHTML = kacir(s.metin).replaceAll(adGuvenli, `<b>${adGuvenli}</b>`);

  const kutu = $('boyamaKutu');
  const svg = $('sahne');
  if (s.sahne) {
    kutu.hidden = false;
    svg.innerHTML = SAHNELER[s.sahne] || '';
    svg.classList.toggle('donuk', !s.boya);
    $('palet').hidden = !s.boya;
    $('durum').textContent = '';
    if (s.boya) {
      bolgeler().forEach((el, i) => {
        el.addEventListener('click', () => {
          gecmis.push({ anahtar: anahtar(), i, onceki: el.style.fill || '' });
          el.style.fill = renk;
          boyaKaydet();
        });
      });
      boyaYukle();
    }
  } else {
    kutu.hidden = true;
  }

  secimCiz(s);

  // gezinti
  const toplam = toplamSayfa();
  // Dal secilmeden ileri kilitli oldugu icin son sayfaya ancak dal secilince varilir.
  const son = sayfaNo === sayfalar.length - 1;
  const secimBekliyor = Boolean(s.secim) && !dal;
  $('geri').disabled = sayfaNo === 0;
  $('ileri').disabled = son || secimBekliyor;
  $('sayfaBilgi').textContent = son ? t.son : `${t.sayfa} ${sayfaNo + 1} / ${toplam}`;
  $('noktalar').innerHTML = Array.from({ length: toplam })
    .map((_, i) => `<span class="nokta${i === sayfaNo ? ' aktif' : ''}"></span>`).join('');
  $('ustBilgi').textContent = `${kimlik.ad} · ${kimlik.yas} · ${kimlik.sehir || '—'}`;
  araclariAdlandir();
  sesDugmesiniTazele();
  kitapligaKaydet();                  // kaldigi sayfa her gecisde guncellensin
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function okuyucuyaGec() {
  $('formEkran').hidden = true;
  $('okuyucuEkran').hidden = false;
  paletiKur();
  sayfaCiz();
}

// ---------- olaylar ----------
$('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const ad = $('ad').value.trim();
  if (!ad) { $('hata').textContent = ui().adGerekli; $('ad').focus(); return; }
  $('hata').textContent = '';
  kimlik = { ad, yas: $('yas').value, sehir: $('sehir').value.trim(), tema: $('tema').value };
  localStorage.setItem('masal:son', JSON.stringify(kimlik));
  hikaye = hikayeUret({ ...kimlik, dil });
  dal = null;                         // yeni masal: secim bastan yapilacak
  sayfaNo = 0;
  okuyucuyaGec();
});

$('geri').onclick = () => { if (sayfaNo > 0) { sayfaNo--; sayfaCiz(); } };
$('ileri').onclick = () => {
  if ($('ileri').disabled) return;                    // secim bekliyor olabilir
  if (sayfaNo < aktifSayfalar().length - 1) { sayfaNo++; sayfaCiz(); }
};
$('yeniden').onclick = () => {
  sesiDurdur();                       // okuyucudan cikarken ses arkada devam etmesin
  $('okuyucuEkran').hidden = true;
  $('formEkran').hidden = false;
  $('ustBilgi').textContent = '';
  kitapligiCiz();
};
document.addEventListener('keydown', (e) => {
  if ($('okuyucuEkran').hidden) return;
  if (e.key === 'ArrowRight') $('ileri').click();
  if (e.key === 'ArrowLeft') $('geri').click();
});

// ---------- acilis ----------
dilleriKur();
metinleriYaz();
try {
  const son = JSON.parse(localStorage.getItem('masal:son') || 'null');
  if (son) { $('ad').value = son.ad; $('yas').value = son.yas; $('sehir').value = son.sehir; $('tema').value = son.tema; }
} catch {}
kitapligiCiz();
