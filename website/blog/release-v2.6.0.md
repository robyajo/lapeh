---
title: Rilis v2.6.0 - Modular Architecture & Prisma v7
date: 2025-12-29
author: Roby
description: Lapeh Framework kini mendukung arsitektur modular ala NestJS dan Prisma v7.
---

# Rilis v2.6.0: Modular Architecture, Prisma v7, dan CLI Baru

Kami sangat bersemangat mengumumkan rilis versi **2.6.0** dari Lapeh Framework! Update ini membawa perubahan besar pada struktur project dan tooling untuk meningkatkan pengalaman developer.

## 🚀 Fitur Baru

### 1. Modular Architecture (Ala NestJS)
Kini Anda tidak perlu lagi bingung menaruh file controller atau model. Lapeh mengadopsi struktur modular:
- **`src/modules/`**: Semua fitur dibagi per modul (misal: `Auth`, `Pets`).
- Setiap modul berisi Controller, Service, dan file Prisma Schema (`.prisma`) masing-masing.
- Lebih rapi, lebih mudah di-scale.

### 2. Prisma v7 Support
Lapeh kini menggunakan **Prisma v7.2.0**!
- Konfigurasi modern dengan `prisma.config.ts`.
- Dukungan database yang lebih fleksibel (PostgreSQL & MySQL).
- Performa lebih cepat dan fitur terbaru dari Prisma.

### 3. CLI yang Lebih Cerdas
Command `make:controller` dan `make:model` telah dihapus. Sambutlah:
- **`npx lapeh make:modul <Nama>`**: Generate controller, service, route, dan model sekaligus!
- **`npx lapeh-cli init`**: Setup project interaktif dengan pilihan ORM (Ya/Tidak) dan konfigurasi database otomatis.
- **Telemetry**: Kami kini memantau kesehatan CLI untuk perbaikan bug yang lebih cepat.

## 🛠️ Perubahan Lainnya
- **Centralized Config**: Folder `src/config` untuk pengaturan CORS, App, dan lainnya.
- **Dynamic Database URL**: Tidak ada lagi hardcoded URL di `schema.prisma`. Semua via `.env`.

## 📦 Cara Update
Update Lapeh CLI Anda dan nikmati fitur barunya:
```bash
npm install -g lapeh-cli
```

Terima kasih telah menggunakan Lapeh Framework!
