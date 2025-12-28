---
title: "Rilis v2.6.12: Perbaikan Kritis CLI Init & Prisma Client"
date: 2025-12-29
author: Lapeh Team
description: "Perbaikan bug pada perintah init CLI yang menyebabkan error Prisma Client saat seeding, serta pemulihan ke Prisma v6 untuk stabilitas di Windows."
tag: "Release"
---

# Rilis v2.6.12: Perbaikan Kritis CLI Init & Prisma Client

Kami merilis **v2.6.12** sebagai patch perbaikan cepat untuk mengatasi beberapa masalah kritis yang ditemukan pada rilis sebelumnya, terutama terkait dengan perintah `init` dan kompatibilitas Prisma di lingkungan Windows.

## Apa yang Diperbaiki?

### 1. Perbaikan CLI `init` dan Seeding
Pengguna sebelumnya melaporkan error `MODULE_NOT_FOUND` terkait `.prisma/client/default` saat proses seeding database otomatis berjalan.
- **Solusi**: Kami menambahkan langkah eksplisit `npx prisma generate` sebelum proses seeding dimulai dalam alur `init`. Ini memastikan Client Prisma sudah tersedia sebelum digunakan oleh script seed.

### 2. Parsing Nama Project
Terdapat bug di mana perintah `npx lapeh init nama-project` terkadang salah menginterpretasikan kata `init` sebagai nama proyek itu sendiri.
- **Solusi**: Logika parsing argumen telah diperbaiki untuk mengabaikan perintah `init` atau `create` saat menentukan nama folder tujuan.

### 3. Kembali ke Prisma v6 (Stabilitas Windows)
Upgrade ke Prisma v7 pada rilis sebelumnya menyebabkan error `PrismaClientConstructorValidationError` ("engine type client") pada beberapa lingkungan pengembangan Windows.
- **Solusi**: Kami mengembalikan dependensi default ke **Prisma v6** (`^6.0.0`) dan menghapus file `prisma.config.ts`. Project yang digenerate sekarang kembali menggunakan konfigurasi standar `schema.prisma` dengan `url = env("DATABASE_URL")` yang lebih stabil dan kompatibel secara luas.

### 4. Pembersihan Peer Dependencies
Kami menghapus `peerDependencies` dari file `package.json` project yang digenerate. Ini dilakukan untuk mencegah peringatan dan konflik package manager yang tidak perlu bagi pengguna akhir.

## Cara Update

Untuk pengguna baru, cukup jalankan perintah `init` seperti biasa, dan Anda akan otomatis mendapatkan versi terbaru:

```bash
npx lapeh init nama-project-anda
```

Untuk project yang sudah ada yang mengalami masalah di atas, Anda dapat memperbarui `package.json` secara manual untuk menggunakan `lapeh` versi `^2.6.12` dan `prisma` versi `^6.0.0`.

Terima kasih atas laporan bug dan dukungannya!
