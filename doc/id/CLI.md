# CLI Tools & Scripts

Lapeh Framework dilengkapi dengan berbagai script CLI untuk mempercepat proses development, mulai dari generate code hingga manajemen database.

Semua perintah dijalankan menggunakan `npm run <command>`.

> **Info:** Di balik layar, script `npm run` ini memanggil CLI internal framework (`lapeh`). Anda juga bisa menjalankan perintah ini secara langsung menggunakan `npx lapeh <command>`.

## Core Commands

Perintah utama untuk menjalankan aplikasi:

### 1. Inisialisasi Project (`init`)
Membuat project baru dari awal.

```bash
npx lapeh@latest init <nama-project> [flags]
```

**Flag Tersedia:**
- `--full`: Inisialisasi dengan setup lengkap (termasuk dummy user, role, permission).
- `--default`: Inisialisasi dengan konfigurasi default (PostgreSQL) melewati prompt interaktif.
- `--y`: Alias untuk `--default`.

**Contoh:**
```bash
# Mode Interaktif
npx lapeh init my-app

# Setup Lengkap (Disarankan untuk belajar)
npx lapeh init my-app --full

# Setup Cepat (Default Postgres)
npx lapeh init my-app --y
```

### 2. Upgrade Framework (`upgrade`)
Memperbarui framework Lapeh ke versi terbaru di project yang sudah ada.

```bash
npx lapeh upgrade
```
**Fitur:**
- Secara otomatis memperbarui dependensi `package.json`.
- Menyinkronkan file inti framework sambil menjaga kode kustom Anda.
- **Smart Dependency Handling**: Mempertahankan dependensi `file:` lokal jika Anda mengembangkan framework secara lokal, jika tidak akan mengupdate ke versi npm terbaru.

### 3. Development Server (`dev`)
Menjalankan server dalam mode development dengan fitur hot-reload.

```bash
npm run dev
# atau
npx lapeh dev
```

### 2. Production Server (`start`)
Menjalankan server dalam mode production (pastikan sudah dibuild).

```bash
npm run start
# atau
npx lapeh start
```

### 3. Build Project (`build`)
Mengompilasi kode TypeScript ke JavaScript di folder `dist`.

```bash
npm run build
# atau
npx lapeh build
```

## Code Generators

Gunakan perintah ini untuk membuat file boilerplate secara otomatis.

### 1. Membuat Module Lengkap (`make:module`)
Membuat Controller, Route, dan Model (Schema) sekaligus.

```bash
npm run make:module <nama-module>
```
**Contoh:** `npm run make:module Product`

Output:
- `src/controllers/productController.ts`
- `src/routes/product.ts`
- `src/models/product.prisma`

### 2. Membuat Controller (`make:controller`)
Hanya membuat file controller dengan method CRUD dasar.

```bash
npm run make:controller <nama-controller>
```
**Contoh:** `npm run make:controller Order` (Akan membuat `src/controllers/orderController.ts`)

### 3. Membuat Model Database (`make:model`)
Hanya membuat file schema Prisma baru.

```bash
npm run make:model <nama-model>
```
**Contoh:** `npm run make:model Transaction` (Akan membuat `src/models/transaction.prisma`)

## Database Management (Prisma)

Framework ini menggunakan sistem **Multi-File Schema**. Anda tidak mengedit `schema.prisma` secara langsung, melainkan mengedit file kecil di `src/models/*.prisma`.

### 1. Migrasi Database (`prisma:migrate`)
Jalankan setiap kali Anda mengubah definisi model di `src/models/*.prisma`.

```bash
npm run prisma:migrate
```
Perintah ini akan:
1. Menggabungkan semua file `.prisma` di `src/models/` menjadi satu `prisma/schema.prisma`.
2. Membuat file migrasi SQL.
3. Menerapkan perubahan ke database lokal.
4. Men-generate ulang Prisma Client (Type Definitions).

### 2. Deploy ke Production (`prisma:deploy`)
Gunakan di server production. Hanya menerapkan migrasi yang sudah ada tanpa reset data.

```bash
npm run prisma:deploy
```

### 3. Database Studio (`db:studio`)
Membuka GUI di browser untuk melihat dan mengedit data database.

```bash
npm run db:studio
```

### 4. Seeding Data (`db:seed`)
Mengisi database dengan data awal yang didefinisikan di `prisma/seed.ts`.

```bash
npm run db:seed
```

### 5. Reset Database (`db:reset`)
**PERINGATAN:** Menghapus semua data dan tabel, lalu menjalankan migrasi dari awal.

```bash
npm run db:reset
```

## Code Quality & Utilities

### 1. Linting (`lint`)
Memeriksa kode dari error, variabel tidak terpakai, dan gaya penulisan.

```bash
npm run lint
```
Gunakan `npm run lint:fix` untuk memperbaiki error otomatis.

### 2. Type Check (`typecheck`)
Memeriksa error tipe data TypeScript tanpa melakukan compile.

```bash
npm run typecheck
```

### 3. Generate JWT Secret (`generate:jwt`)
Membuat random string aman untuk `JWT_SECRET` di file `.env`.

```bash
npm run generate:jwt
```
