---
title: Rilis v2.6.14 - Perbaikan Telemetry & Struktur Project
date: 2025-12-29
author: Roby Ajo
---

# Rilis v2.6.14

Kami telah merilis versi terbaru **Lapeh v2.6.14** dengan fokus pada perbaikan pengalaman pengguna, struktur project yang lebih bersih, dan pemantauan sistem yang lebih akurat.

## Apa yang Baru?

### 1. Struktur Project Lebih Bersih

Mulai versi ini, folder `doc/` tidak akan lagi disertakan secara otomatis ke dalam project baru pengguna saat menggunakan perintah `init` atau `create`. Ini membuat struktur awal project Anda lebih ringkas dan fokus pada kode aplikasi Anda.

### 2. Perbaikan Telemetry Admin Dashboard

Kami telah memperbarui sistem telemetry untuk memberikan data yang lebih akurat di Admin Dashboard.

- **Real-time Data**: Dashboard kini terhubung langsung dengan data MongoDB Atlas untuk statistik yang akurat.
- **Versi CLI**: Memperbaiki pelaporan versi CLI agar sesuai dengan registry NPM.
- **Autentikasi**: Menambahkan fitur login/logout dasar untuk keamanan akses dashboard admin.

### 3. Perbaikan Bug & Stabilitas

- Memperbaiki error `Invalid end tag` pada komponen Vue di dashboard admin.
- Memperbaiki isu 500 Internal Server Error pada endpoint statistik API di Vercel dengan memastikan kompatibilitas modul CommonJS dan HTTPS.
- Menangani peringatan depresiasi NPM dari dependensi transitif.

## Cara Update

### Untuk Pengguna Baru

Anda dapat langsung membuat project dengan versi terbaru:

```bash
npx lapeh@latest init nama-project-anda
```

Atau instal CLI secara global untuk akses lebih cepat:

```bash
npm install -g lapeh@latest
lapeh init nama-project-anda
```

### Untuk Pengguna Lama

Untuk project yang sudah ada, Anda dapat melakukan upgrade framework:

```bash
npx lapeh upgrade
```
