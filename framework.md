# Lapeh Framework

## Quick Start

Untuk memulai project ini (Setup awal):

```bash
npm i
```

```bash
npm run first
```

Perintah di atas akan secara otomatis melakukan:

1. Copy `.env.example` ke `.env`
2. Install dependencies (`npm install`)
3. Generate JWT Secret baru di `.env`
4. Setup database (Migrate)
5. Menjalankan Database Seeder

Setelah selesai, Anda bisa langsung menjalankan project:

```bash
npm run dev
```

### Akun Default

Jika seeder dijalankan (via `npm run first` atau `npm run db:seed`), gunakan akun berikut:

- **Super Admin**: `sa@sa.com` / `string`
- **Admin**: `a@a.com` / `string`
- **User**: `u@u.com` / `string`

## Database Workflow (Prisma)

Framework ini menggunakan **Prisma ORM** dengan struktur schema yang modular (dipecah per file). Berikut adalah panduan lengkap dari Development hingga Deployment.

### 1. Development (Lokal)

Saat mengembangkan aplikasi di local environment:

**a. Mengupdate Schema Database**
Jika Anda mengubah file schema di `src/models/*.prisma` atau `prisma/schema.prisma`:

```bash
npm run prisma:migrate
```

_Perintah ini akan menggabungkan semua file schema, membuat file migrasi baru, menerapkan ke database lokal, dan men-generate ulang Prisma Client._

**b. Melihat/Edit Data (GUI)**
Untuk membuka dashboard visual database:

```bash
npm run db:studio
```

**c. Mengisi Data Awal (Seeding)**
Jika Anda butuh data dummy atau data awal (seperti roles/permissions):

```bash
npm run db:seed
```

**d. Reset Database Total**
Jika database berantakan dan ingin mengulang dari awal (HATI-HATI: Menghapus semua data):

```bash
npm run db:reset
```

_Perintah ini akan menghapus database, membuat ulang schema dari awal, dan otomatis menjalankan seeder._

---

### 2. Deployment (Production)

Saat deploy ke server production:

**a. Setup Awal**
Pastikan `.env` di production sudah disetup dengan benar (DATABASE_URL, dll).

**b. Menerapkan Migrasi**
Jangan gunakan `migrate dev` di production. Gunakan perintah ini:

```bash
npm run prisma:deploy
```

_Perintah ini hanya akan menerapkan file migrasi yang sudah ada ke database production tanpa mereset data atau meminta konfirmasi interaktif._

**c. Generate Client (Opsional)**
Biasanya dilakukan otomatis saat `npm install` (karena `postinstall`), tapi jika perlu manual:

```bash
npm run prisma:generate
```

---

### Ringkasan Command

| Command                   | Fungsi                                                   | Environment  |
| ------------------------- | -------------------------------------------------------- | ------------ |
| `npm run prisma:migrate`  | Compile schema + Create Migration + Apply to DB          | **Dev**      |
| `npm run prisma:deploy`   | Compile schema + Apply Migration only                    | **Prod**     |
| `npm run prisma:generate` | Compile schema + Update Prisma Client (Type Definitions) | Dev/Prod     |
| `npm run db:seed`         | Menjalankan script `prisma/seed.ts`                      | Dev/Prod     |
| `npm run db:reset`        | Hapus DB + Migrate ulang + Seed                          | **Dev Only** |
| `npm run db:studio`       | Buka GUI database di browser                             | Dev          |
