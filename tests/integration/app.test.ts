import request from "supertest";
import { createApp } from "../../lib/bootstrap";
import { Express } from "express";

describe("App Integration", () => {
  let app: Express;

  beforeAll(async () => {
    app = await createApp();
  });

  it("GET / should return health check", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "success");
    expect(res.body).toHaveProperty("message", "Lapeh API is running");
  });

  it("GET /unknown should return 404", async () => {
    const res = await request(app).get("/unknown");
    expect(res.status).toBe(404);
  });
});
