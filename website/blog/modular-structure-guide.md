---
title: "Mengenal Struktur Project Modular di Lapeh Framework"
date: 2025-12-29
author: Lapeh Team
description: "Panduan lengkap memahami perubahan struktur direktori Lapeh Framework menuju arsitektur modular yang lebih terorganisir dan scalable."
tag: "Guide"
---

# Mengenal Struktur Project Modular di Lapeh Framework

Seiring berkembangnya aplikasi, mengelola ratusan file dalam satu folder controller atau model bisa menjadi mimpi buruk. Itulah mengapa mulai versi terbaru, Lapeh Framework mengadopsi pendekatan **Modular Architecture**.

Artikel ini akan membahas perubahan struktur direktori dan bagaimana hal ini membuat pengembangan aplikasi Anda lebih rapi dan mudah dikelola.

## Apa itu Modular Architecture?

Alih-alih memisahkan file berdasarkan _jenisnya_ (semua controller di folder `controllers/`, semua model di `models/`), kami sekarang mengelompokkan file berdasarkan **Fitur**.

### Struktur Lama (Layered)

```bash
src/
  controllers/
    authController.ts
    productController.ts
  models/
    user.model.ts
    product.model.ts
```

Jika Anda ingin mengubah fitur "Product", Anda harus melompat-lompat antara folder `controllers` dan `models`.

### Struktur Baru (Modular)

```bash
src/
  modules/
    Auth/
      auth.controller.ts
      auth.model.ts
    Product/
      product.controller.ts
      product.model.ts
```

Sekarang, segala sesuatu yang berhubungan dengan "Auth" ada di satu tempat. Ini membuat kode lebih:

1.  **Portable**: Mudah dipindahkan atau dicopy ke project lain.
2.  **Maintainable**: Anda fokus pada satu folder saat mengerjakan satu fitur.
3.  **Scalable**: Tim yang berbeda bisa mengerjakan modul yang berbeda tanpa konflik file.

## Perubahan Penting Lainnya

### 1. Folder `src/config/`

Kami menambahkan folder khusus untuk konfigurasi statis aplikasi.

- `app.ts`: Konfigurasi umum.
- `cors.ts`: Pengaturan keamanan CORS.

### 2. Generator Otomatis: `make-module`

Karena strukturnya berubah, cara membuat file baru juga berubah. Kami menyediakan script baru:

```bash
npm run make-module NamaFitur
```

Perintah ini akan otomatis membuatkan folder `src/modules/NamaFitur` lengkap dengan controller dan file model template-nya.

### 3. CLI Telemetry & Tracking

Kami juga telah memperbarui sistem tracking di dashboard admin. Kini Anda bisa melihat versi Lapeh CLI mana yang paling banyak digunakan oleh komunitas, membantu kami menentukan prioritas dukungan versi.

## Kesimpulan

Perubahan ini mungkin terasa besar, tapi tujuannya adalah untuk kenyamanan jangka panjang. Dengan struktur modular, Lapeh Framework siap menangani aplikasi dari skala kecil hingga enterprise.

Selamat mencoba struktur baru ini! Jangan lupa jalankan `npx lapeh init` untuk melihatnya secara langsung.
