# Project Structure Breakdown

To fully understand Lapeh Framework, you need to know what each file and folder does. Here is a complete "Tour" of the project directory.

## Root Directory

| File/Folder          | Description                                                                    |
| :------------------- | :----------------------------------------------------------------------------- |
| `bin/`               | Contains execution scripts for CLI (`npx lapeh`). You rarely touch this.       |
| `doc/`               | Project documentation resides here.                                            |
| `lib/`               | **Framework Core**. Internal parts of the framework you rarely touch.          |
| `prisma/`            | The heart of Database configuration.                                           |
| `scripts/`           | Collection of Node.js utility scripts (generators, schema compilers, etc).     |
| `src/`               | **Main Source Code**. 99% of your coding happens here.                         |
| `.env`               | Secret variables (Database URL, API Keys). **Do not commit this file to Git!** |
| `docker-compose.yml` | Docker configuration for running local Database & Redis.                       |
| `nodemon.json`       | Auto-restart configuration during development.                                 |
| `package.json`       | List of libraries (dependencies) and commands (`npm run ...`).                 |
| `tsconfig.json`      | TypeScript configuration.                                                      |

## `src/` Folder (Source Code - User Space)

This is where you work every day.

### `src/controllers/`

Contains application logic. Controllers receive Requests, process them, and return Responses.

- **Example**: `authController.ts` handles login/register.
- **Tip**: Do not put overly complex _business logic_ here. Use Services (optional) if the controller gets too fat.

### `src/models/`

Contains database table definitions (Prisma Schema).

- **Unique in Lapeh**: We break down the large `schema.prisma` into small files per feature (e.g., `user.prisma`, `product.prisma`) for easier management. The `prisma:migrate` script will merge them later.

### `src/routes/`

Defines endpoint URLs.

- Connects URLs (e.g., `/api/login`) to functions in Controllers.
- Attaches Middleware (e.g., `requireAuth`).

## `lib/` Folder (Framework Internals)

This part is similar to `node_modules` or the `.next` folder in Next.js. This is the framework engine.

### `lib/core/`

The "Engine" part of the framework.

- `server.ts`: Express App setup.
- `database.ts`: Prisma Client instance.
- `redis.ts`: Redis connection.
- `serializer.ts`: JSON Schema caching logic.

### `lib/middleware/`

Built-in framework middleware.

- `auth.ts`: Check JWT Token.
- `rateLimit.ts`: Limit request count.
- `requestLogger.ts`: Log every incoming request.

### `lib/utils/`

Built-in Helper functions.

- `validator.ts`: Laravel-style input validation.
- `response.ts`: Standard JSON response format (`sendFastSuccess`, `sendError`).
- `logger.ts`: Logging system (Winston).

## `prisma/` Folder

- `migrations/`: Database change history (SQL files). Do not edit manually.
- `base.prisma.template`: Header of the database schema (contains db datasource config).
- `seed.ts`: Script for populating initial data (Data Seeding).

## `scripts/` Folder

"Magic" scripts executed by `npm run`.

- `make-controller.js`: Controller generator.
- `compile-schema.js`: `.prisma` file merger.
- `init-project.js`: Initial setup wizard.

---

By understanding this structure, you won't get lost when adding new features or debugging.
