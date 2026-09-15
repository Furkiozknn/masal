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
      baskaMasal: '{ad} için başka masallar',
      gorunumBaslik: 'Kahramanın görünümü',
      sacKisa: 'kısa', sacUzun: 'uzun', sacKivircik: 'kıvırcık',
      tenSec: 'ten tonu', sacSec: 'saç rengi',
      renkAdlari: ['kırmızı','turuncu','sarı','açık yeşil','yeşil','açık mavi','mavi','mor','kahverengi','pembe','krem','siyah'],
      adGerekli: 'Lütfen çocuğun adını yaz.',
    },
    temalar: { deniz: 'Deniz', orman: 'Orman', yildizlar: 'Yıldızlar', kar: 'Kar',
               yagmur: 'Yağmur', bahce: 'Bahçe' },
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
      kar: {
        baslik: '{ad} ve İlk Kar',
        sayfalar: [
          { sahne: 'oda', metin: '{sehir:de} o sabah her yer bembeyazdı. {ad} pencereye koştu. Gece boyunca sessizce kar yağmıştı.' },
          { sahne: 'kis', boya: true, metin: 'Bahçeye çıktı. Kar, ayaklarının altında usulca çıtırdadı. Çıplak bir dalın üstünde minik bir kuş titriyordu.' },
          { metin: 'Kuş {ad:e} baktı. Üşüdüğü her hâlinden belliydi ama uçup gitmedi.',
            secim: { soru: '{ad} ne yapsın?', a: 'Kuşa yem ver', b: 'Kardan adam yap' } },
          { dal: 'a', metin: '{ad} eve koştu ve avucunda bir tutam ekmek kırıntısıyla döndü. Kırıntıları ağacın altına, karın üstüne serpti.' },
          { dal: 'a', metin: 'Kuş usulca aşağı indi. Birkaç kırıntı topladı, sonra başını kaldırıp öttü. Sanki teşekkür ediyordu.' },
          { dal: 'b', metin: '{ad} karı avuçlayıp yuvarlamaya başladı. Küçük top gitgide büyüdü. Üstüne bir tane daha koydu.' },
          { dal: 'b', metin: 'Gözlerine iki taş, burnuna bir havuç yerleştirdi. Kuş gelip kardan adamın omzuna kondu. İkisi birlikte baktılar.' },
          { sahne: 'oda', boya: true, metin: 'İçeri girdiğinde yanakları kıpkırmızıydı. {ad} yatağına girdi. Dışarıda kar hâlâ usul usul yağıyordu.' },
        ],
      },
      yagmur: {
        baslik: '{ad} ve Gökkuşağı',
        sayfalar: [
          { sahne: 'oda', metin: '{sehir:de} sabah gri başlamıştı. {ad} pencereye gitti. Camın üstünde küçük su damlaları yarışıyordu.' },
          { sahne: 'yagmur', boya: true, metin: 'Öğleye doğru yağmur dindi. {ad} bahçeye indi; her yer ıslaktı. Ortada kocaman bir su birikintisi parlıyordu.' },
          { metin: 'Birikintiye eğilip baktı. Suyun içinde gökyüzü vardı, bulutlar usulca kayıyordu.',
            secim: { soru: '{ad} ne yapsın?', a: 'Birikintiye bas', b: 'Gökkuşağını ara' } },
          { dal: 'a', metin: '{ad} çizmelerini giydi ve birikintinin tam ortasına bastı. Su her yana sıçradı, kahkahası bahçeyi doldurdu.' },
          { dal: 'a', metin: 'Sonra kenara oturup bekledi. Su yavaşça duruldu ve gökyüzü yeniden belirdi. Bulutlar aralanıyordu.' },
          { dal: 'b', metin: '{ad} başını kaldırdı ve aradı. Önce hiçbir şey göremedi. Sonra ağaçların üstünde renkler belirmeye başladı.' },
          { dal: 'b', metin: 'Gökkuşağı usulca açıldı: kırmızı, sarı, yeşil, mavi. {ad} parmağıyla renkleri tek tek saydı.' },
          { sahne: 'oda', boya: true, metin: 'Akşam yağmur yeniden başladı. {ad} yatağına girdi. Camdaki damlalar ona ninni söylüyordu.' },
        ],
      },
      bahce: {
        baslik: '{ad} ve Turuncu Kanatlar',
        sayfalar: [
          { sahne: 'oda', metin: '{sehir:de} bahar gelmişti. {ad} pencereyi açtığında içeri çiçek kokusu doldu.' },
          { sahne: 'bahce', boya: true, metin: 'Bahçeye indi. Laleler yeni açmıştı. Bir tanesinin üstünde turuncu kanatlı bir kelebek duruyordu.' },
          { metin: 'Kelebek kanatlarını usulca açıp kapıyordu. {ad} ona doğru bir adım attı.',
            secim: { soru: '{ad} ne yapsın?', a: 'Elini uzat', b: 'Sessizce izle' } },
          { dal: 'a', metin: '{ad} elini yavaşça uzattı, avucunu açtı ve bekledi. Kelebek bir an durdu, sonra parmağının ucuna kondu.' },
          { dal: 'a', metin: 'Ağırlığı yok gibiydi. Birkaç saniye öylece kaldılar. Sonra kelebek havalandı ve bir çiçeğe daha gitti.' },
          { dal: 'b', metin: '{ad} olduğu yerde durdu ve yalnızca izledi. Kelebek çiçekten çiçeğe geçti, hiç acele etmedi.' },
          { dal: 'b', metin: 'Az sonra kelebek {ad:in} hemen yanındaki laleye kondu. İzlendiğini biliyor ama aldırmıyor gibiydi.' },
          { sahne: 'oda', boya: true, metin: 'O gece {ad} yatağına girdi. Gözlerini kapatınca turuncu kanatları gördü. Bahçe yarın da orada olacaktı.' },
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
      baskaMasal: 'More stories for {ad}',
      gorunumBaslik: 'How the hero looks',
      sacKisa: 'short', sacUzun: 'long', sacKivircik: 'curly',
      tenSec: 'skin tone', sacSec: 'hair colour',
      renkAdlari: ['red','orange','yellow','light green','green','light blue','blue','purple','brown','pink','cream','black'],
      adGerekli: 'Please enter the child\'s name.',
    },
    temalar: { deniz: 'The sea', orman: 'The forest', yildizlar: 'The stars', kar: 'The snow',
               yagmur: 'The rain', bahce: 'The garden' },
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
      kar: {
        baslik: '{ad} and the First Snow',
        sayfalar: [
          { sahne: 'oda', metin: 'Everything was white in {sehir} that morning. {ad} ran to the window. Snow had been falling quietly all night.' },
          { sahne: 'kis', boya: true, metin: 'Out in the garden the snow crunched softly underfoot. On a bare branch, a tiny bird was shivering.' },
          { metin: 'The bird looked at {ad}. It was clearly cold, and yet it did not fly away.',
            secim: { soru: 'What should {ad} do?', a: 'Feed the bird', b: 'Build a snowman' } },
          { dal: 'a', metin: '{ad} ran inside and came back with a handful of breadcrumbs, then scattered them on the snow under the tree.' },
          { dal: 'a', metin: 'The bird came down quietly, gathered a few crumbs, then lifted its head and sang. It sounded like thank you.' },
          { dal: 'b', metin: '{ad} scooped up the snow and began to roll it. The small ball grew and grew, and another one went on top.' },
          { dal: 'b', metin: 'Two stones for eyes, a carrot for a nose. The bird flew over and landed on the snowman\'s shoulder. They both looked on.' },
          { sahne: 'oda', boya: true, metin: 'Back inside, two cheeks were bright red from the cold. {ad} climbed into bed. Outside, the snow was still falling softly.' },
        ],
      },
      yagmur: {
        baslik: '{ad} and the Rainbow',
        sayfalar: [
          { sahne: 'oda', metin: 'The morning started grey in {sehir}. {ad} went to the window, where small drops of water were racing down the glass.' },
          { sahne: 'yagmur', boya: true, metin: 'By midday the rain had stopped. {ad} went out into the garden; everything was wet. In the middle, a huge puddle was shining.' },
          { metin: 'Leaning over the puddle, there was a whole sky inside it, with clouds drifting slowly across.',
            secim: { soru: 'What should {ad} do?', a: 'Jump in the puddle', b: 'Look for the rainbow' } },
          { dal: 'a', metin: '{ad} pulled on both boots and stepped right into the middle. Water flew everywhere, and the laughter filled the whole garden.' },
          { dal: 'a', metin: 'Then came sitting down at the edge to wait. The water grew still again and the sky came back into it. The clouds were parting.' },
          { dal: 'b', metin: '{ad} looked up and searched. At first there was nothing. Then, above the trees, colours began to appear.' },
          { dal: 'b', metin: 'The rainbow opened slowly: red, yellow, green, blue. {ad} counted the colours one by one with a finger.' },
          { sahne: 'oda', boya: true, metin: 'In the evening the rain began again. {ad} climbed into bed. The drops on the glass were singing a lullaby.' },
        ],
      },
      bahce: {
        baslik: '{ad} and the Orange Wings',
        sayfalar: [
          { sahne: 'oda', metin: 'Spring had come to {sehir}. When {ad} opened the window, the smell of flowers filled the room.' },
          { sahne: 'bahce', boya: true, metin: 'Down in the garden the tulips had just opened. On one of them sat a butterfly with orange wings.' },
          { metin: 'The butterfly opened and closed its wings gently. {ad} took one step closer.',
            secim: { soru: 'What should {ad} do?', a: 'Hold out a hand', b: 'Watch quietly' } },
          { dal: 'a', metin: '{ad} reached out slowly, opened one palm and waited. The butterfly paused, then landed on a fingertip.' },
          { dal: 'a', metin: 'It weighed almost nothing. They stayed like that for a few seconds. Then the butterfly lifted off towards another flower.' },
          { dal: 'b', metin: '{ad} stood still and only watched. The butterfly moved from flower to flower, never in any hurry.' },
          { dal: 'b', metin: 'Before long it settled on the tulip right beside {ad}. It seemed to know it was being watched, and not to mind at all.' },
          { sahne: 'oda', boya: true, metin: 'That night {ad} climbed into bed. Closing both eyes brought back the orange wings. The garden would still be there tomorrow.' },
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

/** HTML kacisi: ad ve sehir kullanici girdisi, metinHtml'e ham gitmemeli. */
const kacir = (x) => x.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

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

  // Sablonu doldurup ciktiyi parcalara ayirir; hangi parcanin cocugun adindan
  // geldigini yalnizca burasi bilir. Vurgu sonradan "metinde adi ara ve sar"
  // diye konsaydi ad bir kelimenin icine dustugunde de vurgulanirdi: Turkcede
  // ekler ada dogrudan yapistigi icin "Su" adli cocukta "Suda", "Ay" adli
  // cocukta gokteki "Ay'a doğru" yanlislikla kalin yazilirdi.
  const parcala = (s) => {
    const parca = [];
    const yerTutucu = /\{(\w+)(?::(\w+))?\}/g;
    let son = 0;
    let m;
    while ((m = yerTutucu.exec(s)) !== null) {
      const [tam, alan, tip] = m;
      if (!(alan in deger)) continue;        // bilinmeyen yer tutucu oldugu gibi kalsin
      if (m.index > son) parca.push({ metin: s.slice(son, m.index) });
      const v = String(deger[alan]);
      parca.push({ metin: v, ad: alan === 'ad' });
      // Hal eki adin disinda kalir: "<b>Ada</b>'ya", "<b>Ada</b>'nın".
      if (tip && dil === 'tr') parca.push({ metin: ek(v, tip, ozelIsim[alan]) });
      son = m.index + tam.length;
    }
    if (son < s.length) parca.push({ metin: s.slice(son) });
    // Cumle bir yer tutucuyla basliyorsa ("kasabanin...") ilk harf buyutulur.
    if (parca.length) {
      const ilk = parca[0];
      parca[0] = { ...ilk, metin: ilk.metin.charAt(0).toLocaleUpperCase(dil) + ilk.metin.slice(1) };
    }
    return parca;
  };

  const duz = (parca) => parca.map((x) => x.metin).join('');
  const isaretli = (parca) =>
    parca.map((x) => (x.ad ? `<b>${kacir(x.metin)}</b>` : kacir(x.metin))).join('');

  return {
    baslik: duz(parcala(sablon.baslik)),
    sayfalar: sablon.sayfalar.map((s) => {
      const parca = parcala(s.metin);
      // `metin` duz kalir (seslendirme, kitaplik); `metinHtml` ekrana basilir.
      return { ...s, metin: duz(parca), metinHtml: isaretli(parca) };
    }),
  };
}
