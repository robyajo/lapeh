# Struktur Proyek

Memahami struktur folder adalah langkah pertama untuk menguasai Lapeh Framework. Proyek ini didesain agar **mudah dinavigasi**, memisahkan logika aplikasi Anda (*User Space*) dengan mesin framework (*Core Framework*).

## Peta Direktori

Berikut adalah gambaran besar struktur direktori proyek Lapeh:

```
lapeh/
├── bin/                 # Entry point untuk CLI (npx lapeh)
├── lib/                 # ⚙️ Framework Core (Mesin Lapeh)
├── scripts/             # Script otomatisasi (Build, Release, Generator)
├── src/                 # 🏠 Source Code Aplikasi Anda (Tempat Anda bekerja)
│   ├── config/          # Konfigurasi aplikasi
│   ├── modules/         # Logika bisnis per fitur (Controller)
│   └── routes/          # Definisi rute API
├── storage/             # File sementara, log, dan upload
├── tests/               # Unit & Integration Tests
├── website/             # Source code dokumentasi ini
├── .env                 # Environment variables (Rahasia!)
├── ecosystem.config.js  # Konfigurasi PM2
├── jest.config.js       # Konfigurasi Testing
├── package.json         # Dependensi proyek
└── tsconfig.json        # Konfigurasi TypeScript
```

---

## 🏠 Folder `src/` (User Space)

Ini adalah folder terpenting. 99% waktu coding Anda akan dihabiskan di sini.

### `src/modules/` (Modular Architecture)
Lapeh menggunakan pendekatan **Modular**. Setiap fitur dikelompokkan dalam satu folder agar kode tetap rapi seiring berkembangnya aplikasi.

*   **Contoh**: Jika Anda membuat fitur "Produk", Anda akan memiliki folder `src/modules/Product/`.
*   **Isi**: Biasanya berisi `controller` (logika) dan file pendukung fitur tersebut.

### `src/routes/`
Tempat mendefinisikan URL API Anda.

*   **`index.ts`**: Pintu gerbang utama semua rute.
*   **File route lainnya**: Menghubungkan URL (misal `/api/users`) ke fungsi di Controller dan memasang middleware.

### `src/config/`
Konfigurasi statis aplikasi Anda.

*   **`app.ts`**: Pengaturan umum.
*   **`cors.ts`**: Pengaturan keamanan akses domain (CORS).

---

## ⚙️ Folder `lib/` (Framework Core)

Folder ini adalah "mesin" di balik layar. Isinya adalah kode inti yang menjalankan server, koneksi database, dan utilitas bawaan.

> **Catatan**: Anda jarang perlu menyentuh folder ini kecuali Anda ingin memodifikasi perilaku dasar framework.

*   **`lib/core/`**: Setup server Express, koneksi Redis, dan Serializer.
*   **`lib/middleware/`**: Middleware bawaan seperti `auth` (JWT), `rateLimit`, dan `requestLogger`.
*   **`lib/utils/`**: Fungsi bantuan seperti `validator` (validasi input), `logger` (pencatatan log), dan `response` (format respon standar).

---

## 🧪 Folder `tests/`

Tempat Anda menulis pengujian otomatis untuk memastikan aplikasi berjalan lancar.

*   **`unit/`**: Tes untuk fungsi-fungsi kecil secara terisolasi.
*   **`integration/`**: Tes untuk alur API secara menyeluruh (misal: hit endpoint login dan pastikan dapat token).
*   **`setup.ts`**: Konfigurasi awal sebelum tes dijalankan.

---

## 📦 Folder `storage/`

Folder untuk menyimpan file yang dihasilkan oleh aplikasi saat berjalan (runtime).

*   **`logs/`**: File log aplikasi (error log, access log).
*   **`uploads/`** (Opsional): Tempat penyimpanan file yang diunggah user (jika menggunakan penyimpanan lokal).

---

## 🛠️ File Konfigurasi Penting

| File | Deskripsi |
| :--- | :--- |
| **`.env`** | Menyimpan **rahasia** aplikasi (Database URL, API Keys). **Jangan commit file ini ke Git!** |
| **`package.json`** | Daftar pustaka (library) yang dipakai dan perintah script (`npm run ...`). |
| **`ecosystem.config.js`** | Konfigurasi untuk **PM2**. Digunakan saat deploy ke server production (VPS) agar aplikasi auto-restart. |
| **`jest.config.js`** | Pengaturan untuk framework testing (Jest). |
| **`nodemon.json`** | Pengaturan auto-restart server saat Anda sedang coding (Development mode). |

---

## 🤖 Folder `scripts/`

Berisi script "ajaib" yang memudahkan hidup Anda. Script ini biasanya dipanggil lewat perintah `npm run`.

*   **`release.js`**: Otomatisasi rilis versi, changelog, dan blog.
*   **`make-module.js`**: Generator untuk membuat modul/controller baru dengan cepat.
*   **`sync-docs.js`**: Sinkronisasi dokumentasi antar bahasa.
