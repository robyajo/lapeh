---
title: Rilis v2.6.14 - Perbaikan Telemetry & Project Structure
date: 2025-12-29
author: Roby Ajo
---

# Rilis v2.6.14

Kami telah merilis versi terbaru **Lapeh v2.6.14** dengan fokus pada perbaikan pengalaman pengguna dan pemantauan sistem.

## 🛠 Perbaikan (Fixes)

### 1. Struktur Project Lebih Bersih

Kami mendengar masukan Anda! Sekarang saat Anda membuat project baru menggunakan `lapeh create` atau `npx lapeh create`, folder dokumentasi (`doc/`) **tidak akan lagi disertakan** ke dalam project Anda. Ini membuat project awal Anda lebih bersih dan ringan.

### 2. Admin Dashboard Realtime

Dashboard admin sekarang terhubung langsung dengan database MongoDB secara realtime. Anda dapat melihat statistik penggunaan CLI, versi Node.js, dan sistem operasi pengguna secara akurat.

### 3. Telemetry CLI

Kami memperbaiki logika pengiriman telemetry di CLI. Sekarang versi CLI yang Anda gunakan akan terekam dengan benar di sistem, membantu kami memahami sebaran versi pengguna.

## Cara Update

Untuk mendapatkan fitur terbaru ini, silakan update CLI Lapeh Anda secara global:

```bash
npm install -g lapeh@latest
```

Atau gunakan npx secara langsung:

```bash
npx lapeh create nama-project
```
