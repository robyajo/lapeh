# Getting Started

Welcome to the Lapeh Framework documentation! This guide will help you get started with a new project using Lapeh.

## Prerequisites

Before you begin, ensure you have installed:

- [Node.js](https://nodejs.org/) (version 18 or later)
- [npm](https://www.npmjs.com/) (usually installed with Node.js)

## Installation & Project Creation

You can create a new Lapeh project by running the following command in your terminal:

```bash
npx lapeh-cli@latest create my-app
```

Follow the prompts in the terminal to configure your project.

## Running the Project

Once the project is created, navigate to the project directory and start the development server:

```bash
cd my-app
npm run dev
```

The server will run at `http://localhost:3000` (or the port you configured).

## Login Testing (Default Credentials)

To facilitate development and initial testing, the project includes default user data in `database.json`. You can use the following credentials to test the login endpoint:

- **Email**: `sa@sa.com`
- **Password**: `password`

The login endpoint is typically available at:
`POST /api/v1/auth/login`

Use these credentials to obtain an Access Token and start exploring the API.

## Project Structure

Here is a brief overview of the Lapeh project structure:

- `src/modules`: Contains business logic (Controllers, Services).
- `src/routes`: API route definitions.
- `lib/core`: Framework core components.
- `database.json`: Temporary data storage (JSON-based).

Happy coding with Lapeh!
