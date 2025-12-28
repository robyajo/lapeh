---
title: "Lapeh v2.6.17: Peningkatan Performa dengan Redis Caching"
date: 2025-12-29
author: Roby Ajo
description: "Rilis terbaru Lapeh menghadirkan implementasi caching Redis pada modul Pets sebagai contoh praktik terbaik untuk meningkatkan performa API."
head:
  - - meta
    - name: keywords
      content: lapeh, framework, nodejs, redis, caching, performance, express
---

# Lapeh v2.6.17: Peningkatan Performa dengan Redis Caching 🚀

Kami dengan bangga mengumumkan rilis **Lapeh v2.6.17**! 🎉

Fokus utama pada rilis ini adalah **performa**. Kami telah mengimplementasikan **Redis Caching** pada modul contoh (`Pets`) untuk mendemonstrasikan bagaimana Lapeh dapat menangani beban trafik tinggi dengan efisien.

## Apa yang Baru?

### 1. Implementasi Caching di Modul Pets ⚡

Sebagai contoh nyata (*best practice*) bagi pengguna, kami telah menambahkan logika caching pada `PetsController`. Ini bukan hanya sekadar fitur, tapi panduan bagaimana Anda seharusnya membangun API yang scalable.

#### Strategi Caching yang Digunakan:

*   **Cache-Aside Pattern**: Aplikasi pertama-tama mengecek cache. Jika ada, kembalikan data dari cache. Jika tidak, ambil dari database, simpan ke cache, lalu kembalikan ke user.
*   **Smart Invalidation**: Saat data Pet dibuat, diupdate, atau dihapus, cache yang relevan (list pets dan detail pet tersebut) otomatis dihapus agar user selalu mendapatkan data terbaru.

#### Contoh Kode Implementasi:

Berikut adalah cuplikan bagaimana mudahnya menggunakan caching di Lapeh v2.6.17:

```typescript
// src/modules/Pets/pets.controller.ts

import { getCache, setCache, delCachePattern } from "@lapeh/core/redis";

// 1. GET List (Cache selama 60 detik)
export async function index(req: Request, res: Response) {
  const cacheKey = `pets:list:${JSON.stringify(req.query)}`;
  
  // Cek Cache
  const cached = await getCache(cacheKey);
  if (cached) {
    return sendFastSuccess(res, 200, petListSerializer, cached);
  }

  // ... Query ke Database ...

  // Simpan ke Cache
  await setCache(cacheKey, responseData, 60);
  
  sendFastSuccess(res, 200, petListSerializer, responseData);
}

// 2. Invalidate Cache saat Create/Update/Delete
export async function store(req: Request, res: Response) {
  // ... Create Data ...

  // Hapus semua cache list pets agar data baru muncul
  await delCachePattern("pets:list:*");

  sendFastSuccess(res, 201, petSerializer, data);
}
```

### 2. Helper Redis Baru 🛠️

Kami menambahkan fungsi helper baru di `@lapeh/core/redis` untuk mempermudah invalidasi cache massal:

*   `delCachePattern(pattern: string)`: Menghapus semua key Redis yang cocok dengan pattern tertentu (contoh: `pets:list:*`).

### 3. Perbaikan Minor & Dependensi 📦

*   Update versi dependensi internal.
*   Optimasi konfigurasi build untuk project baru.

## Cara Update

Untuk pengguna project yang sudah ada, Anda bisa melihat referensi implementasi di `src/modules/Pets/pets.controller.ts` pada repo utama atau membuat project baru untuk melihat contohnya.

Jika Anda ingin mengupdate CLI Lapeh ke versi terbaru:

```bash
npm install -g lapeh@latest
```

## Kesimpulan

Dengan rilis ini, Lapeh semakin siap untuk production environment yang membutuhkan kecepatan tinggi. Kami berharap contoh implementasi caching ini dapat membantu Anda membangun aplikasi yang lebih baik.

Selamat coding! ☕
