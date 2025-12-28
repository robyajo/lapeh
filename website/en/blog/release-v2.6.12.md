---
title: "Release v2.6.12: Critical CLI Init & Prisma Client Fixes"
date: 2025-12-29
author: Lapeh Team
description: "Bug fixes for the CLI init command causing Prisma Client errors during seeding, and a revert to Prisma v6 for Windows stability."
tag: "Release"
---

# Release v2.6.12: Critical CLI Init & Prisma Client Fixes

We are releasing **v2.6.12** as a hotfix patch to address several critical issues found in previous releases, specifically regarding the `init` command and Prisma compatibility on Windows environments.

## What's Fixed?

### 1. CLI `init` and Seeding Fixes
Users previously reported a `MODULE_NOT_FOUND` error regarding `.prisma/client/default` when the automatic database seeding process ran.
- **Solution**: We added an explicit `npx prisma generate` step before the seeding process starts within the `init` flow. This ensures the Prisma Client is fully available before being used by the seed script.

### 2. Project Name Parsing
There was a bug where the command `npx lapeh init project-name` would sometimes incorrectly interpret the word `init` as the project name itself.
- **Solution**: The argument parsing logic has been corrected to ignore the `init` or `create` commands when determining the target folder name.

### 3. Revert to Prisma v6 (Windows Stability)
The upgrade to Prisma v7 in the previous release caused a `PrismaClientConstructorValidationError` ("engine type client") error on some Windows development environments.
- **Solution**: We have reverted the default dependencies to **Prisma v6** (`^6.0.0`) and removed the `prisma.config.ts` file. Generated projects now return to using the standard `schema.prisma` configuration with `url = env("DATABASE_URL")`, which is more stable and widely compatible.

### 4. Peer Dependencies Cleanup
We removed `peerDependencies` from the `package.json` of generated projects. This was done to prevent unnecessary package manager warnings and conflicts for end users.

## How to Update

For new users, simply run the `init` command as usual, and you will automatically get the latest version:

```bash
npx lapeh init your-project-name
```

For existing projects experiencing the issues above, you can manually update your `package.json` to use `lapeh` version `^2.6.12` and `prisma` version `^6.0.0`.

Thank you for your bug reports and support!
