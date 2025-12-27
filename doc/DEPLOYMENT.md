# Deployment Guide

Panduan ini akan membantu Anda membawa aplikasi Lapeh dari `localhost` ke Server Production (VPS/Cloud).

## Persiapan Pra-Deploy

Sebelum deploy, pastikan:

1.  **Environment Variables**: Siapkan nilai `.env` untuk production (DB URL asli, JWT Secret yang kuat).
2.  **Build**: TypeScript harus dikompilasi ke JavaScript.

## Strategi 1: VPS (Ubuntu/Debian) dengan PM2

Ini adalah cara paling umum dan hemat biaya.

### 1. Setup Server

Pastikan Node.js, NPM, dan Database (PostgreSQL/MySQL) sudah terinstall di server.

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

### 4. Setup Database Production

```bash
# Setup .env dulu
cp .env.example .env
nano .env # Isi dengan config production

# Jalankan migrasi (Hanya deploy schema, jangan reset!)
npm run prisma:deploy
```

### 5. Jalankan dengan PM2

Gunakan PM2 agar aplikasi jalan di background dan auto-restart jika crash.

```bash
npm install -g pm2
npm run start:prod # Atau: pm2 start dist/src/index.js --name "api-lapeh"
```

### 6. Reverse Proxy (Nginx)

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

Lapeh sudah menyertakan `Dockerfile` (jika belum, buat sederhana saja).

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

**Catatan Khusus Vercel (Serverless):**
Lapeh didesain sebagai _Long-Running Server_ (Express). Deploy ke Vercel dimungkinkan tapi butuh wrapper serverless (seperti `vercel-express`). Untuk performa terbaik, disarankan menggunakan VPS atau Container (Railway/Fly.io).

## Checklist Keamanan Production

- [ ] `NODE_ENV=production` harus diset.
- [ ] `JWT_SECRET` harus panjang dan acak.
- [ ] Database tidak boleh terekspos ke publik (gunakan private network atau firewall).
- [ ] Rate Limiting aktif (default Lapeh sudah aktif).
- [ ] Gunakan HTTPS (SSL) via Nginx atau Cloudflare.
