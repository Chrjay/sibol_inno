import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  getUserProfile,
  upsertUserProfile,
  getActivePathway,
  getPathwaySteps,
  createPathwayWithSteps,
  markStepComplete,
  markStepIncomplete,
  getPrograms,
  getProgramById,
  seedPrograms,
  getDb,
} from "./db";
import { chatMessages } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// Seed programs on startup
seedPrograms().catch(console.error);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Profile ──────────────────────────────────────────────────────────────
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserProfile(ctx.user.id);
    }),
    save: protectedProcedure
      .input(
        z.object({
          educationLevel: z.string().optional(),
          skills: z.array(z.string()).optional(),
          location: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          dependents: z.number().int().min(0).optional(),
          goals: z.string().optional(),
          monthlyIncome: z.string().optional(),
          onboardingComplete: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return upsertUserProfile(ctx.user.id, input);
      }),
  }),

  // ─── Pathway ──────────────────────────────────────────────────────────────
  pathway: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const pathway = await getActivePathway(ctx.user.id);
      if (!pathway) return null;
      const steps = await getPathwaySteps(pathway.id);
      steps.sort((a, b) => a.stepNumber - b.stepNumber);
      return { ...pathway, steps };
    }),

    generate: protectedProcedure.mutation(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.id);
      if (!profile) throw new Error("Profile not found. Please complete onboarding first.");

      const profileSummary = `
Education: ${profile.educationLevel || "Not specified"}
Skills: ${(profile.skills as string[] | null)?.join(", ") || "Not specified"}
Location: ${profile.location || "Philippines"}
Dependents: ${profile.dependents ?? 0}
Monthly Income: ${profile.monthlyIncome || "Not specified"}
Goals: ${profile.goals || "Improve livelihood"}
      `.trim();

      const prompt = `You are a livelihood pathway advisor for 4Ps beneficiaries and underserved communities in the Philippines.

Based on this beneficiary profile:
${profileSummary}

Generate a personalized, realistic livelihood pathway with 5-7 actionable steps. Each step should be specific, achievable, and tailored to their situation. Consider available Philippine government programs like TESDA, DOLE, SLP, DTI Negosyo Center, and microfinance institutions.

Respond ONLY with valid JSON in this exact format:
{
  "title": "Pathway title (e.g., 'Food Business Entrepreneur Path')",
  "description": "2-3 sentence overview of the pathway",
  "category": "One of: skills_training, micro_enterprise, formal_employment, agriculture, services",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "Detailed description of what to do and why",
      "resources": ["Resource 1", "Resource 2"],
      "estimatedDuration": "e.g., 2-4 weeks"
    }
  ]
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a helpful livelihood advisor. Always respond with valid JSON only, no markdown." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "livelihood_pathway",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                category: { type: "string" },
                steps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      stepNumber: { type: "integer" },
                      title: { type: "string" },
                      description: { type: "string" },
                      resources: { type: "array", items: { type: "string" } },
                      estimatedDuration: { type: "string" },
                    },
                    required: ["stepNumber", "title", "description", "resources", "estimatedDuration"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "description", "category", "steps"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = String(response.choices[0].message.content ?? "");
      const parsed = JSON.parse(content);

      const pathwayId = await createPathwayWithSteps(
        ctx.user.id,
        { title: parsed.title, description: parsed.description, category: parsed.category },
        parsed.steps
      );

      const pathway = await getActivePathway(ctx.user.id);
      if (!pathway) throw new Error("Failed to create pathway");
      const steps = await getPathwaySteps(pathway.id);
      steps.sort((a, b) => a.stepNumber - b.stepNumber);
      return { ...pathway, steps };
    }),

    completeStep: protectedProcedure
      .input(z.object({ stepId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markStepComplete(input.stepId, ctx.user.id);
        return { success: true };
      }),

    uncompleteStep: protectedProcedure
      .input(z.object({ stepId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markStepIncomplete(input.stepId, ctx.user.id);
        return { success: true };
      }),
  }),

  // ─── Programs ─────────────────────────────────────────────────────────────
  programs: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional(), region: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getPrograms(input);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getProgramById(input.id);
      }),
  }),

  // ─── Chat ─────────────────────────────────────────────────────────────────
  chat: router({
    history: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.userId, ctx.user.id))
        .orderBy(desc(chatMessages.createdAt))
        .limit(50)
        .then((msgs) => msgs.reverse());
    }),

    send: protectedProcedure
      .input(z.object({ message: z.string().min(1).max(1000) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        // Save user message
        await db.insert(chatMessages).values({
          userId: ctx.user.id,
          role: "user" as const,
          content: input.message,
        });

        // Get context: profile + pathway
        const profile = await getUserProfile(ctx.user.id);
        const pathway = await getActivePathway(ctx.user.id);
        let pathwayContext = "";
        if (pathway) {
          const steps = await getPathwaySteps(pathway.id);
          const completedCount = steps.filter((s) => s.isCompleted).length;
          pathwayContext = `Current pathway: "${pathway.title}" (${completedCount}/${steps.length} steps completed)`;
        }

        // Get recent chat history for context
        const recentHistory = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.userId, ctx.user.id))
          .orderBy(desc(chatMessages.createdAt))
          .limit(10)
          .then((msgs) => msgs.reverse());

        const systemPrompt = `Ikaw ay si Sibol AI, isang mapagkakatiwalaang gabay sa kabuhayan para sa mga benepisyaryo ng 4Ps at iba pang nangangailangan sa Pilipinas.

You are Sibol AI, a trusted livelihood guide for 4Ps beneficiaries and underserved communities in the Philippines.

User Profile:
- Education: ${profile?.educationLevel || "Not specified"}
- Skills: ${(profile?.skills as string[] | null)?.join(", ") || "Not specified"}
- Location: ${profile?.location || "Philippines"}
- Dependents: ${profile?.dependents ?? 0}
- Goals: ${profile?.goals || "Improve livelihood"}
${pathwayContext ? `- ${pathwayContext}` : ""}

Instructions:
1. Respond in the same language the user writes in (Filipino or English). If mixed, respond in Filipino.
2. Be warm, encouraging, and practical. Never make the user feel like a charity case.
3. Give specific, actionable advice about Philippine government programs (TESDA, DOLE, SLP, DTI, DSWD).
4. Keep responses concise and easy to understand for someone with basic education.
5. Always emphasize the user's potential and capability to grow.`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...recentHistory.slice(0, -1).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const assistantContent = String(response.choices[0].message.content ?? "");

        // Save assistant message
        await db.insert(chatMessages).values({
          userId: ctx.user.id,
          role: "assistant" as const,
          content: assistantContent,
        });

        return { content: assistantContent };
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return;
      await db.delete(chatMessages).where(eq(chatMessages.userId, ctx.user.id));
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
