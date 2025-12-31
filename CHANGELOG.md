# Changelog

All notable Update changes to this project will be documented in this file.

## [3.0.7] - 2025-12-30 - Documentation & CLI Update

### 📚 Documentation

- **Project Structure Guide**: Comprehensive update to `STRUCTURE.md` to accurately reflect the No-ORM architecture and Core folder separation.
- **Scripts Documentation**: Added detailed explanation for `release.js` and `make-module.js` automation scripts.

### 🛠️ CLI Improvements

- **Cleanup**: Improved `init` and `upgrade` commands to better handle legacy configuration files.

## [3.0.0] - 2025-12-30 - Major Release (No-ORM)

### 💥 Breaking Changes

- **No-ORM Architecture**: Lapeh Framework v3.0.0 fully removes the built-in Prisma ORM integration.
  - Users are now free to choose any database library (Prisma, TypeORM, Drizzle, Kysely, or raw SQL).
  - Removed `prisma` folder and related scripts (`compile-schema.js`).
  - Removed `npx lapeh make:model` and `prisma:migrate` commands.
  - `npx lapeh init` no longer asks for database configuration.

### 🚀 New Features

- **Simplified Project Structure**: Cleaner project root without ORM configuration files.
- **Enhanced CLI**: Streamlined `init` process for faster project bootstrapping.
- **Improved Performance**: Reduced startup time and dependencies size.

### 🛠️ Maintenance

- **Dependency Cleanup**: Removed `@prisma/client` and `prisma` from default dependencies.
- **Documentation Update**: Comprehensive update to all documentation to reflect the No-ORM approach.

---

### Fixed

- **CLI**: Fixed `tsconfig.build.json` not being included in the published package, causing `lapeh build` to fail in generated projects.
- **Prisma**: Updated seed command to use `tsconfig-paths/register` to support path aliases in `prisma/seed.ts`.

## ⚠️ Deprecated Versions (v1.x - v2.x)

All versions prior to v3.0.0 are considered deprecated. Please refer to `doc/en/CHANGELOG.md` for historical changes.
