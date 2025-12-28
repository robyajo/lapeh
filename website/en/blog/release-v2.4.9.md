# Lapeh v2.4.9 Release: Smart Upgrade & Testing Suite
_Written on December 28, 2025 by robyajo_

We are back with an important update! **Lapeh v2.4.9** arrives with significant improvements to the CLI system and full support for application testing.

## What's New?

### 1. Smart Upgrade CLI (`npx lapeh upgrade`)

The CLI upgrade feature is now much smarter.

- **Full Synchronization**: When you run `npx lapeh upgrade`, the framework not only copies new files but also cleans up "junk" files that are no longer used by the framework.
- **Cleaner Projects**: The `bin` folder, which was previously copied to your project root, is now automatically removed as binary management is handled directly by the `lapeh` package.
- **Comparison**:
    - **Old**: Only overwrote files, leaving obsolete (dead) files piling up.
    - **New**: *Mirroring* framework structure. Obsolete files are removed, new files are added.

### 2. Integrated Testing Support

We heard your requests for better testing support.

- **Jest + Supertest**: Lapeh is now configured by default to support Jest.
- **Isolated Build**: The `tests` folder is now excluded from the build process (`dist/`), ensuring your production code remains lightweight and clean.
- **Path Alias**: Improved `@lapeh/*` import support within test files, making it easier to write unit and integration tests.

## How to Upgrade

To get all these features, run the following command in your project:

```bash
npx lapeh upgrade
```

This command will automatically update your project structure to the latest v2.4.9 standards.

Thank you for trusting Lapeh Framework as your application foundation. Happy coding!
