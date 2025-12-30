---
title: "Rilis v3.0.5: Perbaikan Sistem Blog & Script Rilis"
date: 2025-12-30
author: Tim Lapeh
description: "Perbaikan kritis pada script release.js untuk menangani karakter spesial dalam frontmatter YAML."
---

# Rilis v3.0.5: Perbaikan Sistem Blog & Script Rilis

Rilis ini adalah perbaikan cepat (hotfix) untuk mengatasi masalah pada sistem otomatisasi blog kami.

## Apa yang Baru?

Kami menemukan bug di mana karakter spesial (seperti tanda kutip) dalam deskripsi commit Git dapat merusak format YAML frontmatter pada file blog yang digenerate otomatis, menyebabkan kegagalan build pada website dokumentasi.

### 🛠️ Perbaikan Bug

- **Fix YAML Escaping**: Memperbarui `release.js` untuk melakukan escaping yang benar pada `title` dan `description` di frontmatter blog.
- **Release Script Update**: Meningkatkan ketahanan script rilis terhadap berbagai format pesan commit.

## Cara Update

```bash
npm install lapeh@latest
```

Terima kasih telah menggunakan Lapeh Framework!
