# Lapeh Framework Cheatsheet

Referensi cepat untuk perintah dan kode yang sering digunakan.

## 💻 CLI Commands

| Perintah                             | Fungsi                                       |
| :----------------------------------- | :------------------------------------------- |
| **`npm run dev`**                    | Menjalankan server development (hot-reload). |
| **`npm run typecheck`**              | Cek error TypeScript (tanpa compile).        |
| **`npm run lint`**                   | Cek kode kotor/variabel tidak terpakai.      |
| **`npm run lint:fix`**               | Perbaiki kode kotor otomatis.                |
| **`npm run make:module <Name>`**     | Buat Controller, Route, & Model sekaligus.   |
| **`npm run make:controller <Name>`** | Buat Controller saja.                        |
| **`npm run db:seed`**                | Isi data dummy.                              |

## 🛡️ Validator Rules (Simple Syntax)

Gunakan di `Validator.make(data, rules)`.

| Rule               | Deskripsi               | Contoh                              |
| :----------------- | :---------------------- | :---------------------------------- | -------- |
| `required`         | Wajib ada & tidak null. | `"required"`                        |
| `string`           | Harus text.             | `"required                          | string"` |
| `number`           | Harus angka.            | `"required                          | number"` |
| `email`            | Format email valid.     | `"required                          | email"`  |
| `min:X`            | Min panjang/nilai.      | `"min:8"` (pass), `"min:18"` (umur) |
| `max:X`            | Max panjang/nilai.      | `"max:255"`                         |
| `unique:table,col` | Cek unik di DB.         | `"unique:users,email"`              |
| `exists:table,col` | Cek exist di DB.        | `"exists:roles,id"`                 |
| `image`            | File harus gambar.      | `"required                          | image"`  |
| `mimes:types`      | File extension.         | `"mimes:pdf,docx"`                  |

## 🔑 Authentication

**Middleware di Route:**

```typescript
import { requireAuth, requireAdmin } from "@/middleware/auth";

router.get("/profile", requireAuth, getProfile); // Login User
router.delete("/user", requireAuth, requireAdmin, del); // Admin Only
```

**Akses User di Controller:**

```typescript
// (req as any).user tersedia setelah requireAuth
const userId = (req as any).user.userId;
const role = (req as any).user.role;
```

## ⚡ Fast Response (Serializer)

**1. Schema:**

```typescript
const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
  },
};
```

**2. Serializer:**

```typescript
const serializer = getSerializer("key-name", createResponseSchema(schema));
```

**3. Send:**

```typescript
sendFastSuccess(res, 200, serializer, { ...data });
```

## 📦 Redis (Cache)

```typescript
import { redis } from "@lapeh/core/redis";

// Set Cache (Key, Value, Mode, Detik)
await redis.set("profile:1", JSON.stringify(data), "EX", 3600);

// Get Cache
const cached = await redis.get("profile:1");
if (cached) return JSON.parse(cached);
```
