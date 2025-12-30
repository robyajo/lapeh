# Security Best Practices (Panduan Keamanan)

Keamanan bukan fitur tambahan, melainkan prioritas utama. Lapeh Framework sudah dikonfigurasi dengan standar keamanan yang baik (Secure by Default), namun Anda tetap perlu memahami cara menjaga aplikasi tetap aman.

## 1. Perlindungan Bawaan (Built-in Protection)

Secara default, Lapeh sudah mengaktifkan:

### Helmet (HTTP Headers)

Mengamankan aplikasi dari serangan umum web vulnerabilities dengan mengatur HTTP headers yang tepat.

- **XSS Filter**: Aktif.
- **Frameguard**: Mencegah Clickjacking.
- **HSTS**: Memaksa browser menggunakan HTTPS (di production).

### Rate Limiting

Mencegah serangan _Brute Force_ dan _DDoS_ sederhana.

- **Default**: 100 request per 15 menit per IP.
- **Lokasi Config**: `src/middleware/rateLimit.ts`.

### CORS (Cross-Origin Resource Sharing)

Mengontrol domain mana yang boleh mengakses API Anda.

- **Lokasi Config**: `src/core/server.ts`.
- **Saran**: Di production, ubah `origin: "*"` menjadi domain frontend spesifik Anda (misal `origin: "https://frontend-anda.com"`).

## 2. Praktik Terbaik Developer

Framework tidak bisa melindungi dari kode yang buruk. Berikut hal yang WAJIB Anda lakukan:

### a. Validasi Input (Wajib!)

Jangan pernah mempercayai input user. Selalu gunakan `Validator`.

**❌ Tidak Aman (Raw Query):**

```typescript
// Bahaya SQL Injection jika pakai raw query manual tanpa sanitasi
const user = await db.query(`SELECT * FROM users WHERE email = '${req.body.email}'`);
```

**✅ Aman (Validator + Parameterized Query):**

```typescript
const valid = await Validator.make(req.body, { email: "required|email" });
// Gunakan parameterized query atau ORM/Query Builder pilihan Anda
const user = await db.users.findOne({
  where: { email: valid.validated().email },
});
```

### b. Manajemen Password

- **Hashing**: Jangan pernah simpan password plain text. Gunakan `bcryptjs` (sudah terintegrasi di AuthController).
- **Strength**: Validasi password minimal 8 karakter.
  ```typescript
  password: "required|string|min:8";
  ```

### c. JWT & Session

- **Secret Key**: Pastikan `JWT_SECRET` di `.env` adalah string acak yang panjang (32+ karakter).
- **Expiration**: Token akses (`ACCESS_TOKEN_EXPIRES_IN`) sebaiknya pendek (misal 15 menit - 1 jam). Gunakan Refresh Token (fitur roadmap) untuk sesi panjang.

### d. Error Handling

Jangan pernah mengekspos detail error sistem (stack trace) ke user di Production.

**❌ Buruk:**

```typescript
res.status(500).json({ error: err.message, stack: err.stack }); // Hacker bisa lihat struktur folder server
```

**✅ Aman (Lapeh Default):**
Lapeh sudah menangani ini. Di mode `production`, error internal hanya akan menampilkan "Internal Server Error" tanpa detail sensitif.

## 3. Checklist Sebelum Deploy

- [ ] Pastikan `NODE_ENV=production` di server.
- [ ] Ganti `JWT_SECRET` default dengan yang baru (`npm run generate:jwt`).
- [ ] Batasi CORS origin hanya ke domain frontend Anda.
- [ ] Pastikan database tidak bisa diakses publik (gunakan firewall/private IP).
- [ ] Gunakan HTTPS (SSL/TLS). API tanpa HTTPS sangat mudah disadap.

## 4. Melaporkan Celah Keamanan

Jika Anda menemukan celah keamanan di framework ini, mohon **JANGAN** buat Issue publik. Kirim email langsung ke maintainer (lihat `package.json`) agar bisa diperbaiki (patched) sebelum diexploitasi orang jahat.
