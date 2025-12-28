# Features & Core Concepts

This document explains the key features of Lapeh Framework and how to use them in depth.

## 1. Data Validation (Simple & Powerful)

The framework provides a `Validator` utility inspired by expressive modern validation styles, using `zod` behind the scenes but with an API that is more string-based and readable.

**Location:** `@lapeh/utils/validator`

### Basic Usage

```typescript
import { Validator } from "@lapeh/utils/validator";

export async function createProduct(req: Request, res: Response) {
  const validator = await Validator.make(req.body, {
    name: "required|string|min:3",
    price: "required|number|min:1000",
    email: "required|email|unique:user,email", // Check unique in user table email column
    category_id: "required|exists:category,id", // Check exists in category table id column
    photo: "required|image|max:2048", // Validate file upload (Max 2MB)
  });

  if (validator.fails()) {
    return sendError(res, 400, "Validation failed", validator.errors());
  }

  const data = validator.validated();
  // Continue saving process...
}
```

### Available Rules

- `required`: Must be filled.
- `string`, `number`, `boolean`: Data type.
- `email`: Valid email format.
- `min:X`, `max:X`: String length or number value.
- `unique:table,column`: Ensure value does not exist in database (Async).
- `exists:table,column`: Ensure value exists in database (Async).
- `image`: File must be an image (jpg, png, webp, etc).
- `mimes:types`: File must be a specific type (e.g., `mimes:pdf,docx`).

## 2. High Performance Response (Fastify-Like)

For endpoints requiring high performance (e.g., large data lists), use schema-based serialization. This is much faster than standard Express `res.json`.

**Location:** `@/utils/response`, `@/core/serializer`

### Implementation Steps

1. **Define Output Schema**
   Match with the fields you want to show to the user.

   ```typescript
   const productSchema = {
     type: "object",
     properties: {
       id: { type: "string" }, // BigInt automatically becomes string
       name: { type: "string" },
       price: { type: "number" },
     },
   };
   ```

2. **Create Serializer (Cached)**
   Store outside the handler function so it compiles only once.

   ```typescript
   import { getSerializer, createResponseSchema } from "@/core/serializer";

   const productSerializer = getSerializer(
     "product-single",
     createResponseSchema(productSchema)
   );
   ```

3. **Send Response**

   ```typescript
   import { sendFastSuccess } from "@lapeh/utils/response";

   // Inside controller
   sendFastSuccess(res, 200, productSerializer, {
     status: "success",
     message: "Data retrieved",
     data: productData,
   });
   ```

## 3. Authentication & Authorization (RBAC)

The authentication system uses JWT (JSON Web Token) and supports Role-Based Access Control.

### Auth Middleware

- `requireAuth`: Ensures user is logged in (sends header `Authorization: Bearer <token>`).
- `requireAdmin`: Ensures user is logged in AND has role `admin` or `super_admin`.
