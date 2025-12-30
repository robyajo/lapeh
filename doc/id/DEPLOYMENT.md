# Deployment Guide

Panduan ini akan membantu Anda membawa aplikasi Lapeh dari `localhost` ke Server Production (VPS/Cloud).

## Persiapan Pra-Deploy

Sebelum deploy, pastikan:

1.  **Environment Variables**: Siapkan nilai `.env` untuk production (JWT Secret yang kuat, dll).
2.  **Build**: TypeScript harus dikompilasi ke JavaScript.

## Strategi 1: VPS (Ubuntu/Debian) dengan PM2

Ini adalah cara paling umum dan hemat biaya.

### 1. Setup Server

Pastikan Node.js dan NPM sudah terinstall di server.

### 2. Clone & Install

```bash
git clone https://github.com/username/repo-anda.git
cd repo-anda
npm install --production=false # Install devDependencies juga untuk build
```

### 3. Build Aplikasi

```bash
npm run build
```

Ini akan menghasilkan folder `dist/`.

### 4. Setup Konfigurasi Production

```bash
cp .env.example .env
nano .env # Isi dengan config production
```

### 5. Jalankan dengan PM2

Lapeh kini menyertakan konfigurasi otomatis PM2 (`ecosystem.config.js`).

1.  **Install PM2 Global**:

    ```bash
    npm install -g pm2
    ```

2.  **Jalankan Aplikasi**:

    ```bash
    pm2 start ecosystem.config.js
    ```

    Perintah ini akan:

    - Menjalankan aplikasi dalam mode **Cluster** (menggunakan semua core CPU yang tersedia).
    - Mengatur `NODE_ENV` ke `production`.
    - Mengaktifkan auto-restart jika aplikasi crash atau penggunaan memori melebihi 1GB.

3.  **Cek Status**:

    ```bash
    pm2 status
    pm2 logs
    ```

4.  **Simpan Config Startup (Agar jalan saat server reboot)**:
    ```bash
    pm2 save
    pm2 startup
    ```

### ❓ FAQ: Mengapa Aplikasi Saya Muncul Ganda di PM2?

Jika Anda menjalankan `pm2 list` dan melihat nama aplikasi Anda muncul lebih dari satu kali, **JANGAN KHAWATIR**. Ini adalah fitur, bukan bug.

- **Penyebab**: Konfigurasi `instances: "max"` dan `exec_mode: "cluster"` di `ecosystem.config.js`.
- **Fungsi**: PM2 mendeteksi jumlah inti CPU (Core) di VPS Anda dan membuat 1 proses worker untuk setiap core.
- **Keuntungan**: Aplikasi Anda menjadi **Multi-Threaded**.

**Cara mengubah ke Single Instance (Hemat RAM):**
Jika RAM server Anda terbatas, ubah `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "my-app",
      // ...
      instances: 1, // Ubah "max" menjadi 1
      // ...
    },
  ],
};
```

Lalu jalankan `pm2 reload ecosystem.config.js`.

### 7. Advanced: Menjalankan Beberapa Aplikasi (Multi-App)

Anda bisa menggabungkannya dalam satu file `ecosystem.config.js`.

### 8. Reverse Proxy (Nginx)

Jangan expose port 4000 langsung. Gunakan Nginx di depannya.
Config Nginx block:

```nginx
server {
    server_name api.domain-anda.com;
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Strategi 2: Docker (Container)

Lapeh sudah menyertakan `Dockerfile`.

**Dockerfile Minimal:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 4000
CMD ["npm", "run", "start:prod"]
```

**Deploy:**

```bash
docker build -t my-lapeh-app .
docker run -p 4000:4000 --env-file .env my-lapeh-app
```

## Strategi 3: PaaS (Railway / Render / Vercel)

Platform seperti Railway.app sangat mudah karena mendeteksi `package.json`.

1.  Push kode ke GitHub.
2.  Connect repo di Railway/Render.
3.  Set Environment Variables di dashboard mereka.
4.  Set **Build Command**: `npm run build`.
5.  Set **Start Command**: `npm run start:prod`.

## Checklist Keamanan Production

- [ ] `NODE_ENV=production` harus diset.
- [ ] `JWT_SECRET` harus panjang dan acak.
- [ ] Database credential (jika ada) harus aman.
- [ ] Rate Limiting aktif (default Lapeh sudah aktif).
- [ ] Gunakan HTTPS (SSL) via Nginx atau Cloudflare.
