# Lapeh Framework For Website Documentation

Jika Anda ingin membangun website dokumentasi sekelas **NestJS** atau **Next.js** di `https://lapeh.web.id`, berikut adalah **Blueprint Lengkap** (Rancang Bangun) yang perlu Anda siapkan.

Tujuannya adalah membuat pengguna baru merasa _terbimbing_ dari nol hingga mahir, serta memberikan referensi cepat bagi pengguna lama.

---

## 1. Rekomendasi Teknologi (Tech Stack)

Untuk membuat dokumentasi yang modern, cepat, dan mudah dikelola, jangan membuatnya dari nol (HTML manual). Gunakan _Documentation Framework_:

- **Pilihan Utama (React/Next.js ecosystem):** [Nextra](https://nextra.site/) atau [Docusaurus](https://docusaurus.io/).
  - _Alasan:_ Mendukung Markdown/MDX, SEO friendly, pencarian cepat, dan tampilan yang sangat mirip dengan Next.js/Vercel docs.
- **Alternatif (Vue ecosystem):** [VitePress](https://vitepress.dev/).

---

## 2. Struktur Menu Utama (Top Navigation)

Menu di bagian atas (Header) harus sederhana namun mencakup akses ke area vital:

1.  **Docs** (Dokumentasi utama)
2.  **API Reference** (Kamus kode: daftar lengkap class, function, interface)
3.  **Blog** (Berita rilis versi baru, tutorial kasus nyata)
4.  **Community** (Link ke Discord, GitHub Discussions)
5.  **GitHub Icon** (Link ke repository)
6.  **Search Bar** (Pencarian global - _Wajib ada_)
7.  **Version Dropdown** (Jika nanti ada v2.0, v3.0, user bisa ganti versi)

---

## 3. Struktur Konten (Sidebar Menu)

Ini adalah "Jantung" dari dokumentasi Anda. Urutannya harus logis: dari pengenalan -> dasar -> teknik lanjut -> deploy.

### A. Introduction (Pengenalan)

- **Overview**: Apa itu Lapeh? Kenapa menggunakan ini? (Filosofi: Struktur Laravel di Node.js).
- **Installation**: Cara install via `npx lapeh@latest`.
- **First Steps**: "Hello World" pertama, menjalankan `npm run dev`, struktur folder awal.
- **CLI Commands**: Penjelasan perintah `lapeh`, `npm run make:module`, dll.

### B. Fundamentals (Dasar-Dasar)

- **Directory Structure**: Penjelasan detail folder `src/`, `prisma/`, `bin/`.
- **Routing**: Cara membuat route baru di `src/routes/`.
- **Controllers**: Cara membuat controller, menangani Request/Response.
- **Services**: Business logic layer (pemisahan logic dari controller).
- **Middleware**: Cara kerja middleware, error handling global, validation.
- **DTO & Validation**: Validasi request menggunakan **Zod**.

### C. Database (Prisma ORM)

- **Prisma Basics**: Konfigurasi `.env`, `prisma/base.prisma`.
- **Models**: Cara membuat model baru di `src/models/*.prisma`.
- **Migrations**: Workflow `npm run prisma:migrate` vs `prisma:deploy`.
- **Seeding**: Cara mengisi data awal (`npm run db:seed`).
- **Studio**: Mengelola data via GUI (`npm run db:studio`).

### D. Security (Keamanan)

- **Authentication**: Login, Register, JWT Strategy.
- **Authorization (RBAC)**: Role-based access control (Admin vs User).
- **Encryption**: Hashing password (Bcrypt).
- **Protection**: Helmet, CORS, Rate Limiting (sudah built-in di Lapeh).

### E. Techniques (Teknik Lanjut)

- **File Upload**: Upload gambar/file (Multer).
- **Realtime**: Integrasi Socket.io (karena sudah ada di `src/realtime.ts`).
- **Caching**: Redis integration.
- **Logging**: Cara logging error dan activity.
- **Unit Testing**: (Jika ada fitur testing).

### F. Deployment (Rilis)

- **Environment Variables**: Persiapan `.env` untuk production.
- **Process Manager**: Menggunakan PM2.
- **Docker**: Cara containerize aplikasi Lapeh.
- **Cloud Platforms**: Panduan deploy ke VPS (Ubuntu), Railway, atau Vercel.

---

## 4. Fitur Wajib di Website Dokumentasi

Agar website dokumentasi Anda terasa "Profesional" dan "Developer Friendly":

1.  **Code Highlighting & Copy Button**:
    Setiap blok kode harus punya warna syntax (highlighting) dan tombol "Copy" di pojok kanan atas.

    ```typescript
    // Contoh tombol copy harus ada di sini
    const app = lapeh();
    ```

2.  **Dark Mode**:
    Developer suka mode gelap. Pastikan website mendukung toggle Light/Dark mode.

3.  **Algolia Search (Pencarian Cepat)**:
    User tidak suka klik menu satu per satu. Mereka ingin ketik "JWT" dan langsung ketemu halamannya.

4.  **Prev/Next Pagination**:
    Di bawah setiap artikel, ada tombol untuk lanjut ke bab berikutnya.

    - _< Sebelumnya: Installation_ | _Selanjutnya: First Steps >_

5.  **"Edit this page on GitHub"**:
    Tombol di setiap halaman agar komunitas bisa bantu koreksi typo atau update dokumentasi (Open Source contribution).

6.  **Interactive Tabs**:
    Jika ada pilihan (misal: NPM vs Yarn vs PNPM), gunakan tab.
    ```
    [NPM] [Yarn] [PNPM]
    npm install lapeh
    ```

---

## 5. Contoh Konten Halaman Utama (Landing Page)

Halaman depan `https://lapeh.web.id` jangan langsung masuk ke dokumentasi teknis. Buat _Selling Point_:

- **Hero Section**:
  - Judul Besar: "The Standardized Node.js Framework".
  - Sub-judul: "Build scalable APIs with ease. Inspired by Laravel, powered by Express & Prisma."
  - Tombol: [Get Started] [GitHub].
- **Features Grid**:
  - 📦 **Modular**: Terstruktur rapi per fitur.
  - 🛡️ **Type-Safe**: Full TypeScript & Zod.
  - ⚡ **Prisma Power**: Database ORM modern.
  - 🚀 **CLI Tools**: Generate code dalam detik.

---

## 6. Langkah Kerja (Action Plan)

1.  **Setup Repo**: Buat repo baru `lapeh-docs`.
2.  **Init Project**: `npx create-nextra-app` (paling cepat) atau `npx create-docusaurus@latest`.
3.  **Isi Konten**: Pindahkan isi `readme.md` dan `framework.md` ke dalam struktur bab di atas.
4.  **Deploy**: Push ke GitHub, connect ke **Vercel** (gratis untuk open source).
5.  **Domain**: Beli/set `lapeh.web.id` arahkan ke Vercel.

---

## 7. Struktur Folder Proyek Dokumentasi (Nextra/Docusaurus)

Berikut adalah gambaran struktur folder jika Anda menggunakan **Nextra** (berbasis Next.js) untuk website dokumentasi `lapeh.web.id`:

```
lapeh-docs/
├── pages/
│   ├── index.mdx              # Halaman Landing Page (Home)
│   ├── _meta.json             # Konfigurasi Menu Sidebar & Top Nav
│   ├── docs/                  # Folder Utama Dokumentasi
│   │   ├── _meta.json         # Urutan menu sidebar
│   │   ├── introduction/
│   │   │   ├── _meta.json
│   │   │   ├── overview.mdx   # Apa itu Lapeh?
│   │   │   ├── installation.mdx
│   │   │   ├── first-steps.mdx
│   │   │   └── cli.mdx
│   │   ├── fundamentals/
│   │   │   ├── _meta.json
│   │   │   ├── directory-structure.mdx
│   │   │   ├── routing.mdx
│   │   │   ├── controllers.mdx
│   │   │   └── ...
│   │   ├── database/
│   │   │   ├── _meta.json
│   │   │   ├── prisma-basics.mdx
│   │   │   ├── models.mdx
│   │   │   └── ...
│   │   ├── security/
│   │   │   ├── _meta.json
│   │   │   └── ...
│   │   ├── techniques/
│   │   │   ├── _meta.json
│   │   │   └── ...
│   │   └── deployment/
│   │       ├── _meta.json
│   │       └── ...
│   ├── blog/                  # Folder Blog
│   │   ├── _meta.json
│   │   ├── release-v1-0-0.mdx
│   │   └── tutorial-auth.mdx
│   └── about.mdx              # Halaman About/Team
├── public/                    # Aset statis (Logo, Gambar)
│   ├── logo.png
│   ├── favicon.ico
│   └── images/
│       └── architecture-diagram.png
├── theme.config.jsx           # Konfigurasi Tema (Logo, Footer, Social Links)
├── next.config.js             # Config Next.js
├── package.json
└── tsconfig.json
```

### Penjelasan File Penting:

- **`pages/`**: Semua konten Markdown/MDX ada di sini.
- **`_meta.json`**: File json kecil di setiap folder untuk mengatur urutan menu sidebar dan judul yang tampil.
- **`theme.config.jsx`**: Di sini Anda mengatur logo `Lapeh`, link GitHub, dan konfigurasi SEO.

Dengan struktur ini, framework Anda akan terlihat sangat matang dan profesional, meningkatkan kepercayaan developer untuk menggunakannya.
