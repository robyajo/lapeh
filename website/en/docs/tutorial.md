# Tutorial: Building a Library API

In this tutorial, we will build a simple "Book Management" feature using Lapeh Framework's core features:
1.  **CLI** for code generation.
2.  **Validator** for input validation.
3.  **Fast Serialization** for high-performance responses.

> **Note**: This tutorial uses an in-memory array for data storage to keep things simple. Lapeh v3.0.0 is database-agnostic, so you can easily swap this with Prisma, TypeORM, or any other DB library.

## Step 1: Generate Module (Controller & Route)

We will create a controller and route for our Book feature.

```bash
npm run make:module Book
```

The framework will generate:
- `src/controllers/bookController.ts`
- `src/routes/book.ts`

## Step 2: Implement Controller

Open `src/controllers/bookController.ts` and let's implement **Create** and **List** features.

### Setup Import & Data Store

```typescript
import { Request, Response } from "express";
import { sendFastSuccess, sendError } from "@/utils/response";
import { Validator } from "@/utils/validator";
import { getSerializer, createResponseSchema } from "@/core/serializer";

// Simple in-memory store
interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  stock: number;
}
const books: Book[] = [];

// 1. Define Output Schema (for Fastify Serialization)
const bookSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    author: { type: "string" },
    isbn: { type: "string" },
    stock: { type: "number" }
  }
};

// 2. Create Serializer
const bookDetailSerializer = getSerializer("book-detail", createResponseSchema(bookSchema));
const bookListSerializer = getSerializer("book-list", createResponseSchema({
  type: "array",
  items: bookSchema
}));
```

### Implement Create (with Validation)

```typescript
export async function createBook(req: Request, res: Response) {
  // 1. Validate Input
  const validator = await Validator.make(req.body, {
    title: "required|string|min:3",
    author: "required|string",
    isbn: "required|string",
    stock: "required|number|min:1"
  });

  if (validator.fails()) {
    return sendError(res, 400, "Validation Error", validator.errors());
  }

  // 2. Save Data (In-Memory)
  const newBook: Book = {
    id: Date.now().toString(),
    ...validator.validated()
  };
  books.push(newBook);

  // 3. Send Response (Serialized)
  return sendFastSuccess(res, bookDetailSerializer(newBook), 201);
}

export async function listBooks(req: Request, res: Response) {
  // Return all books
  return sendFastSuccess(res, bookListSerializer(books));
}
```

## Step 3: Register Route

Open `src/routes/book.ts`. The CLI has already generated the basic structure. We just need to connect it to our controller functions.

```typescript
import { Router } from "express";
import { createBook, listBooks } from "../controllers/bookController";

const router = Router();

router.post("/", createBook);
router.get("/", listBooks);

export default router;
```

## Step 4: Test Your API

Run the server:
```bash
npm run dev
```

Test with curl or Postman:

**Create Book:**
```bash
curl -X POST http://localhost:4000/api/book \
  -H "Content-Type: application/json" \
  -d '{"title":"Lapeh Guide", "author":"Team", "isbn":"12345", "stock":10}'
```

**List Books:**
```bash
curl http://localhost:4000/api/book
```

Congratulations! You have built a fast, validated API without getting bogged down in database configuration.
