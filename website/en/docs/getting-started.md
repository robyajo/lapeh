# Getting Started

## Introduction

Lapeh Framework is a tool designed to speed up backend development with Node.js. By combining **Express.js** and **Prisma ORM**, Lapeh provides a standardized structure so you don't have to start from scratch.

### Prerequisites

Before starting, make sure you have installed:

- **Node.js** (version 18 or newer)
- **npm** or **yarn** or **pnpm**
- **Git**

## Installation

### 1. Create New Project

The easiest way to start is using our CLI. Open your terminal and run:

```bash
npx lapeh@latest my-project
```

Follow the instructions on the screen:
1. Select **Standard Project**.
2. Wait for the dependency installation process to finish.

### 2. Database Configuration

Lapeh uses Prisma ORM. Configure your database connection in the `.env` file:

```env
DATABASE_URL="mysql://root:password@localhost:3306/my_database"
```

Then generate the Prisma client:

```bash
npm run prisma:generate
```

### 3. Run Development Server

```bash
npm run dev
```

The server will run at `http://localhost:3000`.

## Next Steps

- [Learn Project Structure](./structure)
- [Follow Complete Tutorial](./tutorial)
- [Deployment Guide](./deployment)
