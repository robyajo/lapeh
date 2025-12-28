# Getting Started with Lapeh Framework

Welcome to the official documentation for **Lapeh Framework**. This guide will help you get started with installation, configuration, and understanding the basic project structure.

## System Requirements

Before you begin, ensure your system meets the following requirements:

- **Node.js**: Version 18.x or newer.
- **Database**: PostgreSQL (Recommended) or MySQL/MariaDB.
- **Package Manager**: NPM (bundled with Node.js).

## Installation

The easiest way to start is by using the `npx` CLI generator.

### 1. Create a New Project

Run the following command in your terminal:

```bash
# Standard Interactive Setup
npx lapeh@latest init your-project-name
```

**Alternative Quick Setup Flags:**

- **Full Setup** (Includes dummy data, recommended for learning):
  ```bash
  npx lapeh@latest init your-project-name --full
  ```

- **Default Setup** (Skips questions, uses PostgreSQL):
  ```bash
  npx lapeh@latest init your-project-name --y
  ```

### 2. Initial Setup

Once the project is created, navigate into the project directory and run the setup wizard:

```bash
cd your-project-name
npm run first
```

This script will automatically perform the following:

1.  Copy `.env.example` to `.env`.
2.  Install all dependencies (`npm install`).
3.  Generate a secure **JWT Secret**.
4.  Run database migrations (create tables).
5.  Run the seeder (populate initial data).

### 3. Run Development Server

```bash
npm run dev
```

The server will run at `http://localhost:4000` (or the port specified in `.env`).

## Directory Structure

Here is the standard folder structure of Lapeh Framework:

```
my-app/
├── bin/                  # CLI scripts for npx
├── doc/                  # Project documentation
├── prisma/               # Database Configuration & Schema
│   ├── migrations/       # Database migration history files
│   ├── base.prisma.template # Database configuration template
│   ├── schema.prisma     # Combined schema file (Auto-generated)
│   └── seed.ts           # Script for populating initial data
├── scripts/              # Utility scripts (Generator, Compiler)
├── src/                  # Main application source code
│   ├── controllers/      # Business logic (Request handlers)
│   ├── core/             # Core configuration (DB, Redis, Server)
│   ├── middleware/       # Express Middleware (Auth, RateLimit)
│   ├── models/           # Prisma Schema definitions per feature
│   ├── routes/           # API routing definitions
│   ├── utils/            # Helper functions (Response, Validator)
│   └── index.ts          # Application entry point
├── .env                  # Environment variables (Secrets)
├── package.json          # NPM Dependencies & Scripts
└── tsconfig.json         # TypeScript Configuration
```

## Environment Configuration (.env)

The `.env` file stores important configurations. Here are the key variables:

```ini
# Server
PORT=4000
NODE_ENV=development

# Database (Change according to your credentials)
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# Security
JWT_SECRET="super-long-and-random-secret"
ACCESS_TOKEN_EXPIRES_IN=3600 # 1 hour

# Redis (Optional - automatically mocked if absent)
REDIS_URL="redis://localhost:6379"
```
