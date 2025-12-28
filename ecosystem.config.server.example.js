module.exports = {
  apps: [
    // 1. BACKEND: API MERN NEWS (Existing)
    {
      name: "api-mern-news",
      cwd: "/var/www/html/node/api-mern-news",
      script: "dist/src/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    },

    // 2. FRONTEND: WEB MERN NEWS (Existing)
    {
      name: "web-mern-news",
      cwd: "/var/www/html/node/web-mern-news",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      }
    },

    // 3. BACKEND: API TES (Lapeh Framework) - UPDATED
    {
      name: "api-tes-lapeh-web-id",
      cwd: "/var/www/html/node/api-tes-lapeh-web-id",
      
      // Menggunakan binary Lapeh dari node_modules
      script: "./node_modules/lapeh/bin/index.js",
      
      // Argument 'start' untuk menjalankan mode produksi
      args: "start",
      
      // Mode Cluster untuk performa maksimal (menggunakan semua Core CPU)
      // CATATAN: Jika muncul 2 (atau lebih) di 'pm2 list', itu NORMAL karena VPS Anda memiliki multi-core CPU.
      // Ubah ke angka 1 jika ingin memaksa hanya 1 proses saja.
      instances: "max",
      exec_mode: "cluster",
      
      // Restart otomatis jika penggunaan memori berlebih
      max_memory_restart: '1G',
      
      // Jangan watch di production
      watch: false,
      
      env: {
        NODE_ENV: "production",
        PORT: 8001 // Port sesuai request Anda
      }
    }
  ]
};
