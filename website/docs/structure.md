# 🏗️ Struktur Proyek

Lapeh Framework didesain agar **intuitif**. Kami memisahkan kode aplikasi Anda (_User Space_) dari mesin framework (_Core_), sehingga Anda bisa fokus membangun fitur tanpa terganggu kompleksitas sistem.

## 🗺️ Peta Navigasi

Berikut adalah peta mental untuk memahami folder Lapeh:

| Folder         | Ikon | Fungsi                                                         | Status            |
| :------------- | :--: | :------------------------------------------------------------- | :---------------- |
| **`src/`**     |  🏠  | **KODE APLIKASI ANDA**. Disini Anda bekerja setiap hari.       | **Wajib Edit**    |
| **`scripts/`** |  🤖  | **Asisten Otomatis**. Script untuk rilis, generate modul, dll. | **Boleh Edit**    |
| **`bin/`**     |  🚀  | **CLI Tools**. Entry point untuk perintah `npx lapeh`.         | **Jarang Edit**   |
| **`lib/`**     |  ⚙️  | **Mesin Framework**. Core logic server & database.             | **DILARANG Edit** |

---

## 1. 🏠 Folder `src/` (User Space)

Ini adalah "kandang" Anda. 99% kode fitur baru akan ditulis di sini.

### `src/modules/` (Arsitektur Modular)

Lapeh menggunakan pendekatan **Modular**. Satu fitur = Satu folder.

- **Contoh**: Folder `src/modules/Auth/` berisi semua logika login/register.
- **Keuntungan**: Kode rapi, mudah dicari, dan mudah dihapus jika fitur tidak dipakai lagi.

### `src/routes/`

Pintu gerbang API Anda.

- Mendefinisikan URL (misal: `/api/users`).
- Menghubungkan URL ke **Controller**.

### `src/config/`

Pusat pengaturan aplikasi.

- `app.ts`: Konfigurasi global.
- `cors.ts`: Keamanan akses domain.

---

## 2. 🤖 Folder `scripts/` (Asisten Robot)

Jangan lakukan hal membosankan secara manual! Lapeh menyediakan robot di sini:

- **`release.js`**: **Super Script** untuk merilis versi baru.
  - ✨ Otomatis bump versi (package.json).
  - 📝 **Auto-Blog**: Membuat artikel rilis otomatis dari history Git Commit.
  - 🔄 **Auto-Sync**: Sinkronisasi dokumentasi ke website.
  - 🚀 Push ke Git & Publish ke NPM dalam satu perintah.
- **`make-module.js`**: Generator untuk membuat struktur folder module baru dalam sekejap.

---

## 3. 🚀 Folder `bin/` (CLI & Update)

Folder ini menangani perintah terminal `npx lapeh`.

- Menyediakan fitur **Auto-Update Check** saat Anda menjalankan `npm run dev`.
- Menangani perintah `upgrade` untuk menyinkronkan proyek Anda dengan versi Lapeh terbaru tanpa merusak kode Anda.

---

## 4. ⚙️ Folder `lib/` (The Core)

"Ruang Mesin" Lapeh. Berisi setup Express, koneksi Database, Logger, dan Middleware dasar.

> ⚠️ **Peringatan**: Mengubah isi folder ini bisa membuat aplikasi sulit di-update ke versi Lapeh selanjutnya.

---

## 📄 File Penting Lainnya

- **`.env`**: **Kunci Rahasia**. Simpan password DB dan API Key disini. (Jangan di-upload ke Git!)
- **`package.json`**: Daftar "belanjaan" library proyek Anda.
- **`ecosystem.config.js`**: Siap deploy? File ini mengatur cara aplikasi berjalan di server production (VPS) menggunakan PM2.
