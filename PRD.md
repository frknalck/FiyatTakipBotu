# 📄 PRD – Fiyat Takip Botu

## 🎯 Amaç
E-ticaret sitelerindeki (Hepsiburada, Trendyol, Teknosa, Mediamarkt, vb.) belirli ürünlerin fiyatlarını takip ederek fiyat düşüşlerinde Telegram üzerinden bildirim göndermek.

---

## 🔑 Özellikler

1. **Ürün Yönetimi**
   - Kullanıcılar, web panelinden ürün linklerini girebilecek.
   - Her ürün için minimum indirim yüzdesi (%) eşiği belirlenecek.
   - Ürün ekleme / silme işlemleri panelden yapılabilecek.
   - Ürünler veritabanında (SQLite/Postgres) saklanacak.

2. **Fiyat Kontrol Mekanizması**
   - Sistem her 5 dakikada bir tüm ürünlerin fiyatlarını kontrol edecek.
   - Önceki fiyat ile yeni fiyat karşılaştırılacak.
   - İndirim oranı, tanımlanan eşiği geçtiğinde Telegram botu aracılığıyla bildirim gönderilecek.

3. **Admin Panel**
   - Basit bir arayüz üzerinden:
     - Ürün adı
     - Ürün linki
     - İndirim yüzdesi (%)
     - Sil / Güncelle
   - Giriş: basit kimlik doğrulama (Basic Auth).

4. **Bildirim Sistemi**
   - Telegram bot entegrasyonu olacak.
   - Bildirim formatı:
     - Ürün adı
     - Eski fiyat
     - Yeni fiyat
     - İndirim oranı
     - Ürün linki

5. **Zamanlama**
   - Cron job (ör: `*/5 * * * *`) ile her 5 dakikada bir çalışacak.
   - Zamanlama konfigüre edilebilir olacak.

---

## 🏗️ Mimari

- **Backend**: Node.js (Express)
- **Veritabanı**: SQLite (tek dosya) veya Postgres (production)
- **UI**: Basit HTML form tabanlı admin panel
- **Bildirim**: Telegram Bot API
- **Çalıştırma Ortamı**: Hetzner + Coolify (Docker container)

---

## 📊 Veri Modeli (Products)

| Alan       | Tip     | Açıklama                        |
|------------|---------|---------------------------------|
| id         | int     | Primary key                     |
| name       | text    | Ürün adı                        |
| url        | text    | Ürün linki                      |
| lastPrice  | float   | Son bilinen fiyat               |
| threshold  | float   | Minimum indirim yüzdesi (%)     |
| createdAt  | date    | Eklenme tarihi                  |

---

## 🚦 Kullanım Senaryosu

1. Admin paneline giriş yapılır.
2. Yeni ürün eklenir: *iPhone 15 Pro, 50.000₺, %20 indirim eşiği*.
3. Sistem her 5 dakikada bir fiyatı kontrol eder.
4. Eğer fiyat %20 veya daha fazla düşerse:
   - Telegram’a şu bildirim gider:
📉 İndirim!
iPhone 15 Pro
Eski fiyat: 50.000₺
Yeni fiyat: 39.500₺
İndirim: %21
Link: https://www.site.com/iphone15pro

---

## 📌 Gereksinimler

- Node.js 18+
- SQLite veya Postgres
- Telegram Bot Token
- Telegram Chat ID
- Hetzner / Coolify üzerinde Docker ile çalıştırma

---

## 🚀 Ölçeklenebilirlik

- İlk aşamada tek IP (proxy kullanılmadan).
- İleride sitelerden engel alınırsa proxy rotasyonu eklenebilir.
- Cron job süresi (5 dk) trafik durumuna göre değiştirilebilir.

---

## 🔮 Gelecek Özellikler

- E-posta ile bildirim desteği
- Mobil uygulama entegrasyonu
- Çok kullanıcılı panel (her kullanıcı kendi ürünlerini yönetir)