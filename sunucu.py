# Gelistirme sunucusu. python -m http.server yerine bunu kullan.
#
# Neden: tarayici ES modullerini (app.js, hikayeler.js, sahneler.js) agresif
# onbellekliyor. Dosyayi degistirip sayfayi yenileyince ESKI modul calisiyor
# ve test sonuclari yanlis cikiyor -- bu projede uc kez yanilttigi icin yazildi.
# Basliklar her istekte onbellegi kapatiyor.
#
# Kullanim: python sunucu.py [port]      (varsayilan 8790)
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class OnbelleksizIsleyici(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, *args):
        pass                      # istek kayitlarini bastirma


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8790
    print(f'http://127.0.0.1:{port}/  (onbellek kapali, Ctrl+C ile durdur)')
    ThreadingHTTPServer(('127.0.0.1', port), OnbelleksizIsleyici).serve_forever()
