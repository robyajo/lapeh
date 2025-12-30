---
title: "Rilis v3.0.7: Pembaruan Panduan Struktur Proyek"
date: 2025-12-30
author: Tim Lapeh
description: "Pembaruan komprehensif pada dokumentasi struktur proyek untuk mencerminkan arsitektur No-ORM dan pengenalan folder Core."
tag: "Release"
---

# Rilis v3.0.7: Pembaruan Panduan Struktur Proyek

Kami dengan senang hati mengumumkan rilis **Lapeh Framework v3.0.7**! Fokus utama rilis ini adalah menyelaraskan dokumentasi dengan perubahan arsitektur besar-besaran yang terjadi di v3.0.0.

## Apa yang Baru?

### 1. 📚 Panduan Struktur Proyek (STRUCTURE.md) Diperbarui

Kami menyadari bahwa perubahan ke arsitektur **No-ORM** mengubah banyak hal dalam struktur folder. Di versi ini, kami telah memperbarui [Panduan Struktur Proyek](/docs/structure) agar akurat 100%.

Poin-poin penting dalam panduan baru:

- **Pemisahan Jelas**: Penjelasan eksplisit tentang folder **`src/`** (User Space - tempat Anda bekerja) vs **`lib/`** (Framework Core - mesin Lapeh).
- **Penghapusan Prisma**: Dokumentasi tidak lagi membingungkan pengguna dengan referensi ke folder `prisma/` yang sudah dihapus.
- **Navigasi Visual**: Menambahkan tabel ikonik untuk membantu Anda memahami fungsi setiap folder dalam sekilas pandang.

### 2. 🤖 Dokumentasi Scripts & Automation

Lapeh v3 hadir dengan script otomatisasi yang kuat di folder `scripts/`. Kami telah menambahkan dokumentasi lengkap tentang:

- **`release.js`**: Script "ajaib" yang menangani versioning, changelog otomatis dari Git commit, dan sinkronisasi dokumentasi ke website.
- **`make-module.js`**: Cara cepat membuat fitur baru dengan struktur modular yang rapi.

### 3. 🛠️ Perbaikan CLI & Core

Selain dokumentasi, rilis ini juga mencakup pembersihan internal pada CLI untuk memastikan proses `init` dan `upgrade` berjalan lebih mulus tanpa meninggalkan residu file konfigurasi lama.

## Cara Update

Untuk mendapatkan dokumentasi terbaru di lokal dan perbaikan CLI, jalankan:

```bash
npm install lapeh@latest
```

Atau jika Anda memulai proyek baru:

```bash
npx lapeh init my-project
```

Terima kasih telah memilih Lapeh Framework! Kejelasan dokumentasi adalah prioritas kami agar Anda bisa coding lebih cepat. 🚀
