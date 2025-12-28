# Rilis Lapeh v2.4.6: Lebih Stabil dan Dokumentasi Lengkap

_Ditulis pada 28 Desember 2025 oleh robyajo_

Hari ini adalah hari yang besar bagi komunitas Lapeh Framework! Kami baru saja merilis versi **v2.4.6** yang fokus pada stabilitas, kemudahan deployment, dan pengalaman developer yang lebih baik.

## Apa yang Baru?

### 1. Perbaikan CLI dan `module-alias`

Banyak pengguna melaporkan masalah `MODULE_NOT_FOUND` saat menjalankan project di lingkungan produksi. Kami telah memperbaikinya dengan mengintegrasikan `module-alias` secara lebih robust dan memastikan semua path `@lapeh/*` teresolusi dengan benar di runtime JavaScript maupun TypeScript.

### 2. Dukungan PM2 Cluster Mode

Sekarang, `ecosystem.config.js` yang dihasilkan oleh Lapeh sudah mendukung mode Cluster (`instances: "max"`).

- Aplikasi Anda akan otomatis menggunakan semua core CPU yang tersedia di VPS.
- Performa meningkat 2x-4x lipat tanpa mengubah kode aplikasi.
- Zero-downtime reload saat update.

### 3. Website Dokumentasi Resmi

Anda sedang membacanya sekarang! Kami meluncurkan [lapeh-doc.vercel.app](https://lapeh-doc.vercel.app) sebagai pusat pengetahuan.

- **Pencarian Cepat**: Temukan fungsi atau konfigurasi dalam hitungan detik.
- **Panduan Lengkap**: Dari instalasi hingga deployment ke VPS.
- **Mode Gelap**: Nyaman di mata saat coding malam hari.

## Langkah Selanjutnya

Jika Anda sudah memiliki project Lapeh, cukup update dependensi Anda:

```bash
npm install lapeh@latest
```

Terima kasih telah menggunakan Lapeh Framework! Dukungan Anda sangat berarti bagi kami untuk terus memajukan ekosistem JavaScript di Indonesia.
