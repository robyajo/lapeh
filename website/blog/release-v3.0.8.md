---
title: "Rilis v3.0.8: Otomatisasi Blog Cerdas"
date: 2025-12-31
author: Tim Lapeh
description: "Script release.js kini secara cerdas membaca konten dari CHANGELOG.md untuk membuat postingan blog rilis yang detail dan informatif secara otomatis."
tag: "Release"
---

# Rilis v3.0.8: Otomatisasi Blog Cerdas

Kami dengan bangga mengumumkan rilis **Lapeh Framework v3.0.8**! Update ini membawa perubahan signifikan pada cara kami (dan Anda sebagai kontributor) mengelola rilis dan komunikasi perubahan.

## Apa yang Baru?

Masalah klasik dalam pengembangan software adalah dokumentasi rilis yang sering tertinggal atau terlalu generik ("Routine maintenance"). Di v3.0.8, kami menyelesaikan masalah ini dengan **Sistem Otomatisasi Blog Cerdas**.

### 1. 🤖 Smart Blog Generation (Integrasi CHANGELOG)

Script rilis internal (`release.js`) kini telah ditingkatkan kecerdasannya.

- **Sebelumnya**: Jika Anda memilih "Ya" untuk membuat blog, script hanya membuat template kosong atau konten generik yang harus diedit manual.
- **Sekarang**: Script secara otomatis membaca file `doc/id/CHANGELOG.md` dan `doc/en/CHANGELOG.md`. Ia mengekstrak entri untuk versi terbaru dan menyuntikkannya langsung ke dalam postingan blog.
- **Hasilnya**: Blog post yang _instan_, _detail_, dan _akurat_ sesuai dengan catatan teknis di Changelog, tanpa kerja manual tambahan.

### 2. 🌍 Dukungan Dwibahasa Penuh (Bilingual)

Lapeh berkomitmen untuk menjadi framework kelas dunia yang tetap ramah bagi pengembang Indonesia.

- Otomatisasi ini mendukung pembuatan konten dalam **Bahasa Indonesia** dan **Bahasa Inggris** secara bersamaan.
- Script akan mencari konten yang relevan di masing-masing file bahasa dan membuat dua file blog terpisah (`website/blog/release-vX.X.X.md` dan `website/en/blog/release-vX.X.X.md`).

### 3. 🛠️ Peningkatan Teknis Script Rilis

Selain fitur blog, kami juga memperkuat ketahanan script rilis:

- **Regex yang Lebih Baik**: Peningkatan logika deteksi versi (`vX.X.X`) di dalam header markdown yang bervariasi.
- **Error Handling**: Jika entri changelog tidak ditemukan, script akan memberikan feedback yang jelas alih-alih crash atau membuat file kosong.

## Mengapa Ini Penting?

Fitur ini bukan hanya untuk tim inti Lapeh. Ini adalah bagian dari filosofi kami untuk **Mengurangi Friksi (Friction)**.

Dengan mengotomatiskan tugas-tugas administratif seperti menulis log rilis, kami (dan Anda) bisa lebih fokus pada hal yang paling penting: **Menulis Kode yang Hebat**.

## Cara Update

Dapatkan versi terbaru Lapeh untuk menikmati framework yang lebih stabil dan terkelola dengan baik:

```bash
npm install lapeh@latest
```

Terima kasih telah menjadi bagian dari perjalanan Lapeh Framework! 🚀
