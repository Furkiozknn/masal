// Calistir: node --test
// Printable colouring page: title with the right suffix, line art only,
// escaped input, and no file-making API anywhere in the new code.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { yazdirmaBasligi, yazdirmaHtml } from './yazdir.js';
import { SAHNELER } from './sahneler.js';

test('baslik: Turkce iyelik eki ek motorundan geliyor', () => {
  assert.equal(yazdirmaBasligi('Ada', 'tr'), "Ada'nın boyama sayfası");
  assert.equal(yazdirmaBasligi('Elif', 'tr'), "Elif'in boyama sayfası");
  assert.equal(yazdirmaBasligi('Su', 'tr'), "Su'nun boyama sayfası");
  assert.equal(yazdirmaBasligi('Ömer', 'tr'), "Ömer'in boyama sayfası");
});

test('baslik: Ingilizce ve bos ad', () => {
  assert.equal(yazdirmaBasligi('Ada', 'en'), "Ada's colouring page");
  assert.equal(yazdirmaBasligi('  ', 'tr'), 'Boyama sayfası');
  assert.equal(yazdirmaBasligi('', 'en'), 'Colouring page');
});

test('her boyanabilir sahne cizgi resim olarak basiliyor', () => {
  for (const [ad, svg] of Object.entries(SAHNELER)) {
    const html = yazdirmaHtml({ sahneSvg: svg, ad: 'Ada', dil: 'tr', metin: 'Bir gece.' });
    assert.ok(html.includes('<svg viewBox="0 0 400 260"'), `${ad}: svg yok`);
    // template fills are whitened, painted inline styles are gone
    assert.ok(!/\sfill="(?!#fff")[^"]*"/.test(html), `${ad}: dolgulu sekil kalmis`);
    assert.ok(!/\sstyle="/.test(html), `${ad}: satir ici stil kalmis`);
    // the regions a child colours on screen are still there to colour on paper
    const bolge = (svg.match(/class="b"/g) || []).length;
    assert.equal((html.match(/class="b"/g) || []).length, bolge, `${ad}: bolge sayisi degismis`);
  }
});

test('boyanmis canli sahne verilse bile baski bos kalir', () => {
  const boyali = '<path class="b" d="M0 0h10v10z" style="fill: rgb(232, 87, 74);"/>';
  const html = yazdirmaHtml({ sahneSvg: boyali, ad: 'Ada', dil: 'tr', metin: '' });
  assert.ok(!html.includes('rgb(232'), 'boya baskiya sizmis');
});

test('kullanici girdisi kaciriliyor', () => {
  const html = yazdirmaHtml({ sahneSvg: '', ad: '<b>Ada</b>', dil: 'en', metin: 'x < y & "z"' });
  assert.ok(html.includes('&lt;b&gt;Ada&lt;/b&gt;'), 'ad kacilmamis');
  assert.ok(html.includes('x &lt; y &amp; &quot;z&quot;'), 'metin kacilmamis');
  assert.ok(!html.includes('<b>Ada</b>'), 'ham etiket sizmis');
});

test('yazdirma dosya uretmiyor: yasak API yok, yalnizca window.print', async () => {
  // Same rule CI greps for across the app: no path that turns the drawing into a file.
  const yasak = /download=|toDataURL|toBlob|createObjectURL|showSaveFilePicker/;
  for (const f of ['yazdir.js', 'app.js']) {
    const src = await readFile(new URL(`./${f}`, import.meta.url), 'utf8');
    assert.ok(!yasak.test(src), `${f}: dosya ureten API`);
  }
  const app = await readFile(new URL('./app.js', import.meta.url), 'utf8');
  assert.ok(app.includes('window.print()'), 'yazdir dugmesi tarayicinin kendi baski penceresini acmali');
  const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  assert.ok(/body\.yazdiriliyor > \*:not\(#yazdirAlan\)/.test(html), 'baski yalnizca boyama sayfasini gostermeli');
  assert.ok(/\.yazdir\{display:none\}/.test(html), 'baski alani ekranda gizli olmali');
});
