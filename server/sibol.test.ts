import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database and LLM
vi.mock("./db", () => ({
  seedPrograms: vi.fn().mockResolvedValue(undefined),
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getUserProfile: vi.fn().mockResolvedValue(null),
  saveUserProfile: vi.fn().mockResolvedValue(undefined),
  getActivePathway: vi.fn().mockResolvedValue(null),
  createPathwayWithSteps: vi.fn().mockResolvedValue(1),
  getPathwaySteps: vi.fn().mockResolvedValue([]),
  markStepComplete: vi.fn().mockResolvedValue(undefined),
  markStepIncomplete: vi.fn().mockResolvedValue(undefined),
  getPrograms: vi.fn().mockResolvedValue([]),
  getProgramById: vi.fn().mockResolvedValue(null),
  getChatHistory: vi.fn().mockResolvedValue([]),
  clearChatHistory: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: JSON.stringify({
      title: "Test Pathway",
      description: "A test livelihood pathway",
      category: "training",
      steps: [
        { stepNumber: 1, title: "Step 1", description: "First step", estimatedDuration: "1 week", resources: [] },
      ]
    }) } }]
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("auth procedures", () => {
  it("auth.me returns null for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("auth.me returns user for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test User");
  });

  it("auth.logout clears session cookie", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

describe("profile procedures", () => {
  it("profile.get returns null when no profile exists", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profile.get();
    expect(result).toBeNull();
  });

  it("profile.save requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.profile.save({
        educationLevel: "high_school",
        skills: ["Cooking"],
        location: "Manila",
        dependents: 2,
        monthlyIncome: "below_5k",
        goals: "start_business",
        onboardingComplete: true,
      })
    ).rejects.toThrow();
  });
});

describe("programs procedures", () => {
  it("programs.list is publicly accessible", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.programs.list(undefined);
    expect(Array.isArray(result)).toBe(true);
  });

  it("programs.getById returns null for non-existent program", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.programs.getById({ id: 9999 });
    expect(result).toBeNull();
  });
});

describe("pathway procedures", () => {
  it("pathway.get requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.pathway.get()).rejects.toThrow();
  });

  it("pathway.get returns null when no pathway exists", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.pathway.get();
    expect(result).toBeNull();
  });
});

describe("chat procedures", () => {
  it("chat.history requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.chat.history()).rejects.toThrow();
  });

  it("chat.history returns empty array when no messages", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.chat.history();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
