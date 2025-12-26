# Lapeh Framework

**Lapeh** adalah framework berbasis Express.js yang terstandarisasi, dirancang untuk mempercepat pengembangan REST API dengan struktur yang solid, aman, dan scalable. Terinspirasi oleh struktur Laravel dan NestJS, namun tetap menjaga kesederhanaan Express.

## 🚀 Fitur Utama

- **Struktur Modular**: Terorganisir rapi dengan Controllers, Services, Routes, dan Middleware.
- **TypeScript Ready**: Full TypeScript support untuk type-safety.
- **Prisma ORM**: Integrasi database yang modern dan type-safe.
- **Schema Terpisah**: Mendukung pemisahan schema Prisma per model (mirip Eloquent).
- **Generator Tools**: CLI commands untuk generate Module dan Model dengan cepat.
- **Zero-Config Redis**: Otomatis menggunakan Redis jika tersedia, atau fallback ke in-memory mock tanpa konfigurasi.
- **Security Best Practices**: Dilengkapi dengan Helmet, Rate Limiting, CORS, dan JWT Authentication.
- **Validasi Data**: Menggunakan Zod untuk validasi request yang kuat.

## 📦 Instalasi & Penggunaan

Anda dapat menginstall framework ini menggunakan versi terbaru atau versi spesifik agar lebih fleksibel:

### 1. Menggunakan Versi Terbaru (Recommended)

```bash
npx lapeh@latest nama-project-anda
```

Atau gunakan flag `--full` untuk setup lengkap (termasuk seeding data default user & roles):

```bash
npx lapeh@latest nama-project-anda --full
```

### 2. Menggunakan Versi Spesifik

Jika Anda membutuhkan versi tertentu (misalnya untuk kompatibilitas):

```bash
npx lapeh@1.0.8 nama-project-anda
```

Atau dengan setup lengkap:

```bash
npx lapeh@1.0.8 nama-project-anda --full
```

### Apa yang terjadi otomatis?

1. Struktur project dibuat.
2. Dependencies diinstall.
3. Database dipilih & dikonfigurasi secara interaktif.
4. **Database** dibuat dan dimigrasi otomatis.
5. **JWT Secret** di-generate otomatis.
6. **Seeding Data** (jika menggunakan `--full`).

Masuk ke folder project dan jalankan:

```bash
cd nama-project-anda
npm run dev
```

Server akan berjalan di `http://localhost:4000`.

### 🔑 Akun Default (Jika menggunakan `--full` atau `npm run db:seed`)

Jika Anda melakukan setup dengan flag `--full`, database akan terisi dengan akun default berikut:

| Role            | Email       | Password |
| :-------------- | :---------- | :------- |
| **Super Admin** | `sa@sa.com` | `string` |
| **Admin**       | `a@a.com`   | `string` |
| **User**        | `u@u.com`   | `string` |

> **Catatan:** Segera ubah password akun-akun ini jika Anda mendeploy ke production!

---

## 🔄 Upgrade Project

Jika Anda memiliki project lama yang dibuat dengan versi Lapeh sebelumnya dan ingin memperbarui struktur, scripts, dan konfigurasi ke standar terbaru (termasuk keamanan Redis baru), Anda tidak perlu membuat project ulang.

Cukup jalankan perintah ini di dalam folder project Anda:

```bash
npx lapeh@latest upgrade
```

Perintah ini akan secara otomatis:

1.  Mengupdate `scripts/` (termasuk generator controller baru).
2.  Mengupdate `docker-compose.yml` (keamanan Redis).
3.  Mengupdate dependencies di `package.json`.
4.  Menambahkan konfigurasi `.vscode` dan `tsconfig` terbaru.

> **Catatan:** File `.env` Anda **tidak akan ditimpa**, namun kami akan mengupdate `.env.example` sebagai referensi konfigurasi terbaru.

## 🧠 Zero-Config Redis

Lapeh otomatis mendeteksi ketersediaan Redis.

1.  **Auto-Discovery**: Mencoba terhubung ke Redis URL di `.env` (`REDIS_URL`).
2.  **Smart Fallback**: Jika Redis tidak tersedia atau koneksi gagal, otomatis beralih ke **In-Memory Mock**.
    - Tidak perlu install Redis di local development.
    - Fitur rate-limiting dan caching tetap berjalan (namun data hilang saat restart).
3.  **Production Safety**: Memberikan peringatan log jika berjalan di Production menggunakan Mock.

**Force Mock Mode:**
Anda bisa memaksa menggunakan mock (misal untuk testing) dengan menambahkan env variable:

```env
NO_REDIS=true
```

### Optional: Menggunakan Real Redis dengan Docker

Jika Anda ingin menggunakan Redis yang sebenarnya di local environment, kami telah menyertakan konfigurasi `docker-compose.yml` yang aman (menggunakan ACL).

1.  Jalankan Redis container:

    ```bash
    docker-compose up -d
    ```

2.  Uncomment konfigurasi Redis di file `.env` Anda:

    ```env
    REDIS_URL="redis://lapeh:12341234@localhost:6379"
    ```

    > **Credential Default:**
    >
    > - User: `lapeh`
    > - Password: `12341234`

## 🛠 Development Tools

API Lapeh menyediakan tools untuk mempercepat development, mirip dengan `artisan` di Laravel.

### 1. Membuat Module (Resource)

Membuat Controller, Service, dan Route sekaligus.

```bash
npm run make:module NamaResource
# Contoh: npm run make:module Product
```

Command ini akan membuat:

- `src/controllers/product.controller.ts`
- `src/services/product.service.ts`
- `src/routes/product.route.ts` (dan otomatis didaftarkan di `src/routes/index.ts` jika memungkinkan)

### 2. Membuat Model Database

Membuat file model Prisma baru di dalam folder `src/models/` (atau `prisma/models` tergantung konfigurasi).

```bash
npm run make:model NamaModel
# Contoh: npm run make:model User
```

Ini akan membuat file `src/models/User.prisma`.

### 3. Membuat Controller

Membuat file Controller baru. Gunakan flag `-r` untuk membuat controller lengkap dengan method CRUD (index, show, store, update, destroy).

```bash
npm run make:controller NamaController
# Contoh Basic: npm run make:controller PaymentController

# Contoh Resource (CRUD Lengkap):
npm run make:controller PaymentController -r
```

### 4. Workflow Database (Prisma)

Karena framework ini menggunakan **Schema Terpisah** (split schema), Anda **TIDAK BOLEH** mengedit `prisma/schema.prisma` secara manual.

- **Edit Models**: Lakukan perubahan di `src/models/*.prisma`.
- **Apply Changes**: Jalankan perintah migrasi standar, sistem akan otomatis menggabungkan (compile) schema Anda.

```bash
# Generate Prisma Client (setiap ada perubahan model)
npm run prisma:generate

# Migrasi Database (Development)
npm run prisma:migrate

# Membuka GUI Database (Prisma Studio)
npm run db:studio

# Migrasi Database Dan Seed (Development - Reset Total default option for development)
npm run db:reset

# Deploy ke Production
npm run prisma:deploy
```

> **Catatan:** Script `compile-schema.js` akan otomatis berjalan sebelum perintah prisma di atas dieksekusi.

### 5. Generate JWT Secret

Jika Anda perlu me-refresh secret key JWT:

```bash
npm run generate:jwt
```

### 6. Maintenance (Clear Config)

Membersihkan cache framework, NPM, build artifacts, dan temporary files (sangat berguna jika mengalami isu cache aneh atau ingin reset environment development).

```bash
npm run config:clear
```

- Menghapus `node_modules/.cache`
- Menghapus `dist/`
- Menghapus `dump.rdb` (Redis Persistence)
- Membersihkan `npm cache`

---

## 📂 Struktur Folder

```text
src/
├── controllers/     # Logika Request & Response
├── services/        # Business Logic
├── routes/          # Definisi Route API
├── models/          # Definisi Schema Prisma per Model
├── middleware/      # Auth, Validation, Error Handling
├── schema/          # Zod Validation Schemas
├── utils/           # Helper Functions
└── index.ts         # App Entry Point
prisma/
├── schema.prisma    # [GENERATED] Jangan edit file ini
└── base.prisma.template # Konfigurasi Datasource & Generator
```

## 📝 Lisensi

MIT

---

## 🚀 Deployment Guide

### 1) Build & Generate Prisma Client (Otomatis)
- Build: `npm run build`
- Start (dev): `npm run start`
- Start (prod): `npm run start:prod`
- Hooks otomatis:
  - `prebuild`, `prestart`, dan `prestart:prod` akan memanggil `npm run prisma:generate` sehingga Prisma Client selalu tersedia tanpa error.

### 2) Production Environment
- Pastikan `.env` berisi kredensial production:
  - `DATABASE_URL` dan `DATABASE_PROVIDER` (mysql/postgresql)
  - `JWT_SECRET` (gunakan `npm run generate:jwt` untuk mengganti)
- Terapkan migrasi production (tanpa reset data):

```bash
npm run prisma:deploy
```

### 3) Menjalankan dengan PM2
- Install PM2:

```bash
npm i -g pm2
```

- Jalankan aplikasi:

```bash
pm2 start dist/src/index.js --name lapeh-api --time
```

- Simpan proses agar auto-start saat reboot:

```bash
pm2 save
pm2 startup
```

- Monitoring:

```bash
pm2 status
pm2 logs lapeh-api
pm2 restart lapeh-api
```

### 4) Nginx Reverse Proxy (Recommended)
- Buat server block `/etc/nginx/sites-available/lapeh`:

```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:4000;
  }
}
```

- Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/lapeh /etc/nginx/sites-enabled/lapeh
sudo nginx -t
sudo systemctl reload nginx
```

- SSL (opsional, Certbot):

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d example.com
```

### 5) Apache 2 Reverse Proxy (Alternatif)
- Enable modul proxy:

```bash
sudo a2enmod proxy proxy_http headers
sudo systemctl reload apache2
```

- Buat vhost `/etc/apache2/sites-available/lapeh.conf`:

```apache
<VirtualHost *:80>
  ServerName example.com
  ProxyPreserveHost On
  ProxyRequests Off
  <Proxy *>
    Require all granted
  </Proxy>
  ProxyPass / http://127.0.0.1:4000/
  ProxyPassReverse / http://127.0.0.1:4000/
  ErrorLog ${APACHE_LOG_DIR}/lapeh-error.log
  CustomLog ${APACHE_LOG_DIR}/lapeh-access.log combined
</VirtualHost>
```

- Aktifkan:

```bash
sudo a2ensite lapeh.conf
sudo apachectl configtest
sudo systemctl reload apache2
```

### 6) Checklist Produksi
- `npm run prisma:deploy` sukses dan tabel terbentuk
- `pm2 status` menunjukkan proses hidup
- Proxy (Nginx/Apache) menuju port aplikasi (default 4000)
- `.env` aman dan tidak di-commit ke repository
