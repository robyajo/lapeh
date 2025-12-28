import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Lapeh Framework",
  // Shared properties
  cleanUrls: true,
  ignoreDeadLinks: true,
  lastUpdated: true,
  sitemap: {
    hostname: "https://lapeh-doc.vercel.app",
  },

  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon-96x96.png",
        sizes: "96x96",
      },
    ],
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["link", { rel: "shortcut icon", href: "/favicon.ico" }],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    ["meta", { name: "apple-mobile-web-app-title", content: "Lapeh" }],
    ["meta", { name: "theme-color", content: "#3eaf7c" }],
    // SEO Standard
    [
      "meta",
      {
        name: "keywords",
        content:
          "Lapeh Framework, Node.js, Express, TypeScript, Backend, API, Boilerplate, Prisma, Javascript, Framework Indonesia",
      },
    ],
    ["meta", { name: "author", content: "robyajo" }],
    ["meta", { name: "robots", content: "index, follow" }],
    // Open Graph
    ["meta", { property: "og:site_name", content: "Lapeh Framework" }],
    ["meta", { property: "og:type", content: "website" }],
    [
      "meta",
      {
        property: "og:image",
        content: "https://lapeh-doc.vercel.app/ogimage.png",
      },
    ],
    // Twitter
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    [
      "meta",
      {
        name: "twitter:image",
        content: "https://lapeh-doc.vercel.app/ogimage.png",
      },
    ],
  ],

  // Locales Configuration
  locales: {
    root: {
      label: "Indonesia",
      lang: "id-ID",
      description:
        "Framework API Express yang siap pakai, cepat, dan terstandarisasi.",
      themeConfig: {
        nav: [
          { text: "Beranda", link: "/" },
          { text: "Panduan", link: "/docs/getting-started" },
          { text: "Blog", link: "/blog/" },
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
              { text: "Arsitektur", link: "/docs/architecture-guide" },
              { text: "Struktur Project", link: "/docs/structure" },
            ],
          },
          {
            text: "Panduan Utama",
            items: [
              {
                text: "Memulai (Getting Started)",
                link: "/docs/getting-started",
              },
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
        footer: {
          message: "Dirilis di bawah lisensi MIT.",
          copyright: "Copyright © 2025-sekarang robyajo",
        },
        docFooter: {
          prev: "Halaman Sebelumnya",
          next: "Halaman Selanjutnya",
        },
        outline: {
          label: "Di halaman ini",
        },
        search: {
          provider: "local",
          options: {
            locales: {
              root: {
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
          },
        },
      },
    },
    en: {
      label: "English",
      lang: "en-US",
      link: "/en/",
      description:
        "Ready-to-use, fast, and standardized Express API Framework.",
      themeConfig: {
        nav: [
          { text: "Home", link: "/en/" },
          { text: "Guide", link: "/en/docs/getting-started" },
          { text: "Blog", link: "/en/blog/" },
          { text: "Reference", link: "/en/docs/packages" },
          {
            text: "v2.4.6",
            items: [
              { text: "Changelog", link: "/en/docs/changelog" },
              { text: "Roadmap", link: "/en/docs/roadmap" },
            ],
          },
        ],
        sidebar: [
          {
            text: "Introduction",
            items: [
              { text: "What is Lapeh?", link: "/en/docs/introduction" },
              { text: "Key Features", link: "/en/docs/features" },
              { text: "Architecture", link: "/en/docs/architecture-guide" },
              { text: "Project Structure", link: "/en/docs/structure" },
            ],
          },
          {
            text: "Core Guides",
            items: [
              { text: "Getting Started", link: "/en/docs/getting-started" },
              { text: "Full Tutorial", link: "/en/docs/tutorial" },
              { text: "CLI Command", link: "/en/docs/cli" },
              { text: "Deployment (VPS/PM2)", link: "/en/docs/deployment" },
            ],
          },
          {
            text: "Advanced Topics",
            items: [
              { text: "Security", link: "/en/docs/security" },
              { text: "Performance", link: "/en/docs/performance" },
              { text: "Cheatsheet", link: "/en/docs/cheatsheet" },
              { text: "Packages & Libraries", link: "/en/docs/packages" },
            ],
          },
          {
            text: "Community",
            items: [
              { text: "Contributing", link: "/en/docs/contributing" },
              { text: "FAQ", link: "/en/docs/faq" },
              { text: "Changelog", link: "/en/docs/changelog" },
              { text: "Roadmap", link: "/en/docs/roadmap" },
            ],
          },
        ],
        footer: {
          message: "Released under the MIT License.",
          copyright: "Copyright © 2025-present robyajo",
        },
        docFooter: {
          prev: "Previous Page",
          next: "Next Page",
        },
        outline: {
          label: "On this page",
        },
      },
    },
  },

  themeConfig: {
    logo: "/logo.png",
    socialLinks: [{ icon: "github", link: "https://github.com/robyajo/lapeh" }],
    search: {
      provider: "local",
    },
    editLink: {
      pattern: "https://github.com/robyajo/lapeh/edit/main/doc/:path",
      text: "Edit page on GitHub",
    },
  },
});
