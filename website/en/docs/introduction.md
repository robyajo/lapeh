# Introduction to Lapeh Framework

## What is Lapeh?

**Lapeh** is a Backend Framework for Node.js built on top of **Express** and **TypeScript**.

If you have ever used other modern frameworks, you will feel very familiar. Lapeh adopts the philosophy of ease-of-use & clean structure, while maintaining the flexibility and speed of Express.

The name "Lapeh" comes from the Minang language which means "Loose" or "Free", symbolizing the freedom for developers to build applications quickly without being burdened by complicated configurations.

## Why was Lapeh Created?

In the Node.js ecosystem, developers often experience "Decision Fatigue":

- "Which ORM to use? Prisma, TypeORM, or Drizzle?"
- "Validation using Joi, Zod, or express-validator?"
- "How about the folder structure? MVC? Clean Architecture?"
- "How to handle Auth?"

Lapeh answers all of that with **Opinionated Defaults**:

1.  **Database**: Agnostic (Free choice: Prisma, TypeORM, Drizzle, etc).
2.  **Validation**: Zod (Powerful and readable schema validation).
3.  **Structure**: Modular MVC (Controller, Model, Route separated but cohesive).
4.  **Auth**: Ready-to-use JWT + RBAC (Role Based Access Control).

## Comparison with Other Frameworks

| Feature            | Express (Raw)                 | NestJS                           | Lapeh Framework                        |
| :----------------- | :---------------------------- | :------------------------------- | :------------------------------------- |
| **Learning Curve** | Low (but confusing structure) | High (Angular-style, Decorators) | **Medium** (Express + Clear Structure) |
| **Boilerplate**    | Empty                         | Very Heavy                       | **Just Right (Ready to use)**          |
| **Type Safety**    | Manual                        | Strict                           | **Strict (Native TypeScript)**         |
| **Dev Speed**      | Slow (manual setup)           | Medium                           | **Fast (CLI Generator)**               |
| **Flexibility**    | Very High                     | Rigid                            | **High**                               |

## "The Lapeh Way" Philosophy

1.  **Developer Experience (DX) First**: CLI tools, clear error messages, and hot-reload are priorities.
2.  **Performance by Default**: Fast JSON serialization (Fastify-style) and integrated Redis caching.
3.  **Explicit is Better than Implicit**: No "magic" that is too dark. Your controller code is standard Express code that you understand.
4.  **Production Ready**: Security (Helmet, Rate Limit) and Scalability (Docker, Cluster) are not afterthoughts, but built-in.

## Request Lifecycle

How does Lapeh handle a single request from a user?

1.  **Incoming Request** (`GET /api/users`)
2.  **Security Middleware**: Helmet (Headers), CORS, Rate Limiter.
3.  **Global Middleware**: Request Logger, Body Parser (JSON).
4.  **Routing**: Matching URL in `src/routes/`.
5.  **Auth Middleware** (Optional): Check JWT token & Role.
6.  **Validator** (Optional): Validate body/query input.
7.  **Controller**: Main business logic executed.
    - Call Database (via `db` adapter).
    - Call Cache (Redis).
8.  **Serializer**: Data formatted & sanitized (e.g., hide password).
9.  **Response**: JSON sent back to user.

---

**Next:** Learn about the folder structure in [Project Structure](structure.md).
