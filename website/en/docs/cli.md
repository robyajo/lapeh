# CLI Tools & Scripts

Lapeh Framework comes with various CLI scripts to speed up the development process, ranging from code generation to database management.

All commands are executed using `npm run <command>` within a project, or `lapeh <command>` if installed globally.

> **Info:** Behind the scenes, these `npm run` scripts call the internal framework CLI (`lapeh`). You can also run these commands directly using `npx lapeh <command>` or by installing the CLI globally via `npm install -g lapeh@latest`.

## Core Commands

Main commands to run the application:

### 1. Initialize Project (`init`)
Creates a new project from scratch.

```bash
npx lapeh@latest init <project-name> [flags]
```

**Available Flags:**
- `--full`: Initialize with full setup (includes dummy users, roles, permissions).
- `--default`: Initialize with default configuration (PostgreSQL) skipping interactive prompts.
- `--y`: Alias for `--default`.

**Examples:**
```bash
# Interactive Mode
npx lapeh init my-app

# Full Setup (Recommended for learning)
npx lapeh init my-app --full

# Fast Setup (Default Postgres)
npx lapeh init my-app --y
```

### 2. Upgrade Framework (`upgrade`)
Upgrades the Lapeh framework to the latest version in your existing project.

```bash
npx lapeh upgrade
```
**Features:**
- Automatically updates `package.json` dependencies.
- Syncs core framework files while preserving your custom code.
- **Smart Dependency Handling**: Preserves local `file:` dependencies if you are developing the framework locally, otherwise updates to the latest npm version.

### 3. Development Server (`dev`)
Runs the server in development mode with hot-reload feature.

```bash
npm run dev
# or
npx lapeh dev
```

### 2. Production Server (`start`)
Runs the server in production mode (ensure it has been built).

```bash
npm run start
# or
npx lapeh start
```

### 3. Build Project (`build`)
Compiles TypeScript code to JavaScript in the `dist` folder.

```bash
npm run build
# or
npx lapeh build
```

## Code Generators

Use these commands to create boilerplate files automatically.

### 1. Create Complete Module (`make:module`)
Creates Controller, Route, and Model (Schema) at once.

```bash
npm run make:module <module-name>
```
**Example:** `npm run make:module Product`

Output:
- `src/controllers/productController.ts`
- `src/routes/product.ts`
- `src/models/product.prisma`

### 2. Create Controller (`make:controller`)
Only creates a controller file with basic CRUD methods.

```bash
npm run make:controller <controller-name>
```
**Example:** `npm run make:controller Order` (Will create `src/controllers/orderController.ts`)

### 3. Create Database Model (`make:model`)
Only creates a new Prisma schema file.

```bash
npm run make:model <model-name>
```
**Example:** `npm run make:model Transaction` (Will create `src/models/transaction.prisma`)

## Database Management (Prisma)

This framework uses a **Multi-File Schema** system. You don't edit `schema.prisma` directly, but instead edit small files in `src/models/*.prisma`.

### 1. Database Migration (`prisma:migrate`)
Run this every time you change a model definition in `src/models/*.prisma`.

```bash
npm run prisma:migrate
```
This command will:
1. Merge all `.prisma` files in `src/models/` into one `prisma/schema.prisma`.
2. Create SQL migration files.
3. Apply changes to the local database.
4. Regenerate Prisma Client (Type Definitions).

### 2. Deploy to Production (`prisma:deploy`)
Use in production server. Only applies existing migrations without resetting data.

```bash
npm run prisma:deploy
```

### 3. Database Studio (`db:studio`)
Opens a GUI in the browser to view and edit database data.

```bash
npm run db:studio
```
