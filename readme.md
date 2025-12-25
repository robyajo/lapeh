# API Lapeh Framework

**API Lapeh** adalah framework berbasis Express.js yang terstandarisasi, dirancang untuk mempercepat pengembangan REST API dengan struktur yang solid, aman, dan scalable. Terinspirasi oleh struktur Laravel dan NestJS, namun tetap menjaga kesederhanaan Express.

## 🚀 Fitur Utama

- **Struktur Modular**: Terorganisir rapi dengan Controllers, Services, Routes, dan Middleware.
- **TypeScript Ready**: Full TypeScript support untuk type-safety.
- **Prisma ORM**: Integrasi database yang modern dan type-safe.
- **Schema Terpisah**: Mendukung pemisahan schema Prisma per model (mirip Eloquent).
- **Generator Tools**: CLI commands untuk generate Module dan Model dengan cepat.
- **Security Best Practices**: Dilengkapi dengan Helmet, Rate Limiting, CORS, dan JWT Authentication.
- **Validasi Data**: Menggunakan Zod untuk validasi request yang kuat.

## 📦 Instalasi & Penggunaan

Buat project baru cukup dengan satu perintah:

```bash
npx lapeh-cli nama-project-anda
```

### Apa yang terjadi otomatis?

1. Struktur project dibuat.
2. Dependencies diinstall.
3. Environment variable (`.env`) disiapkan.
4. **JWT Secret** di-generate otomatis.

Masuk ke folder project dan jalankan:

```bash
cd nama-project-anda
npm run dev
```

Server akan berjalan di `http://localhost:4000`.

---

## 🛠 Development Tools

API Lapeh menyediakan tools untuk mempercepat development, mirip dengan `artisan` di Laravel.

### 1. Membuat Module (Resource)

Membuat Controller, Service, dan Route sekaligus.

```bash
npm run make:module NamaResource
# Contoh: npm run make:module Product
```

Command ini akan membuat:

- `src/controllers/product.controller.ts`
- `src/services/product.service.ts`
- `src/routes/product.route.ts` (dan otomatis didaftarkan di `src/routes/index.ts` jika memungkinkan)

### 2. Membuat Model Database

Membuat file model Prisma baru di dalam folder `src/models/` (atau `prisma/models` tergantung konfigurasi).

```bash
npm run make:model NamaModel
# Contoh: npm run make:model User
```

Ini akan membuat file `src/models/User.prisma`.

### 3. Workflow Database (Prisma)

Karena framework ini menggunakan **Schema Terpisah** (split schema), Anda **TIDAK BOLEH** mengedit `prisma/schema.prisma` secara manual.

- **Edit Models**: Lakukan perubahan di `src/models/*.prisma`.
- **Apply Changes**: Jalankan perintah migrasi standar, sistem akan otomatis menggabungkan (compile) schema Anda.

```bash
# Generate Prisma Client (setiap ada perubahan model)
npm run prisma:generate

# Migrasi Database (Development)
npm run prisma:migrate

# Deploy ke Production
npm run prisma:deploy
```

> **Catatan:** Script `compile-schema.js` akan otomatis berjalan sebelum perintah prisma di atas dieksekusi.

### 4. Generate JWT Secret

Jika Anda perlu me-refresh secret key JWT:

```bash
npm run generate:jwt
```

---

## 📂 Struktur Folder

```text
src/
├── controllers/     # Logika Request & Response
├── services/        # Business Logic
├── routes/          # Definisi Route API
├── models/          # Definisi Schema Prisma per Model
├── middleware/      # Auth, Validation, Error Handling
├── schema/          # Zod Validation Schemas
├── utils/           # Helper Functions
└── index.ts         # App Entry Point
prisma/
├── schema.prisma    # [GENERATED] Jangan edit file ini
└── base.prisma      # Konfigurasi Datasource & Generator
```

## 📝 Lisensi

MIT
