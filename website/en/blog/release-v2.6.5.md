---
title: "Release v2.6.5: CLI Upgrade Fixes and MongoDB Support"
date: 2025-12-29
author: Lapeh Team
description: "Bug fixes for CLI upgrade command, dependency adjustments, and Prisma Client data type compatibility fixes for MongoDB."
tag: "Release"
---

# Release v2.6.5: CLI Upgrade Fixes and MongoDB Support

We just released **v2.6.5** which brings some important fixes for CLI stability and database compatibility.

## What's New?

### 1. `upgrade` CLI Command Fixes
We improved the logic in the `lapeh upgrade` command to handle `lapeh` dependency versions more smartly.
- If the project uses an npm version, `package.json` will be updated using caret versioning (e.g., `^2.6.5`).
- If the project uses a local version (development), it will keep using the file path.
- Fixed automatic `tsconfig.json` updates so `paths` alias `@lapeh/*` points to the correct `dist/lib` directory.

### 2. Prisma Client Compatibility (MongoDB)
In the transition to full MongoDB support using Prisma, we found some data type mismatches between `BigInt` (commonly used in SQL) and `String` (ObjectId in MongoDB).
- Changed all `BigInt` usage for IDs to `String` in Auth and RBAC controllers.
- Fixed seeding scripts to use the correct data types.
- Added RBAC models (roles, permissions, user_roles, etc.) that were missing from the main Prisma schema, so `prisma generate` now runs successfully without type errors.

### 3. Build Stability Improvements
This release also ensures the build process (`npm run build`) runs smoothly without TypeScript errors caused by incomplete Prisma model definitions.

## How to Update

To update your project to the latest version, run the following command in your project terminal:

```bash
npx lapeh upgrade
```

Or manually update `package.json`:

```json
"dependencies": {
  "lapeh": "^2.6.5"
}
```

Then run `npm install`.

Thank you for using Lapeh! If you find any issues, please report them on our GitHub repository.
