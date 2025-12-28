---
title: "Rilis v2.6.5: Perbaikan CLI Upgrade dan Dukungan MongoDB"
date: 2025-12-29
author: Lapeh Team
description: "Perbaikan bug pada perintah upgrade CLI, penyesuaian dependensi, dan perbaikan kompatibilitas tipe data Prisma Client untuk MongoDB."
tag: "Release"
---

# Rilis v2.6.5: Perbaikan CLI Upgrade dan Dukungan MongoDB

Kami baru saja merilis **v2.6.5** yang membawa beberapa perbaikan penting untuk stabilitas CLI dan kompatibilitas database.

## Apa yang Baru?

### 1. Perbaikan Perintah `upgrade` CLI
Kami memperbaiki logika pada perintah `lapeh upgrade` untuk menangani versi dependensi `lapeh` dengan lebih cerdas.
- Jika project menggunakan versi npm, `package.json` akan diupdate menggunakan caret versioning (misal `^2.6.5`).
- Jika project menggunakan versi lokal (development), akan tetap menggunakan path file.
- Memperbaiki update otomatis `tsconfig.json` agar `paths` alias `@lapeh/*` mengarah ke direktori `dist/lib` yang benar.

### 2. Perbaikan Kompatibilitas Prisma Client (MongoDB)
Dalam transisi ke dukungan penuh MongoDB menggunakan Prisma, kami menemukan beberapa ketidaksesuaian tipe data antara `BigInt` (yang biasa digunakan di SQL) dan `String` (ObjectId di MongoDB).
- Mengubah semua penggunaan `BigInt` pada ID menjadi `String` di kontroler Auth dan RBAC.
- Memperbaiki skrip seeding untuk menggunakan tipe data yang benar.
- Menambahkan model RBAC (roles, permissions, user_roles, dll) yang sebelumnya hilang dari skema Prisma utama, sehingga `prisma generate` kini berjalan sukses tanpa error tipe.

### 3. Peningkatan Stabilitas Build
Rilis ini juga memastikan proses build (`npm run build`) berjalan mulus tanpa error TypeScript yang disebabkan oleh definisi model Prisma yang tidak lengkap.

## Cara Update

Untuk memperbarui project Anda ke versi terbaru, jalankan perintah berikut di terminal project Anda:

```bash
npx lapeh upgrade
```

Atau update manual `package.json`:

```json
"dependencies": {
  "lapeh": "^2.6.5"
}
```

Lalu jalankan `npm install`.

Terima kasih telah menggunakan Lapeh! Jika menemukan masalah, silakan laporkan di repository GitHub kami.
