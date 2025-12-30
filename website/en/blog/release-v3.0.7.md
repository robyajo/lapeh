---
title: "Release v3.0.7: Project Structure Guide Update"
date: 2025-12-30
author: Lapeh Team
description: "Comprehensive update to project structure documentation to reflect No-ORM architecture and Core folder introduction."
tag: "Release"
---

# Release v3.0.7: Project Structure Guide Update

We are excited to announce the release of **Lapeh Framework v3.0.7**! The main focus of this release is aligning the documentation with the massive architectural changes introduced in v3.0.0.

## What's New?

### 1. 📚 Project Structure Guide (STRUCTURE.md) Updated

We realized that the shift to **No-ORM** architecture changed a lot of things in the folder structure. In this version, we have updated the [Project Structure Guide](/docs/structure) to be 100% accurate.

Key points in the new guide:

- **Clear Separation**: Explicit explanation of **`src/`** folder (User Space - where you work) vs **`lib/`** (Framework Core - Lapeh engine).
- **Prisma Removal**: Documentation no longer confuses users with references to the deleted `prisma/` folder.
- **Visual Navigation**: Added an iconic table to help you understand the function of each folder at a glance.

### 2. 🤖 Scripts & Automation Documentation

Lapeh v3 comes with powerful automation scripts in the `scripts/` folder. We have added complete documentation on:

- **`release.js`**: The "magic" script that handles versioning, automatic changelogs from Git commits, and documentation synchronization to the website.
- **`make-module.js`**: How to quickly create new features with a neat modular structure.

### 3. 🛠️ CLI & Core Improvements

In addition to documentation, this release also includes internal CLI cleanup to ensure `init` and `upgrade` processes run smoother without leaving old configuration file residues.

## How to Update

To get the latest local documentation and CLI fixes, run:

```bash
npm install lapeh@latest
```

Or if you are starting a new project:

```bash
npx lapeh init my-project
```

Thank you for choosing Lapeh Framework! Documentation clarity is our priority so you can code faster. 🚀
