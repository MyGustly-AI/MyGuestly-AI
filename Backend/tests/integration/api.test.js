import { jest } from "@jest/globals";
import request from "supertest";

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  },
  event: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  guest: { findMany: jest.fn(), count: jest.fn() },
  invitation: { groupBy: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  checkIn: { findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn(), create: jest.fn() },
  qrCode: { findUnique: jest.fn(), create: jest.fn() },
  media: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  comment: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn(), findUnique: jest.fn() },
  like: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn(), count: jest.fn() },
  memory: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  notification: { findMany: jest.fn(), create: jest.fn(), updateMany: jest.fn(), count: jest.fn() },
  feedback: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
  $on: jest.fn(),
  $use: jest.fn(),
  $queryRaw: jest.fn().mockResolvedValue([{ "1": 1 }]),
  $transaction: jest.fn((cb) => cb(mockPrisma)),
};

jest.unstable_mockModule("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  default: { PrismaClient: jest.fn(() => mockPrisma) },
}));

jest.unstable_mockModule("ioredis", () => ({
  default: class Redis {
    constructor() {
      this.get = jest.fn().mockResolvedValue(null);
      this.set = jest.fn().mockResolvedValue("OK");
      this.del = jest.fn().mockResolvedValue(1);
      this.expire = jest.fn().mockResolvedValue(1);
      this.ping = jest.fn().mockResolvedValue("PONG");
      this.call = jest.fn().mockImplementation((cmd, ...args) => {
        if (cmd === "INCR" || cmd === "incr") return Promise.resolve(1);
        return Promise.resolve(null);
      });
      this.on = jest.fn();
      this.quit = jest.fn().mockResolvedValue("OK");
      this.status = "ready";
    }
  },
}));

jest.unstable_mockModule("rate-limit-redis", () => ({
  RedisStore: class MockRedisStore {
    constructor() {
      this.hits = new Map();
    }
    async increment(key) {
      const current = this.hits.get(key) || 0;
      this.hits.set(key, current + 1);
      return { totalHits: current + 1, resetTime: new Date(Date.now() + 900000) };
    }
    async decrement(key) {
      const current = this.hits.get(key) || 0;
      if (current > 0) this.hits.set(key, current - 1);
    }
    async resetKey(key) {
      this.hits.delete(key);
    }
    init() {
      return Promise.resolve();
    }
  },
}));

let app;

beforeAll(async () => {
  app = (await import("../../src/app.js")).default;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/v1/health", () => {
  it("should return OK", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
  });
});

describe("GET /api/v1/health/deep", () => {
  it("should return deep health status", async () => {
    const res = await request(app).get("/api/v1/health/deep");
    expect(res.status).toBe(200);
    expect(res.body.services).toHaveProperty("redis");
    expect(res.body.services).toHaveProperty("database");
    expect(res.body.services).toHaveProperty("server");
  });
});

describe("POST /api/v1/auth/register", () => {
  it("should validate required fields", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({});
    expect(res.status).toBe(400);
  });

  it("should register a new user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: "user-1", fullName: "Test User", email: "new@test.com", role: "HOST",
    });

    const res = await request(app).post("/api/v1/auth/register").send({
      fullName: "Test User",
      email: "new@test.com",
      password: "Password123!",
    });
    expect(res.status).toBe(201);
  });
});

describe("POST /api/v1/auth/login", () => {
  it("should validate required fields", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({});
    expect(res.status).toBe(400);
  });
});

describe("Protected endpoints (401 without token)", () => {
  const protectedRoutes = [
    ["get", "/api/v1/events"],
    ["post", "/api/v1/events"],
    ["get", "/api/v1/dashboard/overview"],
    ["get", "/api/v1/analytics/events/e1/overview"],
    ["get", "/api/v1/export/events/e1/guests"],
    ["get", "/api/v1/feedback/events/e1"],
    ["get", "/api/v1/notifications"],
  ];

  for (const [method, path] of protectedRoutes) {
    it(`${method.toUpperCase()} ${path} returns 401`, async () => {
      const res = await request(app)[method](path);
      expect(res.status).toBe(401);
    });
  }
});

describe("Public gallery (no auth required)", () => {
  it("GET /api/v1/gallery/events/:eventCode returns 200", async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ id: "e1" });
    mockPrisma.media.findMany.mockResolvedValue([]);
    mockPrisma.media.count.mockResolvedValue(0);

    const res = await request(app).get("/api/v1/gallery/events/test-code");
    expect(res.status).toBe(200);
  });
});

describe("Feedback submission (no auth)", () => {
  it("POST /api/v1/feedback/events/:eventId validates guestId", async () => {
    const res = await request(app).post("/api/v1/feedback/events/e1").send({
      rating: 5,
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/v1/feedback/events/:eventId submits feedback", async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ id: "e1" });
    mockPrisma.feedback.findUnique.mockResolvedValue(null);
    mockPrisma.feedback.create.mockResolvedValue({ id: "f1", eventId: "e1", guestId: "550e8400-e29b-41d4-a716-446655440000", rating: 5 });

    const res = await request(app).post("/api/v1/feedback/events/e1").send({
      guestId: "550e8400-e29b-41d4-a716-446655440000",
      rating: 5,
      comment: "Great event!",
    });
    expect(res.status).toBe(201);
  });
});

describe("Social endpoints (no auth for reads)", () => {
  it("GET /api/v1/social/media/:mediaId/comments returns 200", async () => {
    mockPrisma.comment.findMany.mockResolvedValue([]);
    mockPrisma.comment.count.mockResolvedValue(0);

    const res = await request(app).get("/api/v1/social/media/m1/comments");
    expect(res.status).toBe(200);
  });

  it("GET /api/v1/social/media/:mediaId/likes/count returns 200", async () => {
    const { redis } = await import("../../src/config/redis.js");
    redis.get.mockResolvedValue(null);

    mockPrisma.like.count.mockResolvedValue(5);

    const res = await request(app).get("/api/v1/social/media/m1/likes/count");
    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(5);
  });
});

describe("Memories (no auth for reads)", () => {
  it("GET /api/v1/events/:eventId/memories returns 200", async () => {
    mockPrisma.memory.findMany.mockResolvedValue([]);
    mockPrisma.memory.count.mockResolvedValue(0);

    const res = await request(app).get("/api/v1/events/e1/memories");
    expect(res.status).toBe(200);
  });
});
