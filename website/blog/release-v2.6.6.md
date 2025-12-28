---
title: "Rilis v2.6.6: Perbaikan CLI Upgrade dan Dukungan MongoDB"
date: 2025-12-29
author: Lapeh Team
description: "Perbaikan bug pada perintah upgrade CLI, penyesuaian dependensi, dan perbaikan kompatibilitas tipe data Prisma Client untuk MongoDB."
tag: "Release"
---

# Rilis v2.6.6: Perbaikan CLI Upgrade dan Dukungan MongoDB

Kami baru saja merilis **v2.6.6** yang membawa beberapa perbaikan penting untuk stabilitas CLI dan kompatibilitas database.

## Apa yang Baru?

### 1. Perbaikan Perintah CLI `upgrade`
Kami telah meningkatkan logika pada perintah `lapeh upgrade` agar lebih cerdas dalam menangani versi dependensi `lapeh`.
- Jika project menggunakan versi npm, `package.json` akan diperbarui menggunakan caret versioning (contoh: `^2.6.6`).
- Jika project menggunakan versi lokal (development), ia akan tetap menggunakan path file lokal.
- Memperbaiki pembaruan otomatis `tsconfig.json` agar alias `paths` `@lapeh/*` mengarah ke direktori `dist/lib` yang benar.

### 2. Kompatibilitas Prisma Client (MongoDB)
Dalam transisi menuju dukungan penuh MongoDB menggunakan Prisma, kami menemukan ketidakcocokan tipe data antara `BigInt` (umum di SQL) dan `String` (ObjectId di MongoDB).
- Mengubah semua penggunaan `BigInt` untuk ID menjadi `String` pada controller Auth dan RBAC.
- Memperbaiki script seeding agar menggunakan tipe data yang benar.
- Menambahkan model RBAC (roles, permissions, user_roles, dll) yang sebelumnya hilang dari schema Prisma utama, sehingga `prisma generate` kini berjalan sukses tanpa error tipe data.

### 3. Peningkatan Stabilitas Build
Rilis ini juga memastikan proses build (`npm run build`) berjalan lancar tanpa error TypeScript yang disebabkan oleh definisi model Prisma yang tidak lengkap.

## Cara Update

Untuk memperbarui project Anda ke versi terbaru, jalankan perintah berikut di terminal project Anda:

```bash
npx lapeh upgrade
```

Atau perbarui manual `package.json`:

```json
"dependencies": {
  "lapeh": "^2.6.6"
}
```

Lalu jalankan `npm install`.

Terima kasih telah menggunakan Lapeh! Jika Anda menemukan kendala, silakan laporkan di repository GitHub kami.
