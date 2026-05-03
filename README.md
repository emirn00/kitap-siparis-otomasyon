# Kitap Sipariş Otomasyon Sistemi

Bu proje, Hueber Interaktiv kitapları için özelleştirilmiş, modern ve ölçeklenebilir bir kitap sipariş ve yönetim otomasyon sistemidir. Kurumsal bir yapıya sahip olan uygulama, kullanıcıların kolayca sipariş vermesini sağlarken, yöneticilere gelişmiş bir kontrol paneli sunar.

## Temel Teknolojiler

### Arka Plan (Backend)
- **Framework:** Spring Boot 4.0.0
- **Dil:** Java 19
- **Veritabanı:** PostgreSQL (Üretim), JPA / Hibernate
- **Güvenlik:** Spring Security & JWT (JSON Web Token)
- **Mesajlaşma:** RabbitMQ (Asenkron işlemler için)
- **Dokümantasyon:** SpringDoc OpenAPI (Swagger UI)

### Ön Yüz (Frontend)
- **Framework:** Angular
- **Tasarım:** Angular Material & SCSS
- **İkon Seti:** FontAwesome
- **Dil Desteği:** Çoklu dil (TR, DE, EN) entegrasyonu
- **Mimari:** Standalone Components & Modular SCSS

## Ana Özellikler

### Kullanıcı Özellikleri
- **Modern Sipariş Ekranı:** Glassmorphism etkileriyle zenginleştirilmiş, premium kullanıcı arayüzü.
- **Akıllı Filtreleme:** Kitapları seviyelerine göre filtreleme ve anlık arama desteği.
- **Sipariş Takibi:** Geçmiş siparişlerin görüntülenmesi ve durum takibi.
- **Profil Yönetimi:** Kişisel bilgilerin güncellenmesi.

### Yönetici (Admin) Özellikleri
- **Kapsamlı Panel:** Sipariş, kitap ve kullanıcı yönetimi için merkezi kontrol merkezi.
- **Yapay Zeka Asistanı:** Sistem verilerini analiz eden ve sorgulara yanıt veren entegre chatbot.
- **Toplu E-posta Gönderimi:** Öğretmenlere kitap kodlarını otomatik ileten gelişmiş mail sistemi.
- **Sistem Günlükleri (Logs):** Tüm kritik işlemlerin ve hataların izlenebildiği log yapısı.
- **Excel Dışa Aktarım:** Siparişlerin tarih aralığına göre Excel formatında raporlanması.

## Kurulum

### Backend Kurulumu
1. `backend/src/main/resources/application.properties` dosyasındaki veritabanı ayarlarını yapılandırın.
2. Maven bağımlılıklarını yükleyin:
   ```bash
   mvn clean install
   ```
3. Uygulamayı başlatın:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Kurulumu
1. `frontend` dizinine gidin.
2. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```
3. Uygulamayı geliştirme modunda başlatın:
   ```bash
   npm start
   ```

## Proje Yapısı
- `/backend`: Spring Boot kaynak kodları ve veritabanı modelleri.
- `/frontend`: Angular bileşenleri, servisler ve stil dosyaları.
- `/docker-compose.yml`: Veritabanı ve servislerin Docker ortamında ayağa kaldırılması için konfigürasyon.

---
*Bu proje, modern yazılım mimarileri ve kullanıcı deneyimi standartları gözetilerek geliştirilmiştir.*