import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock Firestore DB ────────────────────────────────────────────────────────
vi.mock("./firestore-db", () => ({
  getUserProfile: vi.fn().mockResolvedValue({
    userId: "test-uid",
    educationLevel: "high_school",
    skills: ["cooking", "sewing"],
    location: "Manila",
    dependents: 2,
    goals: "start_business",
    monthlyIncome: "below_5k",
    onboardingComplete: true,
  }),
  saveUserProfile: vi.fn().mockResolvedValue(undefined),
  getActivePathway: vi.fn().mockResolvedValue({
    id: "pathway-1",
    userId: "test-uid",
    title: "Food Business Path",
    description: "A path to start a food business",
    category: "micro_enterprise",
    isActive: true,
    createdAt: Date.now(),
  }),
  getPathwaySteps: vi.fn().mockResolvedValue([
    { id: "step-1", pathwayId: "pathway-1", stepNumber: 1, title: "Register at TESDA", description: "Enroll in food processing", estimatedDuration: "2 weeks", resources: ["TESDA"], isCompleted: false },
    { id: "step-2", pathwayId: "pathway-1", stepNumber: 2, title: "Apply for SLP grant", description: "Get seed capital", estimatedDuration: "1 month", resources: ["DSWD"], isCompleted: true },
  ]),
  createPathwayWithSteps: vi.fn().mockResolvedValue("pathway-new"),
  markStepComplete: vi.fn().mockResolvedValue(undefined),
  markStepIncomplete: vi.fn().mockResolvedValue(undefined),
  getPrograms: vi.fn().mockResolvedValue([
    { id: "prog-1", name: "TESDA TVET", organization: "TESDA", category: "training", description: "Free skills training", eligibility: "All Filipinos", benefits: "NC Certificate", howToApply: "Visit TESDA", contactInfo: "8887-7777", website: "https://tesda.gov.ph", isActive: true },
  ]),
  getProgramById: vi.fn().mockResolvedValue({
    id: "prog-1", name: "TESDA TVET", organization: "TESDA", category: "training", description: "Free skills training", eligibility: "All Filipinos", benefits: "NC Certificate", howToApply: "Visit TESDA", contactInfo: "8887-7777", website: "https://tesda.gov.ph", isActive: true,
  }),
  seedPrograms: vi.fn().mockResolvedValue(undefined),
  getChatHistory: vi.fn().mockResolvedValue([]),
  addChatMessage: vi.fn().mockResolvedValue("msg-1"),
  clearChatHistory: vi.fn().mockResolvedValue(undefined),
}));

// ─── Mock LLM ─────────────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          title: "Food Business Entrepreneur Path",
          description: "A step-by-step guide to starting a food business.",
          category: "micro_enterprise",
          steps: [
            { stepNumber: 1, title: "Enroll in TESDA Food Processing", description: "Get certified", resources: ["TESDA"], estimatedDuration: "2 weeks" },
            { stepNumber: 2, title: "Apply for SLP grant", description: "Get seed capital", resources: ["DSWD SLP"], estimatedDuration: "1 month" },
          ],
        }),
      },
    }],
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeCtx(uid = "test-uid"): TrpcContext {
  return {
    user: { uid, email: "test@example.com", name: "Test User", picture: null },
    req: { headers: {}, protocol: "https" } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { headers: {}, protocol: "https" } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("auth", () => {
  it("me returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    expect(await caller.auth.me()).toBeNull();
  });

  it("me returns Firebase user when authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const user = await caller.auth.me();
    expect(user?.uid).toBe("test-uid");
  });

  it("logout returns success", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

describe("profile", () => {
  it("get returns user profile from Firestore", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const profile = await caller.profile.get();
    expect(profile?.educationLevel).toBe("high_school");
    expect(profile?.onboardingComplete).toBe(true);
  });

  it("save updates user profile and returns success", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.profile.save({ location: "Cebu", goals: "get_job" });
    expect(result.success).toBe(true);
  });

  it("save requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.profile.save({ location: "Manila" })).rejects.toThrow();
  });
});

describe("pathway", () => {
  it("get returns active pathway with steps", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const pathway = await caller.pathway.get();
    expect(pathway?.title).toBe("Food Business Path");
    expect(pathway?.steps).toHaveLength(2);
  });

  it("get requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.pathway.get()).rejects.toThrow();
  });

  it("generate creates a new AI pathway", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const pathway = await caller.pathway.generate();
    expect(pathway?.title).toBeDefined();
    expect(pathway?.steps.length).toBeGreaterThan(0);
  });

  it("completeStep marks a step done", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.pathway.completeStep({ stepId: "step-1" });
    expect(result.success).toBe(true);
  });

  it("uncompleteStep marks a step undone", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.pathway.uncompleteStep({ stepId: "step-1" });
    expect(result.success).toBe(true);
  });
});

describe("programs", () => {
  it("list is publicly accessible", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const programs = await caller.programs.list({});
    expect(Array.isArray(programs)).toBe(true);
    expect(programs[0].name).toBe("TESDA TVET");
  });

  it("getById returns a single program", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const program = await caller.programs.getById({ id: "prog-1" });
    expect(program?.name).toBe("TESDA TVET");
  });
});

describe("chat", () => {
  it("history requires authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.chat.history()).rejects.toThrow();
  });

  it("history returns array for authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const history = await caller.chat.history();
    expect(Array.isArray(history)).toBe(true);
  });

  it("send returns AI response", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.chat.send({ message: "Ano ang TESDA?" });
    expect(typeof result.content).toBe("string");
    expect(result.content.length).toBeGreaterThan(0);
  });

  it("clear removes chat history", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.chat.clear();
    expect(result?.success).toBe(true);
  });
});
