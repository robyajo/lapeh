# Changelog

All notable changes to this project will be documented in this file.

## [2.6.0] - 2025-12-29

### Added
- **Modular Architecture**: Adopted a module-based structure similar to NestJS.
  - Controllers, Services, and Prisma models are now grouped in `src/modules/<ModuleName>`.
  - Added `src/config` for centralized configuration (CORS, App settings).
- **CLI Commands**:
  - Added `make:modul` (or `make:module`) to generate a full module structure (Controller, Route, Service, Prisma Model).
  - Added interactive prompts in `npx lapeh-cli init` for ORM selection (Yes/No) and Database configuration (Postgres/MySQL).
- **Prisma v7 Support**:
  - Upgraded to Prisma v7.2.0.
  - Added `prisma.config.ts` for modern Prisma configuration.
  - Updated `compile-schema.js` to support new module structure.
- **Telemetry**: Added basic telemetry to track CLI usage and crash reports.

### Changed
- **Folder Structure**: Cleaned up `src` root. `src/controllers` and `src/models` are deprecated in favor of `src/modules`.
- **Database**: `DATABASE_URL` is now dynamically configured during init.
- **Dependencies**: Updated `@prisma/client` and `prisma` to `7.2.0`.

### Removed
- Removed `make:controller` and `make:model` commands (replaced by `make:module`).
