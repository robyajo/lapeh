# Rilis Lapeh v2.4.9: Smart Upgrade & Testing Suite

_Ditulis pada 28 Desember 2025 oleh robyajo_

Kami kembali dengan pembaruan penting di akhir tahun ini! **Lapeh v2.4.9** hadir dengan perbaikan signifikan pada sistem CLI dan dukungan penuh untuk pengujian aplikasi (Testing).

## Apa yang Baru?

### 1. Smart Upgrade CLI (`npx lapeh upgrade`)

Fitur upgrade di CLI kini jauh lebih pintar.

- **Sinkronisasi Penuh**: Saat Anda menjalankan `npx lapeh upgrade`, framework tidak hanya menyalin file baru, tetapi juga membersihkan file "sampah" yang sudah tidak digunakan lagi oleh framework.
- **Project Lebih Bersih**: Folder `bin` yang sebelumnya ikut tersalin ke root project Anda kini dihapus otomatis, karena manajemen binary sudah ditangani langsung oleh paket `lapeh`.
- **Perbandingan**:
    - **Lama**: Hanya menimpa file, meninggalkan file usang (dead files) menumpuk.
    - **Baru**: *Mirroring* struktur framework. File usang dihapus, file baru ditambahkan.

### 2. Dukungan Testing Terintegrasi

Kami mendengar permintaan Anda untuk dukungan testing yang lebih baik.

- **Jest + Supertest**: Lapeh kini dikonfigurasi secara default untuk mendukung Jest.
- **Isolated Build**: Folder `tests` kini dikecualikan dari proses build (`dist/`), sehingga kode produksi Anda tetap ringan dan bersih.
- **Path Alias**: Memperbaiki dukungan import `@lapeh/*` di dalam file test, memudahkan Anda menulis unit test dan integration test.

## Cara Upgrade

Untuk mendapatkan semua fitur ini, jalankan perintah berikut di project Anda:

```bash
npx lapeh upgrade
```

Perintah ini akan otomatis memperbarui struktur project Anda ke standar terbaru v2.4.9.

Terima kasih telah mempercayai Lapeh Framework sebagai pondasi aplikasi Anda. Selamat berkarya!
