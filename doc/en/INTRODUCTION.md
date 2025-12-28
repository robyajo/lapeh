# Pengenalan Lapeh Framework

## Apa itu Lapeh?

**Lapeh** adalah framework Backend untuk Node.js yang dibangun di atas **Express** dan **TypeScript**.

Jika Anda pernah menggunakan **Laravel** (PHP) atau **NestJS** (Node.js), Anda akan merasa sangat familiar. Lapeh mengambil filosofi kemudahan & struktur rapi dari Laravel, namun tetap mempertahankan fleksibilitas dan kecepatan Express.

Nama "Lapeh" diambil dari bahasa Minang yang berarti "Lepas" atau "Bebas", melambangkan kebebasan developer untuk membangun aplikasi dengan cepat tanpa terbebani konfigurasi yang rumit.

## Mengapa Lapeh Dibuat?

Di ekosistem Node.js, developer sering mengalami "Decision Fatigue" (Kelelahan memilih):
- "Pakai ORM apa? Prisma, TypeORM, atau Drizzle?"
- "Validasi pakai Joi, Zod, atau express-validator?"
- "Struktur foldernya gimana? MVC? Clean Architecture?"
- "Auth-nya gimana?"

Lapeh menjawab semua itu dengan **Opinionated Defaults**:
1.  **ORM**: Prisma (Standar industri saat ini).
2.  **Validasi**: Zod (dengan wrapper syntax ala Laravel).
3.  **Struktur**: MVC Modular (Controller, Model, Route terpisah tapi kohesif).
4.  **Auth**: JWT + RBAC (Role Based Access Control) siap pakai.

## Perbandingan dengan Framework Lain

| Fitur | Express (Raw) | NestJS | Lapeh Framework |
| :--- | :--- | :--- | :--- |
| **Learning Curve** | Rendah (tapi bingung struktur) | Tinggi (Angular-style, Decorators) | **Sedang** (Express + Struktur Jelas) |
| **Boilerplate** | Kosong | Sangat Banyak | **Pas (Ready to use)** |
| **Type Safety** | Manual | Strict | **Strict (TypeScript Native)** |
| **Kecepatan Dev** | Lambat (setup manual) | Sedang | **Cepat (CLI Generator)** |
| **Fleksibilitas** | Sangat Tinggi | Kaku | **Tinggi** |

## Filosofi "The Lapeh Way"

1.  **Developer Experience (DX) First**: CLI tools, error message yang jelas, dan hot-reload adalah prioritas.
2.  **Performance by Default**: Serialisasi JSON cepat (Fastify-style) dan Redis caching terintegrasi.
3.  **Explicit is Better than Implicit**: Tidak ada "sihir" yang terlalu gelap. Kode controller Anda adalah kode Express biasa yang Anda mengerti.
4.  **Production Ready**: Security (Helmet, Rate Limit) dan Scalability (Docker, Cluster) bukan pikiran belakangan, tapi bawaan.

## Siklus Hidup Request (Request Lifecycle)

Bagaimana Lapeh menangani satu permintaan dari user?

1.  **Request Masuk** (`GET /api/users`)
2.  **Security Middleware**: Helmet (Headers), CORS, Rate Limiter.
3.  **Global Middleware**: Request Logger, Body Parser (JSON).
4.  **Routing**: Mencocokkan URL di `src/routes/`.
5.  **Auth Middleware** (Opsional): Cek token JWT & Role.
6.  **Validator** (Opsional): Validasi input body/query.
7.  **Controller**: Logika bisnis utama dijalankan.
    - Panggil Database (Prisma).
    - Panggil Cache (Redis).
8.  **Serializer**: Data diformat & disanitasi (misal: hide password).
9.  **Response**: JSON dikirim kembali ke user.

---

**Selanjutnya:** Pelajari struktur folder di [Struktur Proyek](STRUCTURE.md).
