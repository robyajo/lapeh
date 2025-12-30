---
title: "Release v3.0.0: Era Baru Tanpa ORM Bawaan (No-ORM)"
date: 2025-12-30
author: Lapeh Team
description: "Lapeh Framework v3.0.0 hadir dengan perubahan besar: penghapusan Prisma sebagai ORM default untuk memberikan kebebasan penuh kepada developer."
tag: "Release"
---

# Release v3.0.0: Era Baru Tanpa ORM Bawaan

Kami dengan bangga mengumumkan rilis **Lapeh Framework v3.0.0**. Ini adalah rilis *major* yang membawa perubahan filosofi mendasar pada framework ini.

Mulai versi 3.0.0, **Lapeh tidak lagi menyertakan Prisma ORM secara default**.

## Mengapa Perubahan Ini?

Selama pengembangan versi 2.x, kami menyadari bahwa memaksakan satu ORM (Prisma) dengan struktur *split-schema* yang kompleks seringkali menjadi penghalang bagi developer yang:
1. Lebih menyukai ORM lain (seperti TypeORM, Drizzle, atau MikroORM).
2. Ingin menggunakan Raw SQL query builder (seperti Kysely atau Knex).
3. Mengalami masalah kompatibilitas Prisma di lingkungan tertentu (Windows/Linux/Docker).

Dengan menghapus ORM bawaan, Lapeh menjadi lebih **ringan**, **fleksibel**, dan **agnostik database**.

## Apa yang Baru?

### 1. Kebebasan Memilih Database Stack
Anda sekarang bebas menginstal driver database atau ORM apa pun setelah melakukan `init`. Framework hanya menyediakan struktur folder, routing, controller, dan utility dasar.

### 2. CLI Lebih Cepat & Sederhana
- Perintah `npx lapeh init` tidak lagi menanyakan konfigurasi database.
- Perintah `npm run make:module` hanya membuat Controller dan Route, tanpa file `.prisma`.
- Tidak ada lagi script "magic" seperti `compile-schema.js` yang berjalan di background.

### 3. Demo Menggunakan In-Memory Data
Untuk memudahkan pengguna baru mencoba framework tanpa setup database yang rumit, modul bawaan (Pets, Auth, RBAC) kini menggunakan **Mock Data (In-Memory)**.
- Anda bisa langsung menjalankan `npm run dev` setelah install, dan API langsung jalan!
- Reset server akan mereset data (karena tersimpan di memori).

### 4. Redis Caching Example
Kami menyertakan contoh implementasi caching menggunakan Redis pada modul `Pets`. Ini menunjukkan bagaimana cara mengoptimalkan performa API Anda dengan mudah menggunakan helper `getCache` dan `setCache` bawaan Lapeh.

## Panduan Migrasi dari v2.x

Jika Anda pengguna v2.x dan ingin mengupgrade ke v3.0.0 namun tetap ingin menggunakan Prisma:

1. **Update Framework**: Ubah versi `lapeh` di `package.json` ke `^3.0.0`.
2. **Install Prisma Manual**: Karena Prisma tidak lagi jadi dependency `lapeh`, Anda harus menginstallnya sendiri:
   ```bash
   npm install prisma --save-dev
   npm install @prisma/client
   ```
3. **Setup Prisma**:
   - Jika Anda menggunakan struktur split-schema lama, Anda mungkin perlu menggabungkannya menjadi satu `prisma/schema.prisma` manual, atau tetap menggunakan script `compile-schema.js` lama Anda (jika Anda menyalinnya ke project Anda).
   - Kami sarankan menggunakan struktur standar Prisma (satu file `schema.prisma`).

## Penutup

Lapeh v3.0.0 adalah langkah kami untuk membuat framework ini lebih *versatile*. Kami tidak sabar melihat apa yang akan Anda bangun dengan kebebasan baru ini!

Happy Coding! 🚀
