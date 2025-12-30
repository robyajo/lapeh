---
title: "Understanding Modular Project Structure in Lapeh Framework"
date: 2025-12-29
author: Lapeh Team
description: "A complete guide to understanding the directory structure changes in Lapeh Framework towards a more organized and scalable modular architecture."
tag: "Guide"
---

# Understanding Modular Project Structure in Lapeh Framework

As applications grow, managing hundreds of files in a single controller or model folder can become a nightmare. That's why starting from the latest version, Lapeh Framework adopts a **Modular Architecture** approach.

This article will discuss the directory structure changes and how this makes your application development neater and easier to manage.

## What is Modular Architecture?

Instead of separating files by _type_ (all controllers in `controllers/`, all models in `models/`), we now group files by **Feature**.

### Old Structure (Layered)

```bash
src/
  controllers/
    authController.ts
    productController.ts
  models/
    user.model.ts
    product.model.ts
```

If you wanted to change the "Product" feature, you had to jump between the `controllers` and `models` folders.

### New Structure (Modular)

```bash
src/
  modules/
    Auth/
      auth.controller.ts
      auth.model.ts
    Product/
      product.controller.ts
      product.model.ts
```

Now, everything related to "Auth" is in one place. This makes the code more:

1.  **Portable**: Easy to move or copy to other projects.
2.  **Maintainable**: You focus on one folder when working on one feature.
3.  **Scalable**: Different teams can work on different modules without file conflicts.

## Other Important Changes

### 1. `src/config/` Folder

We added a dedicated folder for static application configuration.

- `app.ts`: General configuration.
- `cors.ts`: CORS security settings.

### 2. Automatic Generator: `make-module`

Since the structure changed, the way to create new files also changed. We provide a new script:

```bash
npm run make-module FeatureName
```

This command will automatically create the `src/modules/FeatureName` folder complete with its controller and model template file.

### 3. CLI Telemetry & Tracking

We have also updated the tracking system in the admin dashboard. You can now see which Lapeh CLI versions are most used by the community, helping us prioritize version support.

## Conclusion

This change might feel big, but the goal is long-term convenience. With a modular structure, Lapeh Framework is ready to handle applications from small scale to enterprise.

Happy coding with the new structure! Don't forget to run `npx lapeh init` to see it in action.
