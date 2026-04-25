import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock Firestore so the router module can load without real Firebase credentials
vi.mock("./firestore-db", () => ({
  seedPrograms: vi.fn().mockResolvedValue(undefined),
  getUserProfile: vi.fn().mockResolvedValue(null),
  saveUserProfile: vi.fn().mockResolvedValue(undefined),
  getActivePathway: vi.fn().mockResolvedValue(null),
  getPathwaySteps: vi.fn().mockResolvedValue([]),
  createPathwayWithSteps: vi.fn().mockResolvedValue("pathway-1"),
  markStepComplete: vi.fn().mockResolvedValue(undefined),
  markStepIncomplete: vi.fn().mockResolvedValue(undefined),
  getPrograms: vi.fn().mockResolvedValue([]),
  getProgramById: vi.fn().mockResolvedValue(null),
  getChatHistory: vi.fn().mockResolvedValue([]),
  addChatMessage: vi.fn().mockResolvedValue("msg-1"),
  clearChatHistory: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

function createAuthContext(): TrpcContext {
  return {
    user: {
      uid: "sample-uid",
      email: "sample@example.com",
      name: "Sample User",
      picture: null,
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("auth.logout", () => {
  it("returns success (Firebase handles client-side sign-out, no server cookie needed)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
  });

  it("auth.me returns the current Firebase user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user?.uid).toBe("sample-uid");
    expect(user?.email).toBe("sample@example.com");
  });
});
