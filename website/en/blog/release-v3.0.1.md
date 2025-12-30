---
title: Release v3.0.1 - CLI UX Improvements & Database-Agnostic Mode
date: 2025-12-30
author: Lapeh Team
description: Patch update v3.0.1 brings more interactive CLI animations, example module cleanup, and more flexible default database configuration.
---

# Release v3.0.1: User Experience & Flexibility Improvements

We are excited to announce the release of **Lapeh Framework v3.0.1**! This update focuses on refining the user experience when using the CLI and making the framework lighter and more flexible by default.

## What's New?

### 1. More Interactive CLI Animations 🚀

We have updated `lapeh-cli` to provide a better visual experience.

*   **Boot Animation**: ASCII "L" logo animation when starting project creation.
*   **Loading Spinners**: Informative loading indicators when installing dependencies or building, replacing overly verbose logs.
*   **Cleaner Output**: Cleaner terminal display focused on important information.

### 2. Database-Agnostic by Default 📦

Based on community feedback, we made Lapeh more "neutral" towards databases at initial installation.

*   **Database JSON**: By default, new projects now use `database.json` as temporary storage. This allows you to run and test APIs immediately without setting up SQL databases (PostgreSQL/MySQL) first.
*   **Zero-Config Start**: Just `create`, `dev`, and the API is ready to use with available dummy data.
*   **Config Cleanup**: `DATABASE_URL` variable removed from default `.env` to avoid confusion.

### 3. Example Module Cleanup 🧹

We removed the `Pets` module that previously existed as an example. Now new projects are cleaner, including only essential modules:
*   **Auth**: Registration, Login, Profile (with Redis caching).
*   **RBAC**: Integrated Role-Based Access Control.

### 4. Auth Performance Improvements ⚡

The `me` (Get Profile) function in the Auth module now uses **Redis Caching**. This significantly speeds up responses for user profile endpoints.

## How to Update

To create a new project with this version:

```bash
npx lapeh-cli@latest create my-new-app
```

For existing projects, you can update the `lapeh` dependency in `package.json` to `^3.0.1`.

Thank you for using Lapeh Framework!
