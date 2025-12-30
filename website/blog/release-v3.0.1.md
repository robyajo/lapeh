---
title: Rilis v3.0.1 - Peningkatan UX CLI & Mode Database-Agnostic
date: 2025-12-30
author: Tim Lapeh
description: Update patch v3.0.1 membawa animasi CLI yang lebih interaktif, pembersihan modul contoh, dan konfigurasi database default yang lebih fleksibel.
---

# Rilis v3.0.1: Peningkatan Pengalaman Pengguna & Fleksibilitas

Kami sangat senang mengumumkan rilis **Lapeh Framework v3.0.1**! Update ini berfokus pada penyempurnaan pengalaman pengguna saat menggunakan CLI dan membuat framework lebih ringan serta fleksibel secara default.

## Apa yang Baru?

### 1. Animasi CLI yang Lebih Interaktif 🚀

Kami telah memperbarui `lapeh-cli` untuk memberikan pengalaman visual yang lebih baik.

*   **Boot Animation**: Animasi logo "L" ASCII saat memulai pembuatan proyek.
*   **Loading Spinners**: Indikator loading yang informatif saat menginstal dependensi atau melakukan build, menggantikan log yang terlalu verbose.
*   **Cleaner Output**: Tampilan terminal yang lebih bersih dan fokus pada informasi penting.

### 2. Database-Agnostic by Default 📦

Berdasarkan masukan komunitas, kami membuat Lapeh lebih "netral" terhadap database di awal instalasi.

*   **Database JSON**: Secara default, proyek baru sekarang menggunakan `database.json` sebagai penyimpanan sementara. Ini memungkinkan Anda langsung menjalankan dan menguji API tanpa perlu setup database SQL (PostgreSQL/MySQL) terlebih dahulu.
*   **Zero-Config Start**: Cukup `create`, `dev`, dan API siap digunakan dengan data dummy yang sudah tersedia.
*   **Pembersihan Config**: Variabel `DATABASE_URL` telah dihapus dari `.env` default untuk menghindari kebingungan.

### 3. Pembersihan Modul Contoh 🧹

Kami menghapus modul `Pets` yang sebelumnya ada sebagai contoh. Sekarang proyek baru lebih bersih, hanya menyertakan modul esensial:
*   **Auth**: Registrasi, Login, Profile (dengan caching Redis).
*   **RBAC**: Role-Based Access Control yang terintegrasi.

### 4. Peningkatan Performa Auth ⚡

Fungsi `me` (Get Profile) pada modul Auth kini menggunakan **Redis Caching**. Ini mempercepat respons untuk endpoint profil pengguna secara signifikan.

## Cara Update

Untuk membuat proyek baru dengan versi ini:

```bash
npx lapeh-cli@latest create my-new-app
```

Untuk proyek yang sudah ada, Anda dapat memperbarui dependensi `lapeh` di `package.json` ke `^3.0.1`.

Terima kasih telah menggunakan Lapeh Framework!
