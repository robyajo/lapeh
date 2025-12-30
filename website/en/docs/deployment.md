# Deployment Guide

This guide will help you deploy your Lapeh application from `localhost` to a Production Server (VPS/Cloud).

## Pre-Deployment Preparation

Before deploying, ensure:

1.  **Environment Variables**: Prepare `.env` values for production (Strong JWT Secret, etc.).
2.  **Build**: TypeScript must be compiled to JavaScript.

## Strategy 1: VPS (Ubuntu/Debian) with PM2

This is the most common and cost-effective way.

### 1. Setup Server

Ensure Node.js and NPM are installed on the server.

### 2. Clone & Install

```bash
git clone https://github.com/username/your-repo.git
cd your-repo
npm install --production=false # Install devDependencies for build
```

### 3. Build Application

```bash
npm run build
```

This will generate a `dist/` folder.

### 4. Setup Production Config

```bash
cp .env.example .env
nano .env # Fill with production config
```

### 5. Run with PM2

Lapeh includes an automatic PM2 configuration (`ecosystem.config.js`).

1.  **Install PM2 Global**:

    ```bash
    npm install -g pm2
    ```

2.  **Run Application**:

    ```bash
    pm2 start ecosystem.config.js
    ```

    This command will:

    - Run the application in **Cluster** mode (using all available CPU cores).
    - Set `NODE_ENV` to `production`.
    - Enable auto-restart if the app crashes or memory usage exceeds 1GB.

3.  **Check Status**:

    ```bash
    pm2 status
    pm2 logs
    ```

4.  **Save Startup Config (To run on reboot)**:
    ```bash
    pm2 save
    pm2 startup
    ```

### ❓ FAQ: Why Does My App Appear Multiple Times in PM2?

If you run `pm2 list` and see your app name appear multiple times, **DON'T WORRY**. This is a feature, not a bug.

- **Cause**: `instances: "max"` and `exec_mode: "cluster"` configuration in `ecosystem.config.js`.
- **Function**: PM2 detects the number of CPU cores on your VPS and creates 1 worker process for each core.
- **Benefit**: Your application becomes **Multi-Threaded**. Requests are distributed evenly across all processes, improving performance.

**How to change to Single Instance (Save RAM):**
If your server RAM is limited (e.g., 512MB/1GB), modify `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "my-app",
      // ...
      instances: 1, // Change "max" to 1
      // ...
    },
  ],
};
```

Then run `pm2 reload ecosystem.config.js`.

### 7. Advanced: Running Multiple Apps (Multi-App)

You can combine multiple Node.js apps in one `ecosystem.config.js`.

### 8. Reverse Proxy (Nginx)

Do not expose port 8000 directly. Use Nginx in front of it.
Nginx block config:

```nginx
server {
    server_name api.your-domain.com;
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Strategy 2: Docker (Container)

Lapeh includes a `Dockerfile`.

**Minimal Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8000
CMD ["npm", "run", "start:prod"]
```

**Deploy:**

```bash
docker build -t my-lapeh-app .
docker run -p 8000:8000 --env-file .env my-lapeh-app
```

## Strategy 3: PaaS (Railway / Render / Vercel)

Platforms like Railway.app are very easy as they detect `package.json`.

1.  Push code to GitHub.
2.  Connect repo on Railway/Render.
3.  Set Environment Variables in their dashboard.
4.  Set **Build Command**: `npm run build`.
5.  Set **Start Command**: `npm run start:prod`.

## Production Security Checklist

- [ ] `NODE_ENV=production` must be set.
- [ ] `JWT_SECRET` must be long and random.
- [ ] Database credentials (if used) must be secure.
- [ ] Rate Limiting active (Lapeh default is active).
- [ ] Use HTTPS (SSL) via Nginx or Cloudflare.
