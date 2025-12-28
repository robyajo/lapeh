# Lapeh v2.4.11 Release: Multi-Database Support & Clean Architecture

_Written on December 28, 2025 by robyajo_

A productive weekend indeed! We are proud to release **Lapeh v2.4.11**, bringing database flexibility to the next level and ensuring the package you install is much cleaner and lighter.

## What's New?

### 1. Multi-Database Support (CLI)

Previously, Lapeh focused heavily on PostgreSQL. Now, we give you full freedom to choose your favorite database right at project initialization.

- **MongoDB & MySQL**: Now fully supported as first-class citizens in Lapeh.
- **Smart Automation**:
  - `npx lapeh init my-project --db-type=mongo` will configure the project specifically for MongoDB.
  - Migration logic adapts automatically: `prisma db push` for MongoDB (due to flexible schema) and `prisma migrate dev` for SQL databases.
  - Connection strings (`DATABASE_URL`) are generated automatically based on the selected provider.

### 2. Clean Architecture & Package

We performed a major "cleanup" on the Lapeh distribution package on NPM.

- **Lighter Package**: Development residue files (`test-local-run`, `init`, etc.) are removed from the public package.
- **Clear Licensing**: The `LICENSE` (MIT) file is now explicitly included in the package, providing legal certainty for commercial and open-source usage.
- **Stability**: Improvements to the database provider replacement regex ensure your `schema.prisma` template is always valid, regardless of the database you choose.

### 3. Documentation & Website

- **Admin Dashboard**: We've started laying the groundwork for the upcoming Admin Dashboard documentation.
- **Telemetry Simulation**: Added tools for better documentation website development.

## How to Upgrade

For new users, simply run:

```bash
npx lapeh init my-project
```

For existing users who want to try new features (especially if considering a database migration), we recommend creating a new project to inspect the new database configuration structure, then migrating your logic code.

Thank you for being part of the Lapeh Framework journey!
