# Rilis Lapeh v2.4.12: Stabilitas Database & Kompatibilitas SQL

_Ditulis pada 28 Desember 2025 oleh robyajo_

Kami merilis **Lapeh v2.4.12** sebagai perbaikan cepat (hotfix) dan penyempurnaan dari versi sebelumnya, fokus pada stabilitas inisialisasi database dan kompatibilitas skema.

## Apa yang Baru?

### 1. Perbaikan Versi Prisma (v5.22.0)

Kami mendeteksi adanya ketidakcocokan versi antara Prisma CLI terbaru (v6/v7) dengan _runtime_ yang digunakan framework (v5.22.0).

- **Downgrade Default**: CLI Lapeh kini secara eksplisit mengunci versi Prisma ke **v5.22.0** saat inisialisasi proyek baru.
- **Manfaat**: Menghilangkan error validasi skema dan memastikan `@prisma/client` bekerja mulus dengan engine yang terinstall.

### 2. Kompatibilitas Skema SQL Otomatis

Bagi pengguna yang memilih **PostgreSQL** atau **MySQL**, kami meningkatkan kecerdasan compiler skema kami.

- **Auto-Strip MongoDB Syntax**: Skrip `compile-schema.js` kini secara otomatis mendeteksi jika Anda menggunakan SQL database, dan akan membersihkan atribut khusus MongoDB seperti `@db.ObjectId` dan `@map("_id")` dari model Anda.
- **Seamless Switching**: Anda bisa berpindah dari MongoDB ke SQL (atau sebaliknya) dengan lebih mudah tanpa harus mengedit model secara manual satu per satu.

### 3. Paket Distribusi Lebih Bersih

Kami melakukan pembersihan akhir sebelum rilis ini untuk memastikan paket yang Anda unduh seminimal mungkin.

- **Cleanup**: Folder pengujian internal, inisialisasi dev, dan file testing lokal telah dihapus dari paket NPM.
- **MIT License**: File lisensi kini disertakan dengan benar.

## Cara Upgrade

Bagi pengguna baru:

```bash
npx lapeh init my-project
```

Bagi pengguna yang mengalami error Prisma, silakan update `package.json` Anda untuk menggunakan `prisma: "5.22.0"` dan jalankan `npm install`.
