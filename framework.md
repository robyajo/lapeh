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

## Code Standards & Best Practices (Baru)

### 1. Import Path Aliases
Gunakan alias `@/` untuk mengimpor module dari folder `src/`. Hindari relative path yang panjang seperti `../../utils/response`.

**Contoh:**
```typescript
// ✅ Benar (Recommended)
import { prisma } from "@/core/database";
import { sendSuccess } from "@/utils/response";

// ❌ Salah (Legacy)
import { prisma } from "../core/database";
import { sendSuccess } from "../../utils/response";
```

### 2. Strict Linting (Dead Code Elimination)
Framework ini menerapkan aturan linter yang ketat untuk menjaga kebersihan kode. Variabel, parameter, atau import yang tidak digunakan akan menyebabkan error.

- **Variabel tidak terpakai**: Hapus atau beri prefix `_` (underscore).
  ```typescript
  // ✅ Benar
  const _unusedVariable = 123;
  function example(_req: Request, res: Response) { ... }
  
  // ❌ Error
  const unusedVariable = 123;
  function example(req: Request, res: Response) { ... } // jika req tidak dipakai
  ```

### 3. High Performance Response (Fastify-Style)
Untuk endpoint dengan throughput tinggi (GET lists, data besar), gunakan `sendFastSuccess` dengan JSON Schema serializer. Ini 2-3x lebih cepat dari `res.json` standar Express.

**Langkah-langkah:**

1. **Definisikan Schema** (sesuai field Prisma):
   ```typescript
   const userSchema = {
     type: "object",
     properties: {
       id: { type: "string" }, // BigInt otomatis dicovert ke string
       name: { type: "string" },
       email: { type: "string" }
     }
   };
   ```

2. **Buat Serializer**:
   ```typescript
   import { getSerializer, createResponseSchema } from "@/core/serializer";
   
   const userSerializer = getSerializer("user-detail", createResponseSchema(userSchema));
   ```

3. **Gunakan di Controller**:
   ```typescript
   import { sendFastSuccess } from "@/utils/response";
   
   export async function getUser(req, res) {
     const user = await prisma.user.findFirst();
     sendFastSuccess(res, 200, userSerializer, {
       status: "success",
       message: "User found",
       data: user
     });
   }
   ```

## Database Workflow (Prisma)

Framework ini menggunakan **Prisma ORM** dengan struktur schema yang modular (dipecah per file). Berikut adalah panduan lengkap dari Development hingga Deployment.

### 1. Development (Lokal)

Saat mengembangkan aplikasi di local environment:

**a. Mengupdate Schema Database**
Jika Anda mengubah file schema di `src/models/*.prisma` atau konfigurasi di `prisma/base.prisma.template`:

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
