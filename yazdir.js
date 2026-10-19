// Printable colouring page: the scene of the current page as clean line art,
// the child's name in the title and the page's text underneath, ready for
// crayons on paper.
//
// PRIVACY: this goes to the browser's own print dialog (window.print) and
// nowhere else. Nothing is turned into a file by the app, and the CI rule
// that forbids every image/file export API (see ci.yml) still holds for this
// file too. The page is built from the scene TEMPLATE, not from the
// live drawing, so it is always the empty outline, whatever was painted on
// screen. A colouring page is for colouring.
//
// Pure: returns markup, touches no DOM. yazdir.test.js runs it in Node.
import { ek } from './turkce.js';

const kacir = (x) => String(x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** "Ada'nın boyama sayfası" / "Ada's colouring page". An empty name gives a neutral title. */
export function yazdirmaBasligi(ad, dil) {
  const isim = String(ad || '').trim();
  if (dil === 'tr') return isim ? `${isim}${ek(isim, 'in', true)} boyama sayfası` : 'Boyama sayfası';
  return isim ? `${isim}'s colouring page` : 'Colouring page';
}

/**
 * The print sheet. `sahneSvg` is the inner markup of the scene (the same
 * string the page draws, hero included); every shape is reduced to an
 * outline by the print stylesheet in index.html (`.yazdir svg *`).
 * Inline fills from the template are removed here as well, so the sheet stays
 * line art even where a stylesheet is ignored.
 */
export function yazdirmaHtml({ sahneSvg, ad, dil, metin }) {
  const cizgi = String(sahneSvg || '')
    .replace(/\sfill="[^"]*"/g, ' fill="#fff"')
    .replace(/\sstyle="[^"]*"/g, '');
  return `<h1>${kacir(yazdirmaBasligi(ad, dil))}</h1>`
    + `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${kacir(yazdirmaBasligi(ad, dil))}">${cizgi}</svg>`
    + (metin ? `<p>${kacir(metin)}</p>` : '')
    + '<p class="alt">masal · furkiozknn.github.io/masal</p>';
}
