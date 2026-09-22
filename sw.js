/*
 * Çevrimdışı çalışma.
 *
 * `manifest.webmanifest` bu uygulamayı `display: standalone` diye tanıtıyordu
 * — yani kurulabilir bir uygulama. Servis işçisi olmadan bu söz yarım kalıyor:
 * tarayıcı çoğu durumda kurulum teklifini hiç göstermiyor, gösterse bile
 * uygulama ağ gidince boş bir sayfa açıyor. Uyku öncesi masalı anlatan bir
 * uygulamanın uçakta, arabada, modem kapalıyken açılamaması küçük bir kusur
 * değil; kullanımın tam olduğu an orası.
 *
 * TASARIM
 * -------
 * Uygulama kabuğu (index.html ve bütün modüller) kurulumda önbelleğe alınıyor.
 * Sonrasında aynı kaynaktan gelen her istek önce önbellekten, bulunamazsa
 * ağdan karşılanıyor.
 *
 * GİZLİLİK — bu dosyanın en önemli kuralı
 * ---------------------------------------
 * Buradaki `fetch` çağrısı **yeni bir istek üretmez**. Yalnızca sayfanın zaten
 * yaptığı `event.request` nesnesini olduğu gibi ağa geçirir; hiçbir yerde bir
 * adres kurulmaz, hiçbir gövde yazılmaz. `arac/sw-dogrula.mjs` bunu her
 * push'ta kontrol ediyor: bu dosyadaki her `fetch(` çağrısının argümanı
 * `event.request` olmak zorunda.
 *
 * Ölçüm ucu (`olcum.js`) buradan hiç geçmiyor: aynı kaynaktan olmayan her
 * istek dokunulmadan ağa bırakılıyor, önbelleğe de alınmıyor. Ölçüm isteğinin
 * önbellekte bir kopyasının kalması, çocuğa ait hiçbir şey göndermeyen bir
 * uygulamada bile yanlış olurdu.
 */

const SURUM = 'masal-v1';

/*
 * Kabuğun tamamı. Elle yazılmış bir liste sessizce eskiyor -- bir modül eklenip
 * buraya yazılmazsa uygulama çevrimdışı yarım açılır ve kimse fark etmez.
 * `arac/sw-dogrula.mjs` bu listeyi index.html'in ve modüllerin gerçek import
 * grafiğiyle karşılaştırıyor; eksik ya da fazla bir giriş CI'ı kırmızı yakar.
 */
const KABUK = [
  './',
  './index.html',
  './app.js',
  './sahneler.js',
  './hikayeler.js',
  './turkce.js',
  './karakter.js',
  './depo.js',
  './olcum.js',
  './manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SURUM)
      // Tek bir dosya inemezse kurulum tamamen başarısız olsun: yarım bir
      // kabuk, çevrimdışı açıldığında bozuk bir uygulamadır.
      .then((c) => c.addAll(KABUK))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((adlar) => Promise.all(
        adlar.filter((a) => a !== SURUM).map((a) => caches.delete(a))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const istek = event.request;

  // GET dışındaki hiçbir şey önbelleğe girmez ve karışılmaz.
  if (istek.method !== 'GET') return;

  // Başka bir kaynağa giden istek dokunulmadan geçer. Ölçüm ucu buraya düşer:
  // ne önbelleğe alınır, ne de bir kopyası tutulur.
  const url = new URL(istek.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(istek).then((vurgun) => {
      if (vurgun) return vurgun;
      // `istek` sayfanın kendi nesnesi; burada yeni bir adres kurulmuyor.
      return fetch(istek).then((yanit) => {
        // Yalnızca gerçekten başarılı, aynı kaynaklı yanıtlar saklanır.
        if (yanit && yanit.status === 200 && yanit.type === 'basic') {
          const kopya = yanit.clone();
          caches.open(SURUM).then((c) => c.put(istek, kopya));
        }
        return yanit;
      }).catch(() => {
        // Ağ yok ve önbellekte de yok: gezinme isteklerinde kabuğu ver,
        // böylece uygulama boş sayfa yerine kendisini açar.
        if (istek.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
