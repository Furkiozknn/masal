import { ek } from './turkce.js';

// Hikaye sablonlari.
// Yer tutucular: {ad} {sehir} {yas}
// Turkce hal eki gerekiyorsa iki nokta ile: {sehir:de} {ad:e} {ad:i} {sehir:in}
//   -> ek motoru unlu uyumunu kendi hesaplar, sablonda elle ek yazilmaz.
// Sablon motoru API anahtari gerektirmez: bugun calisir, maliyeti sifir.
// LLM katmani sonradan bunun uzerine biner (bkz. README).
// ponytail: iki tema x iki dil. Tema eklemek = bu nesneye bir anahtar eklemek.

export const METINLER = {
  tr: {
    ad: 'Türkçe',
    ui: {
      baslik: 'Çocuğunuza özel masal',
      altBaslik: 'Adını, yaşını ve şehrini yaz. Masal ona göre yazılsın.',
      adAlan: 'Çocuğun adı', yasAlan: 'Yaşı', sehirAlan: 'Şehri', temaAlan: 'Konu',
      olustur: 'Masalı oluştur', geri: 'Önceki', ileri: 'Sonraki',
      yeniden: 'Yeni masal', sayfa: 'sayfa',
      boyaIpucu: 'Bir renk seç, sonra resmin içine dokun',
      kaydedildi: 'boyaman kaydedildi', temizle: 'temizle', geriAl: 'geri al',
      son: 'Masal bitti. İyi geceler!',
      dinle: '▶ Dinle', durdur: '■ Durdur',
      kitaplik: 'Kitaplık', devamEt: 'devam et', sil: 'sil',
      silOnay: 'Bu masal kitaplıktan silinsin mi? Boyamaları da gider.',
      bolgeBoyandi: 'bölge boyandı', bitti: 'bitti',
      kutlama: 'Resmi bitirdin!',
      adGerekli: 'Lütfen çocuğun adını yaz.',
    },
    temalar: { deniz: 'Deniz', orman: 'Orman', yildizlar: 'Yıldızlar' },
    hikayeler: {
      deniz: {
        baslik: '{ad} ve Denizin Fısıltısı',
        sayfalar: [
          { sahne: 'oda', metin: '{sehir:de} sabah yeni başlıyordu. {ad} gözlerini açtığında pencereden içeri deniz kokusu doluyordu. Bugün kumsala gideceklerdi.' },
          { sahne: 'kumsal', boya: true, metin: 'Güneş daha yeni doğmuştu. {ad} kumların üstünde parlayan bir şey gördü. Eğilip baktı: küçücük bir deniz kabuğu.' },
          { metin: 'Kabuğu avucuna aldı. Serindi ve pürüzsüzdü. Kulağına götürdüğünde ince bir ses geldi: "Merhaba {ad}. Ben dalgadan ayrı düştüm."',
            secim: { soru: '{ad} ne yapsın?', a: 'Denize geri götür', b: 'Eve götür' } },
          { dal: 'a', metin: '{ad} kabuğu iki eliyle tuttu ve suya doğru yürüdü. Ayaklarına serin köpük değdi.' },
          { dal: 'a', metin: 'Kabuğu usulca bir dalgaya bıraktı. Kabuk bir kere parladı: "Teşekkür ederim. Artık her dalga sana benim selamımı getirecek."' },
          { dal: 'b', metin: '{ad} kabuğu cebine koydu ve eve götürdü. Pencerenin kenarına, güneşin vurduğu bir yere bıraktı.' },
          { dal: 'b', metin: 'Gece olunca kabuk usulca fısıldadı: "Burası da güzel. Ama denizi özlüyorum." {ad} biraz düşündü ve yarın onu geri götürmeye karar verdi.' },
          { sahne: 'oda', boya: true, metin: 'O gece yatağına girdiğinde uzaktan denizin sesini duydu. {ad} gözlerini kapattı. Her dalga ona iyi geceler diliyordu.' },
        ],
      },
      orman: {
        baslik: '{ad} ve Ormanın Küçük Dostu',
        sayfalar: [
          { sahne: 'oda', metin: '{sehir:in} hemen yanı başında bir orman vardı. {ad} o sabah erkenden kalktı. Bugün patikanın sonuna kadar gidecekti.' },
          { sahne: 'orman', boya: true, metin: 'Ağaçların arasında bir hışırtı duydu. Çalıların ardından turuncu bir kuyruk göründü: küçük bir tilki yavrusu.' },
          { metin: 'Tilki kaçmadı. {ad:e} baktı, sonra patikanın ilerisine döndü. "Beni takip et," der gibiydi.',
            secim: { soru: '{ad} ne yapsın?', a: 'Tilkiyi takip et', b: 'Olduğu yerde bekle' } },
          { dal: 'a', metin: 'Birlikte yürüdüler. Tilki, {ad:i} yosun kaplı bir taşın önünde durdurdu. Taşın dibinde küçücük bir su birikintisi vardı.' },
          { dal: 'a', metin: 'Suda gökyüzü görünüyordu. {ad} eğildi ve orada kendi yüzünü buldu. Tilki yanına oturdu. İkisi uzun uzun sessiz kaldı.' },
          { dal: 'b', metin: '{ad} olduğu yerde kaldı. Tilki birkaç adım gitti, sonra durup arkasına baktı. Beklendiğini anlamıştı.' },
          { dal: 'b', metin: 'Az sonra tilki geri geldi. Ağzında parlak bir şey vardı: küçük, yuvarlak bir çakıl taşı. Onu {ad:in} ayaklarının dibine bıraktı.' },
          { sahne: 'oda', boya: true, metin: 'Eve dönerken {ad} arkasına baktı. Tilki patikanın başında durmuş onu uğurluyordu. O gece rüyasında ormanın yeşilini gördü.' },
        ],
      },
      yildizlar: {
        baslik: '{ad} ve Gece Yolculuğu',
        sayfalar: [
          { sahne: 'oda', metin: '{sehir:de} gökyüzü o gece çok açıktı. {ad} yatağından kalkıp pencereye gitti. Yıldızlar hiç bu kadar yakın görünmemişti.' },
          { sahne: 'uzay', boya: true, metin: 'Pencerenin hemen altında küçük bir roket duruyordu. Kapısı açıktı. İçeride tek bir koltuk vardı, tam {ad:e} göre.' },
          { metin: 'Roket hiç ses çıkarmadan havalandı. Aşağıda evler küçüldü, sonra {sehir} bir avuç ışığa dönüştü.',
            secim: { soru: '{ad} nereye gitmek ister?', a: 'Ay\'a doğru', b: 'Yıldızların arasına' } },
          { dal: 'a', metin: 'Roket Ay\'a doğru döndü. Ay yaklaştıkça büyüdü; üstündeki çukurlar birer birer göründü.' },
          { dal: 'a', metin: 'Ay\'ın yanından geçerken bir ses duydu: "Yavaş git, acelen olmasın. Buradan her şey daha güzel görünür."' },
          { dal: 'b', metin: 'Roket yıldızların arasına daldı. Işıklar camın önünden usul usul akıp gitti.' },
          { dal: 'b', metin: 'Bir yıldız ötekilerden daha parlaktı ve sanki göz kırptı. {ad} el salladı. Yıldız da parlayarak karşılık verdi.' },
          { sahne: 'oda', boya: true, metin: 'Roket geri döndüğünde sabah olmak üzereydi. {ad} yatağına girdi. Yastığının üstünde hâlâ bir tutam yıldız tozu vardı.' },
        ],
      },
    },
  },

  en: {
    ad: 'English',
    ui: {
      baslik: 'A bedtime story made for your child',
      altBaslik: 'Enter a name, an age and a town. The story is written around them.',
      adAlan: 'Child\'s name', yasAlan: 'Age', sehirAlan: 'Town', temaAlan: 'Theme',
      olustur: 'Create the story', geri: 'Back', ileri: 'Next',
      yeniden: 'New story', sayfa: 'page',
      boyaIpucu: 'Pick a colour, then tap inside the picture',
      kaydedildi: 'your colouring is saved', temizle: 'clear', geriAl: 'undo',
      son: 'The end. Sleep well!',
      dinle: '▶ Listen', durdur: '■ Stop',
      kitaplik: 'Library', devamEt: 'continue', sil: 'remove',
      silOnay: 'Remove this story from the library? The colouring goes with it.',
      bolgeBoyandi: 'areas coloured', bitti: 'finished',
      kutlama: 'You finished the picture!',
      adGerekli: 'Please enter the child\'s name.',
    },
    temalar: { deniz: 'The sea', orman: 'The forest', yildizlar: 'The stars' },
    hikayeler: {
      deniz: {
        baslik: '{ad} and the Whisper of the Sea',
        sayfalar: [
          { sahne: 'oda', metin: 'Morning was just beginning in {sehir}. When {ad} opened both eyes, the smell of the sea was already in the room. Today they were going to the beach.' },
          { sahne: 'kumsal', boya: true, metin: 'The sun had only just risen. {ad} saw something glinting on the sand, leaned down and looked: a tiny seashell.' },
          { metin: 'The shell was cool and smooth in one small hand. Held up to an ear, a thin voice came from inside: "Hello, {ad}. I lost my wave."',
            secim: { soru: 'What should {ad} do?', a: 'Carry it back to the sea', b: 'Take it home' } },
          { dal: 'a', metin: '{ad} held the shell in both hands and walked towards the water. Cool foam touched two bare feet.' },
          { dal: 'a', metin: 'The shell slipped gently onto a wave. It shone once: "Thank you. Now every wave will bring you my greeting."' },
          { dal: 'b', metin: '{ad} put the shell in a pocket and carried it home, then set it on the windowsill where the sun came in.' },
          { dal: 'b', metin: 'At night the shell whispered: "It is lovely here. But I miss the sea." {ad} thought about it, and decided to carry it back tomorrow.' },
          { sahne: 'oda', boya: true, metin: 'That night, in bed, the sea could still be heard far away. {ad} closed both eyes. Every wave was saying goodnight.' },
        ],
      },
      orman: {
        baslik: '{ad} and the Little Friend in the Woods',
        sayfalar: [
          { sahne: 'oda', metin: 'There was a forest right beside {sehir}. {ad} woke early that morning. Today the path would be followed all the way to its end.' },
          { sahne: 'orman', boya: true, metin: 'Something rustled between the trees. An orange tail appeared behind the bushes: a small fox cub.' },
          { metin: 'The fox did not run. It looked at {ad}, then turned up the path, as if to say: follow me.',
            secim: { soru: 'What should {ad} do?', a: 'Follow the fox', b: 'Wait right there' } },
          { dal: 'a', metin: 'They walked together. The fox stopped {ad} in front of a mossy stone. At its foot lay a very small pool of water.' },
          { dal: 'a', metin: 'The sky was in the water. {ad} leaned over and found a face there. The fox sat down alongside. Both stayed quiet for a long while.' },
          { dal: 'b', metin: '{ad} stayed right there. The fox went a few steps, then stopped and looked back, understanding that the waiting was on purpose.' },
          { dal: 'b', metin: 'Soon the fox came back. Something bright was in its mouth: a small round pebble. It was set down at {ad}\'s feet.' },
          { sahne: 'oda', boya: true, metin: 'On the way home {ad} looked back. The fox stood at the head of the path, seeing them off. That night the green of the forest came in a dream.' },
        ],
      },
      yildizlar: {
        baslik: '{ad} and the Journey by Night',
        sayfalar: [
          { sahne: 'oda', metin: 'The sky above {sehir} was very clear that night. {ad} got out of bed and went to the window. The stars had never looked so close.' },
          { sahne: 'uzay', boya: true, metin: 'A small rocket stood just below the window. Its door was open. Inside there was a single seat, exactly the right size for {ad}.' },
          { metin: 'The rocket lifted without a sound. Below, the houses grew small, and then {sehir} was only a handful of light.',
            secim: { soru: 'Where should {ad} go?', a: 'Towards the Moon', b: 'In among the stars' } },
          { dal: 'a', metin: 'The rocket turned towards the Moon. It grew larger on the way, and its craters appeared one by one.' },
          { dal: 'a', metin: 'Passing close to the Moon, a voice came: "Go slowly, there is no hurry. Everything looks better from up here."' },
          { dal: 'b', metin: 'The rocket slipped in among the stars. Their lights drifted slowly past the glass.' },
          { dal: 'b', metin: 'One star was brighter than the rest, and seemed to wink. {ad} waved. The star flashed back.' },
          { sahne: 'oda', boya: true, metin: 'It was almost morning when the rocket came back. {ad} climbed into bed. A little stardust was still there on the pillow.' },
        ],
      },
    },
  },
};

/** Tarayici dilinden desteklenen dili sec. */
export function dilSec(istenen) {
  const kod = (istenen || navigator.language || 'en').slice(0, 2).toLowerCase();
  return METINLER[kod] ? kod : 'en';
}

/** Sablonu cocugun bilgileriyle doldurur. {alan} ve {alan:ek} destekler. */
export function hikayeUret({ dil, tema, ad, yas, sehir }) {
  const paket = METINLER[dil] || METINLER.en;
  const sablon = paket.hikayeler[tema] || Object.values(paket.hikayeler)[0];

  const sehirVar = Boolean(sehir && sehir.trim());
  const deger = {
    ad,
    yas: yas ?? '',
    sehir: sehirVar ? sehir.trim() : (dil === 'tr' ? 'kasaba' : 'their town'),
  };
  // Sehir girilmediyse yerine cins isim koyuyoruz: cins isim kesme isaretiyle
  // ayrilmaz ("kasabada", "Trabzon'da" degil).
  const ozelIsim = { ad: true, yas: false, sehir: sehirVar };

  const doldur = (s) => {
    const cikti = s.replace(/\{(\w+)(?::(\w+))?\}/g, (tam, alan, tip) => {
      if (!(alan in deger)) return tam;
      const v = String(deger[alan]);
      if (!tip || dil !== 'tr') return v;
      return v + ek(v, tip, ozelIsim[alan]);
    });
    // Cumle bir yer tutucuyla basliyorsa ("kasabanin...") ilk harf buyutulur.
    return cikti.charAt(0).toLocaleUpperCase(dil) + cikti.slice(1);
  };

  return {
    baslik: doldur(sablon.baslik),
    sayfalar: sablon.sayfalar.map((s) => ({ ...s, metin: doldur(s.metin) })),
  };
}
