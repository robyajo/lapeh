import { visitorCounter } from "../../../../lib/middleware/visitor";
import { redis } from "../../../../lib/core/redis";

jest.mock("../../../../lib/core/redis", () => ({
  redis: {
    status: "ready",
    incr: jest.fn(),
    sadd: jest.fn(),
  },
}));

describe("Visitor Middleware", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      ip: "127.0.0.1",
      headers: {
        "user-agent": "Mozilla/5.0",
        cookie: "",
      },
      socket: {},
    };
    res = {
      cookie: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should set visitor cookies if missing", async () => {
    await visitorCounter(req, res, next);
    expect(res.cookie).toHaveBeenCalledWith(
      "visitor_id",
      expect.any(String),
      expect.any(Object)
    );
    expect(res.cookie).toHaveBeenCalledWith(
      "visitor_session_id",
      expect.any(String),
      expect.any(Object)
    );
    expect(next).toHaveBeenCalled();
  });

  it("should not set visitor cookies if present", async () => {
    req.headers.cookie = "visitor_id=123; visitor_session_id=456";
    await visitorCounter(req, res, next);
    expect(res.cookie).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should increment redis stats when redis is ready", async () => {
    // Explicitly set ready
    (redis as any).status = "ready";
    (redis.incr as jest.Mock).mockResolvedValue(1);
    (redis.sadd as jest.Mock).mockResolvedValue(1);

    await visitorCounter(req, res, next);

    expect(redis.incr).toHaveBeenCalled();
    expect(redis.sadd).toHaveBeenCalled();
  });

  it("should fallback to memory stats when redis is not ready", async () => {
    (redis as any).status = "connecting"; // Not ready

    await visitorCounter(req, res, next);

    // Redis methods should NOT be called
    expect(redis.incr).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
