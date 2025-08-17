# Fiyat Takip Botu

E-ticaret sitelerindeki ürün fiyatlarını takip eden ve indirim olduğunda Telegram üzerinden bildirim gönderen Node.js uygulaması.

## Özellikler

- 8 büyük e-ticaret sitesini destekler: Trendyol, Hepsiburada, Teknosa, Amazon, Vatan, Pasaj, Pazarama, MediaMarkt
- Anti-ban önlemleri (user-agent rotasyonu, rastgele gecikmeler, stealth mode)
- Web tabanlı admin paneli
- Telegram bot entegrasyonu
- Otomatik fiyat kontrolü (5 dakikada bir)
- Docker desteği (Coolify uyumlu)
- SQLite veritabanı

## Kurulum

### 1. Gereksinimler

- Node.js 20+
- Docker (opsiyonel)
- Telegram Bot Token ve Chat ID

### 2. Telegram Bot Kurulumu

1. Telegram'da @BotFather'a mesaj atın
2. `/newbot` komutunu gönderin ve bot oluşturun
3. Bot token'ınızı kopyalayın
4. Botunuza mesaj atın
5. `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` adresine gidin
6. Chat ID'nizi bulun (chat.id alanı)

### 3. Lokal Kurulum

```bash
# Repoyu klonlayın
git clone <repo-url>
cd FiyatTakipBotu

# Bağımlılıkları yükleyin
npm install

# .env dosyasını oluşturun
cp .env.example .env

# .env dosyasını düzenleyin ve değerleri girin
nano .env

# Uygulamayı başlatın
npm start
```

### 4. Docker ile Kurulum

```bash
# .env dosyasını oluşturun
cp .env.example .env
nano .env

# Docker image'ı oluşturun ve çalıştırın
docker-compose up -d
```

### 5. Coolify'da Kurulum

1. Coolify'da yeni bir uygulama oluşturun
2. Git repository'sini bağlayın
3. Environment variables ekleyin:
   - TELEGRAM_BOT_TOKEN
   - TELEGRAM_CHAT_ID
   - ADMIN_USERNAME
   - ADMIN_PASSWORD
4. Deploy edin

## Kullanım

1. Tarayıcınızda `http://localhost:3000` adresine gidin
2. Admin kullanıcı adı ve şifrenizi girin
3. "Yeni Ürün Ekle" butonuna tıklayın
4. Ürün bilgilerini girin:
   - Ürün adı
   - Ürün URL'si (desteklenen sitelerden)
   - İndirim eşiği (%)
5. Sistem otomatik olarak 5 dakikada bir fiyatları kontrol edecek
6. İndirim eşiğini aşan ürünler için Telegram bildirimi gönderilecek

## Yapılandırma

### Environment Variables

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| TELEGRAM_BOT_TOKEN | Telegram bot token'ı | - |
| TELEGRAM_CHAT_ID | Telegram chat ID | - |
| ADMIN_USERNAME | Admin panel kullanıcı adı | admin |
| ADMIN_PASSWORD | Admin panel şifresi | admin123 |
| CRON_SCHEDULE | Kontrol sıklığı (cron formatı) | */5 * * * * |
| PORT | Uygulama portu | 3000 |
| NODE_ENV | Ortam (development/production) | production |
| DATABASE_PATH | SQLite veritabanı yolu | /app/data/data.db |
| LOG_LEVEL | Log seviyesi | info |
| RUN_ON_STARTUP | Başlangıçta kontrol | false |

### Cron Schedule Örnekleri

- `*/5 * * * *` - Her 5 dakikada bir
- `*/10 * * * *` - Her 10 dakikada bir
- `0 * * * *` - Her saat başı
- `0 */2 * * *` - Her 2 saatte bir
- `0 9,18 * * *` - Her gün saat 09:00 ve 18:00'da

## API Endpoints

### Web Routes
- `GET /` - Ana sayfa (dashboard)
- `GET /products` - Ürün listesi
- `GET /notifications` - Bildirim geçmişi

### API Routes
- `GET /api/products` - Tüm ürünleri getir
- `POST /api/products` - Yeni ürün ekle
- `PUT /api/products/:id` - Ürün güncelle
- `DELETE /api/products/:id` - Ürün sil
- `PATCH /api/products/:id/toggle` - Ürün durumunu değiştir

## Güvenlik Önlemleri

- User-Agent rotasyonu
- Rastgele gecikmeler (1-3 saniye arası)
- Puppeteer Stealth Plugin
- Rastgele viewport boyutları
- İnsan benzeri mouse hareketleri
- Site başına paralel istek limiti (2)
- Yeniden deneme mekanizması (3 deneme)

## Sorun Giderme

### Bot ban yerse
- Cron schedule'ı artırın (örn: 10-15 dakika)
- Paralel istek limitini azaltın
- Gecikmeleri artırın

### Telegram bildirimleri gelmiyorsa
- Bot token ve chat ID'yi kontrol edin
- Botunuza mesaj attığınızdan emin olun
- Logs klasöründeki hata mesajlarını kontrol edin

### Fiyat bulunamıyorsa
- Site yapısı değişmiş olabilir
- `src/scrapers/` içindeki ilgili scraper'ı güncelleyin
- Selector'ları kontrol edin

## Lisans

MIT