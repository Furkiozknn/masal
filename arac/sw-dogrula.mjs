#!/usr/bin/env node
/*
 * sw.js iki sözü tutuyor mu?
 *
 *   node arac/sw-dogrula.mjs
 *
 * 1. KABUK LİSTESİ TAM MI
 *    Elle yazılmış bir önbellek listesi sessizce eskir. Yeni bir modül eklenip
 *    listeye yazılmazsa uygulama çevrimdışı **yarım** açılır: kimse hata
 *    görmez, sadece bir ekran boş gelir. Bu betik index.html'den başlayıp
 *    import grafiğini gerçekten yürüyor ve bulduğu her dosyanın listede
 *    olduğunu kontrol ediyor. Fazlalık da hata: listede olup depoda olmayan
 *    bir dosya, kurulumun tamamını düşürür (addAll hepsi ya da hiçbiri).
 *
 * 2. SERVİS İŞÇİSİ YENİ BİR İSTEK ÜRETMİYOR MU
 *    Bu deponun gizlilik sözü, çocuğa ait hiçbir şeyin cihazdan çıkmaması.
 *    CI'daki ağ kapısı sw.js'i taramıyor -- tarasaydı `fetch(` gördüğü için
 *    dosyayı toptan reddederdi, oysa bir servis işçisinin `fetch`i sayfanın
 *    zaten yaptığı isteği ağa geçirmekten ibaret. Kontrol o yüzden burada ve
 *    daha dar: sw.js'teki HER `fetch(` çağrısının argümanı, sayfadan gelen
 *    istek nesnesi olmak zorunda. Kurulmuş bir adres, bir dizge, bir şablon --
 *    hiçbiri geçmez.
 *
 * Çıkış kodu: sorun varsa 1.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SW = path.join(KOK, 'sw.js');

let hata = 0;
const sorun = (m) => { hata++; console.log('HATA  ' + m); };
const tamam = (m) => console.log('ok    ' + m);

const oku = (p) => fs.readFileSync(p, 'utf8');

/* --- 1. kabuk listesi ---------------------------------------------------- */

function kabukListesi(kaynak) {
  const m = kaynak.match(/const KABUK = \[([\s\S]*?)\];/);
  if (!m) { sorun('sw.js icinde KABUK listesi bulunamadi'); return null; }
  return m[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
}

/** index.html'den baslayarak gercekten yuklenen yerel dosyalar. */
function gercekKabuk() {
  const bulunan = new Set(['./index.html', './manifest.webmanifest']);
  const html = oku(path.join(KOK, 'index.html'));

  for (const m of html.matchAll(/(?:src|href)="(\.\/[^"]+|[A-Za-z0-9_.-]+\.(?:js|css|webmanifest))"/g)) {
    const yol = m[1].startsWith('./') ? m[1] : './' + m[1];
    bulunan.add(yol);
  }

  // Modul grafigini yuru: bir modulun import ettigi her yerel dosya da kabuga
  // dahildir, index.html onu dogrudan anmasa bile.
  const kuyruk = [...bulunan].filter((p) => p.endsWith('.js'));
  while (kuyruk.length) {
    const rel = kuyruk.pop();
    const mutlak = path.join(KOK, rel);
    if (!fs.existsSync(mutlak)) continue;
    for (const m of oku(mutlak).matchAll(/from\s+['"](\.\/[^'"]+)['"]/g)) {
      const yol = m[1];
      if (!bulunan.has(yol)) { bulunan.add(yol); kuyruk.push(yol); }
    }
  }
  return bulunan;
}

const kaynak = oku(SW);
const liste = kabukListesi(kaynak);
if (liste) {
  const listede = new Set(liste);
  const gercek = gercekKabuk();

  const eksik = [...gercek].filter((p) => !listede.has(p)).sort();
  if (eksik.length) {
    sorun('kabukta olmasi gereken ama KABUK listesinde olmayan: ' + eksik.join(', '));
    console.log('      cevrimdisi acilis bu dosyalar olmadan yarim kalir');
  } else {
    tamam('KABUK listesi index.html + import grafigini tam kapsiyor (' + gercek.size + ' dosya)');
  }

  const yok = liste
    .filter((p) => p !== './')
    .filter((p) => !fs.existsSync(path.join(KOK, p)))
    .sort();
  if (yok.length) {
    sorun('KABUK listesinde olup depoda olmayan: ' + yok.join(', '));
    console.log('      addAll hepsi-ya-da-hicbiri calisir; tek eksik dosya kurulumu dusurur');
  } else {
    tamam('KABUK listesindeki her dosya depoda var');
  }
}

/* --- 2. fetch yalniz event.request ile --------------------------------- */

/* Yorumlar once atiliyor: bir yorum fetch edemez, ve bu dosyanin kendisi
 * kuralini yorumda anlattigi icin aksi halde kendi metnini yakalardi. */
const kodOnly = kaynak
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

const cagrilar = [...kodOnly.matchAll(/(?<!\.)\bfetch\s*\(\s*([^)]*)/g)];
if (!cagrilar.length) {
  tamam('sw.js hicbir fetch cagirmiyor');
} else {
  const kotu = cagrilar
    .map((m) => m[1].trim())
    .filter((arg) => !/^(istek|request|event\.request|e\.request)\b/.test(arg));
  if (kotu.length) {
    sorun('sw.js sayfadan gelmeyen bir sey fetch ediyor: ' + kotu.map((k) => JSON.stringify(k.slice(0, 40))).join(', '));
    console.log('      servis iscisi yalnizca event.request\'i gecirebilir; kurulmus bir adres');
    console.log('      bu deponun gizlilik sozunu delen yeni bir cikis noktasidir');
  } else {
    tamam(cagrilar.length + ' fetch cagrisinin hepsi sayfadan gelen istegi geciriyor');
  }
}

/* --- 3. olcum ucu onbellege girmiyor ----------------------------------- */

if (!/url\.origin\s*!==\s*self\.location\.origin/.test(kaynak)) {
  sorun('sw.js ayni kaynak disindaki istekleri ayirmiyor; olcum ucu onbellege girebilir');
} else {
  tamam('baska kaynaga giden istekler dokunulmadan geciyor');
}

console.log('');
console.log(hata ? hata + ' sorun' : 'sw.js temiz');
process.exit(hata ? 1 : 0);
