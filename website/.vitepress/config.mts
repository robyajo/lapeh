import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Lapeh Framework",
  description:
    "Framework API Express yang siap pakai, cepat, dan terstandarisasi.",
  lang: "id-ID",
  cleanUrls: true,

  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "theme-color", content: "#3eaf7c" }],
  ],

  themeConfig: {
    logo: "/logo.png", // Anda bisa menambahkan logo nanti
    siteTitle: "Lapeh Framework",

    nav: [
      { text: "Beranda", link: "/" },
      { text: "Panduan", link: "/docs/getting-started" },
      { text: "Referensi", link: "/docs/packages" },
      {
        text: "v2.4.6",
        items: [
          { text: "Changelog", link: "/docs/changelog" },
          { text: "Roadmap", link: "/docs/roadmap" },
        ],
      },
    ],

    sidebar: [
      {
        text: "Pengenalan",
        items: [
          { text: "Apa itu Lapeh?", link: "/docs/introduction" },
          { text: "Fitur Utama", link: "/docs/features" },
          { text: "Arsitektur", link: "/docs/architecture_guide" },
          { text: "Struktur Project", link: "/docs/structure" },
        ],
      },
      {
        text: "Panduan Utama",
        items: [
          { text: "Memulai (Getting Started)", link: "/docs/getting_started" },
          { text: "Tutorial Lengkap", link: "/docs/tutorial" },
          { text: "CLI Command", link: "/docs/cli" },
          { text: "Deployment (VPS/PM2)", link: "/docs/deployment" },
        ],
      },
      {
        text: "Topik Lanjutan",
        items: [
          { text: "Keamanan (Security)", link: "/docs/security" },
          { text: "Performa", link: "/docs/performance" },
          { text: "Cheatsheet", link: "/docs/cheatsheet" },
          { text: "Paket & Library", link: "/docs/packages" },
        ],
      },
      {
        text: "Komunitas",
        items: [
          { text: "Kontribusi", link: "/docs/contributing" },
          { text: "FAQ", link: "/docs/faq" },
          { text: "Changelog", link: "/docs/changelog" },
          { text: "Roadmap", link: "/docs/roadmap" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/robyajo/lapeh" }],

    footer: {
      message: "Dirilis di bawah lisensi MIT.",
      copyright: "Copyright © 2025-sekarang Roby Karti S",
    },

    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "Cari dokumentasi",
            buttonAriaLabel: "Cari dokumentasi",
          },
          modal: {
            noResultsText: "Tidak ada hasil untuk",
            resetButtonTitle: "Reset pencarian",
            footer: {
              selectText: "untuk memilih",
              navigateText: "untuk navigasi",
            },
          },
        },
      },
    },

    editLink: {
      pattern: "https://github.com/robyajo/lapeh/edit/main/doc/:path",
      text: "Edit halaman ini di GitHub",
    },

    docFooter: {
      prev: "Halaman Sebelumnya",
      next: "Halaman Selanjutnya",
    },

    outline: {
      label: "Di halaman ini",
      level: [2, 3],
    },
  },
});
