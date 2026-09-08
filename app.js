import { SAHNELER } from './sahneler.js';
import { METINLER, dilSec, hikayeUret } from './hikayeler.js';

const $ = (id) => document.getElementById(id);
// Acik ve koyu tonlar birlikte: gokyuzu ile deniz, cimen ile yaprak ayirt edilebilsin.
const RENKLER = ['#e8574a','#f2a03d','#f5d547','#8fcf7a','#5aa469','#8ec5e0','#3d7ea6','#8e6bbf','#8a5a3b','#f4a9a0','#fff6e0','#2c2a26'];

let dil = dilSec(localStorage.getItem('masal:dil'));
let hikaye = null;          // { baslik, sayfalar }
let kimlik = null;          // { ad, yas, sehir, tema } — kayit anahtarinin parcasi
let sayfaNo = 0;
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

// ---------- boyama ----------
function anahtar() {
  return `masal:boya:${kimlik.ad}:${kimlik.tema}:${sayfaNo}`;
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

function boyaKaydet() {
  const d = {};
  bolgeler().forEach((el, i) => { if (el.style.fill) d[i] = el.style.fill; });
  try {
    localStorage.setItem(anahtar(), JSON.stringify(d));
    const n = Object.keys(d).length;
    $('durum').textContent = n ? `${ui().kaydedildi} · ${n}/${bolgeler().length}` : '';
  } catch { $('durum').textContent = ''; }   // kota dolu / gizli sekme: boyama yine calisir
}

function boyaYukle() {
  let d = {};
  try { d = JSON.parse(localStorage.getItem(anahtar()) || '{}'); } catch {}
  const bs = bolgeler();
  Object.entries(d).forEach(([i, c]) => { if (bs[i]) bs[i].style.fill = c; });
  const n = Object.keys(d).length;
  $('durum').textContent = n ? `${ui().kaydedildi} · ${n}/${bs.length}` : '';
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

// ---------- okuyucu ----------
function sayfaCiz() {
  const s = hikaye.sayfalar[sayfaNo];
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

  // gezinti
  const son = hikaye.sayfalar.length - 1;
  $('geri').disabled = sayfaNo === 0;
  $('ileri').disabled = sayfaNo === son;
  $('sayfaBilgi').textContent = sayfaNo === son
    ? t.son
    : `${t.sayfa} ${sayfaNo + 1} / ${hikaye.sayfalar.length}`;
  $('noktalar').innerHTML = hikaye.sayfalar
    .map((_, i) => `<span class="nokta${i === sayfaNo ? ' aktif' : ''}"></span>`).join('');
  $('ustBilgi').textContent = `${kimlik.ad} · ${kimlik.yas} · ${kimlik.sehir || '—'}`;
  araclariAdlandir();
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
  hikaye = hikayeUret({ dil, ...kimlik });
  sayfaNo = 0;
  okuyucuyaGec();
});

$('geri').onclick = () => { if (sayfaNo > 0) { sayfaNo--; sayfaCiz(); } };
$('ileri').onclick = () => { if (sayfaNo < hikaye.sayfalar.length - 1) { sayfaNo++; sayfaCiz(); } };
$('yeniden').onclick = () => {
  $('okuyucuEkran').hidden = true;
  $('formEkran').hidden = false;
  $('ustBilgi').textContent = '';
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
