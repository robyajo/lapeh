# Panduan Arsitektur: Menuju "Framework as a Dependency" (Next.js Style)

Saat ini, Lapeh menggunakan pendekatan **Boilerplate** (seperti Laravel), di mana pengguna mendapatkan seluruh kode sumber (`src/`) dan bertanggung jawab atas `express`, driver database, dll.

Untuk mengubahnya menjadi seperti **Next.js** (di mana pengguna hanya menginstall `lapeh` dan `package.json` mereka bersih), kita perlu mengubah arsitektur menjadi **Library**.

## 1. Perbedaan Utama

| Fitur | Boilerplate (Lapeh Saat Ini) | Library (Next.js Style) |
| :--- | :--- | :--- |
| **Instalasi** | `git clone` / `npx create-lapeh` | `npm install lapeh` |
| **package.json** | Banyak dependency (`express`, `cors`, dll) | Sedikit (`lapeh`, `react`) |
| **Scripts** | Panjang (`nodemon src/index.ts`) | Pendek (`lapeh dev`) |
| **Core Code** | Terbuka di `src/core/` | Tersembunyi di `node_modules/lapeh` |
| **Update** | Susah (harus merge manual) | Mudah (`npm update lapeh`) |

## 2. Langkah Implementasi

Saya telah memulai langkah pertama dengan menambahkan **CLI Runner** di `bin/index.js`.

### A. Update CLI (`bin/index.js`) ✅ (Sudah Dilakukan)
Saya sudah menambahkan command `dev`, `start`, dan `build` ke dalam CLI Lapeh. Ini memungkinkan pengguna menjalankan server tanpa tahu perintah aslinya.

```javascript
// Contoh penggunaan nanti:
"scripts": {
  "dev": "lapeh dev",
  "build": "lapeh build",
  "start": "lapeh start"
}
```

### B. Struktur Project Pengguna (Target)
Nantinya, project pengguna Lapeh hanya akan berisi file bisnis mereka:

```text
my-app/
├── src/
│   ├── controllers/
│   ├── routes/
│   └── models/
├── lapeh.config.ts  <-- Konfigurasi framework (pengganti edit core)
└── package.json
```

Dan `package.json` mereka akan terlihat seperti ini:

```json
{
  "name": "my-app",
  "dependencies": {
    "lapeh": "^2.0.0"
  },
  "scripts": {
    "dev": "lapeh dev",
    "build": "lapeh build",
    "start": "lapeh start"
  }
}
```

### C. Apa yang Harus Dilakukan Selanjutnya?

1.  **Publish Package**: Anda perlu mempublish folder framework ini ke NPM (atau private registry).
    *   Pastikan `express`, `cors`, `helmet`, dll ada di `dependencies` (bukan `devDependencies`).
2.  **Abstraksi `src/index.ts`**:
    *   Saat ini `src/index.ts` adalah entry point yang diedit user.
    *   Ubah agar `lapeh dev` menjalankan server internal yang **mengimpor** routes/controller user secara dinamis (seperti Next.js pages router).
3.  **Config Loader**:
    *   Buat sistem pembacaan `lapeh.config.ts` untuk mengatur Port, Database URL, dll tanpa mengedit kode core.

## 3. Kesimpulan
Perubahan yang saya lakukan di `bin/index.js` adalah fondasi untuk CLI style. Untuk mencapai "Clean package.json" sepenuhnya, Anda harus memisahkan **Framework Core** (repo ini) dengan **User Project** (repo baru yang menginstall framework ini).
