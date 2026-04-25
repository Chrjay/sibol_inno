import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  getUserProfile,
  saveUserProfile,
  getActivePathway,
  getPathwaySteps,
  createPathwayWithSteps,
  markStepComplete,
  markStepIncomplete,
  getPrograms,
  getProgramById,
  seedPrograms,
  getChatHistory,
  addChatMessage,
  clearChatHistory,
} from "./firestore-db";

// ─── Seed programs on startup ─────────────────────────────────────────────────
const PROGRAMS_SEED = [
  { name: "TESDA Technical-Vocational Education and Training (TVET)", organization: "Technical Education and Skills Development Authority (TESDA)", category: "training", description: "Free technical and vocational training programs in various skills such as automotive, electronics, food processing, beauty care, and more. Leads to National Certificates (NC) recognized by employers.", eligibility: "Filipino citizens aged 15 and above. Priority given to out-of-school youth, displaced workers, and 4Ps beneficiaries.", benefits: "Free skills training, National Certificate (NC I, II, III, IV), improved employment opportunities, and access to scholarship programs.", howToApply: "Visit the nearest TESDA Provincial/District Office or Technology Institution. Bring valid ID, birth certificate, and barangay certificate. You can also apply online at tesda.gov.ph.", contactInfo: "TESDA Hotline: 8887-7777 | Website: tesda.gov.ph", website: "https://www.tesda.gov.ph", isActive: true },
  { name: "Sustainable Livelihood Program (SLP)", organization: "Department of Social Welfare and Development (DSWD)", category: "grants", description: "Provides poor families with access to livelihood opportunities through microenterprise development and employment facilitation. Includes seed capital grants and skills training.", eligibility: "4Ps beneficiaries, poor households listed in the Listahanan, and other vulnerable sectors.", benefits: "Seed capital grant (up to ₱10,000 per beneficiary), skills training, business development services, and market linkage assistance.", howToApply: "Register with your local DSWD office or barangay. Participate in community assemblies and training sessions.", contactInfo: "DSWD Hotline: 8-931-8101 | Website: dswd.gov.ph", website: "https://www.dswd.gov.ph/programs-projects/sustainable-livelihood-program/", isActive: true },
  { name: "TUPAD (Tulong Panghanapbuhay sa Ating Disadvantaged/Displaced Workers)", organization: "Department of Labor and Employment (DOLE)", category: "employment", description: "Emergency employment program that provides short-term wage employment to displaced, underemployed, and seasonal workers.", eligibility: "Displaced workers, underemployed individuals, seasonal workers, and other vulnerable workers.", benefits: "Short-term employment (10-30 days), daily wage at minimum wage rate, accident insurance coverage.", howToApply: "Apply at the nearest DOLE Regional/Provincial/Field Office. Bring valid ID and proof of displacement.", contactInfo: "DOLE Hotline: 1349 | Website: dole.gov.ph", website: "https://www.dole.gov.ph", isActive: true },
  { name: "Negosyo Center Program", organization: "Department of Trade and Industry (DTI)", category: "enterprise", description: "One-stop shop for business registration, business advisory services, and access to financing for micro, small, and medium enterprises (MSMEs).", eligibility: "Aspiring entrepreneurs and existing micro and small business owners.", benefits: "Free business registration assistance, business advisory and mentoring, access to financing programs, market linkage.", howToApply: "Visit the nearest DTI Provincial Office or Negosyo Center. Bring valid ID and business concept/plan.", contactInfo: "DTI Hotline: 1-DTI (1-384) | Website: dti.gov.ph", website: "https://www.dti.gov.ph/negosyo-center/", isActive: true },
  { name: "Pantawid Pamilyang Pilipino Program (4Ps)", organization: "Department of Social Welfare and Development (DSWD)", category: "social_protection", description: "Conditional cash transfer program that provides cash grants to poor households to improve health, nutrition, and education of children.", eligibility: "Poor households with children aged 0-18 years old, pregnant women, or households with members with disabilities.", benefits: "Monthly cash grants for health (₱750/month) and education (₱300-500/child/month), access to health services.", howToApply: "Registration is done through DSWD community validation. Contact your local DSWD office or barangay social worker.", contactInfo: "DSWD Hotline: 8-931-8101 | Website: dswd.gov.ph/4ps", website: "https://www.dswd.gov.ph/programs-projects/4ps/", isActive: true },
  { name: "Pondo sa Pagbabago at Pag-asenso (P3) Program", organization: "Small Business Corporation (SB Corp) / DTI", category: "microfinance", description: "Provides affordable microfinance loans to micro-entrepreneurs through accredited lending conduits.", eligibility: "Micro-entrepreneurs with existing business or those starting a business. Must be a Filipino citizen, 18-65 years old.", benefits: "Loans from ₱5,000 to ₱200,000, lower interest rates (2.5% per month), flexible repayment terms.", howToApply: "Apply through accredited microfinance institutions, cooperatives, or SB Corp offices.", contactInfo: "SB Corp Hotline: 8651-3333 | Website: sbcorp.gov.ph", website: "https://www.sbcorp.gov.ph", isActive: true },
  { name: "DOLE Integrated Livelihood Program (DILP)", organization: "Department of Labor and Employment (DOLE)", category: "grants", description: "Provides livelihood assistance packages to workers in the informal economy, displaced workers, and vulnerable sectors.", eligibility: "Workers in the informal economy, displaced workers, returning OFWs, persons with disabilities.", benefits: "Livelihood starter kits worth up to ₱10,000, skills training, business development assistance.", howToApply: "Apply at the nearest DOLE Regional/Provincial/Field Office. Submit application form and valid ID.", contactInfo: "DOLE Hotline: 1349 | Website: dole.gov.ph", website: "https://www.dole.gov.ph", isActive: true },
  { name: "Agricultural Credit Policy Council (ACPC) Loan Programs", organization: "Department of Agriculture (DA) / ACPC", category: "microfinance", description: "Provides affordable credit to small farmers and fisherfolk through various lending programs.", eligibility: "Small farmers, fisherfolk, and agricultural workers.", benefits: "Low-interest loans (0-6% per annum), flexible repayment terms aligned with harvest seasons, crop insurance.", howToApply: "Apply through accredited rural banks, cooperatives, or microfinance institutions.", contactInfo: "ACPC Hotline: 8-920-4048 | Website: acpc.gov.ph", website: "https://www.acpc.gov.ph", isActive: true },
  { name: "Go Negosyo Mentor Me Program", organization: "Philippine Center for Entrepreneurship (PCE) / Go Negosyo", category: "enterprise", description: "Free mentoring program that connects aspiring and existing entrepreneurs with experienced business mentors.", eligibility: "Aspiring entrepreneurs and existing micro and small business owners.", benefits: "Free one-on-one mentoring sessions, access to business networks, market linkage opportunities.", howToApply: "Register online at gonegosyo.net or visit the nearest Negosyo Center.", contactInfo: "Go Negosyo Hotline: 8-888-7777 | Website: gonegosyo.net", website: "https://www.gonegosyo.net", isActive: true },
  { name: "OWWA Livelihood Development Program", organization: "Overseas Workers Welfare Administration (OWWA)", category: "grants", description: "Provides livelihood assistance to returning OFWs and their families.", eligibility: "Active and returning OFW members of OWWA and their qualified dependents.", benefits: "Livelihood grants up to ₱20,000, skills training, business development assistance.", howToApply: "Apply at the nearest OWWA Regional Welfare Office. Bring OWWA membership card and valid ID.", contactInfo: "OWWA Hotline: 1348 | Website: owwa.gov.ph", website: "https://www.owwa.gov.ph", isActive: true },
  { name: "PhilSys (Philippine Identification System) Registration", organization: "Philippine Statistics Authority (PSA)", category: "social_protection", description: "National ID system that provides a single national ID for all Filipinos and resident aliens.", eligibility: "All Filipino citizens and resident aliens. Free registration for all.", benefits: "Free national ID, simplified access to government services, easier application for social protection programs.", howToApply: "Register online at philsys.gov.ph or visit the nearest PSA registration center.", contactInfo: "PSA Hotline: 8461-6000 | Website: philsys.gov.ph", website: "https://philsys.gov.ph", isActive: true },
  { name: "TESDA STEP (Special Training for Employment Program)", organization: "Technical Education and Skills Development Authority (TESDA)", category: "training", description: "Community-based training program that provides short-duration skills training (10-40 hours) to disadvantaged groups.", eligibility: "Out-of-school youth, unemployed adults, indigenous peoples, persons with disabilities.", benefits: "Free short-term skills training, certificate of completion, improved employability.", howToApply: "Contact the nearest TESDA Provincial/District Office or accredited training institution.", contactInfo: "TESDA Hotline: 8887-7777 | Website: tesda.gov.ph", website: "https://www.tesda.gov.ph", isActive: true },
];

seedPrograms(PROGRAMS_SEED).catch(console.error);

export const appRouter = router({
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    // No logout needed — Firebase handles sign-out client-side
    logout: publicProcedure.mutation(() => ({ success: true } as const)),
  }),

  // ─── Profile ──────────────────────────────────────────────────────────────
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserProfile(ctx.user.uid);
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
        await saveUserProfile(ctx.user.uid, input);
        return { success: true };
      }),
  }),

  // ─── Pathway ──────────────────────────────────────────────────────────────
  pathway: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const pathway = await getActivePathway(ctx.user.uid);
      if (!pathway) return null;
      const steps = await getPathwaySteps(pathway.id);
      return { ...pathway, steps };
    }),

    generate: protectedProcedure.mutation(async ({ ctx }) => {
      const profile = await getUserProfile(ctx.user.uid);
      if (!profile) throw new Error("Profile not found. Please complete onboarding first.");

      const profileSummary = `
Education: ${profile.educationLevel || "Not specified"}
Skills: ${profile.skills?.join(", ") || "Not specified"}
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

      await createPathwayWithSteps(
        ctx.user.uid,
        { title: parsed.title, description: parsed.description, category: parsed.category },
        parsed.steps
      );

      const pathway = await getActivePathway(ctx.user.uid);
      if (!pathway) throw new Error("Failed to create pathway");
      const steps = await getPathwaySteps(pathway.id);
      return { ...pathway, steps };
    }),

    completeStep: protectedProcedure
      .input(z.object({ stepId: z.string() }))
      .mutation(async ({ input }) => {
        await markStepComplete(input.stepId);
        return { success: true };
      }),

    uncompleteStep: protectedProcedure
      .input(z.object({ stepId: z.string() }))
      .mutation(async ({ input }) => {
        await markStepIncomplete(input.stepId);
        return { success: true };
      }),
  }),

  // ─── Programs ─────────────────────────────────────────────────────────────
  programs: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getPrograms(input?.category);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return getProgramById(input.id);
      }),
  }),

  // ─── Chat ─────────────────────────────────────────────────────────────────
  chat: router({
    history: protectedProcedure.query(async ({ ctx }) => {
      return getChatHistory(ctx.user.uid);
    }),

    send: protectedProcedure
      .input(z.object({ message: z.string().min(1).max(1000) }))
      .mutation(async ({ ctx, input }) => {
        // Save user message
        await addChatMessage(ctx.user.uid, "user", input.message);

        // Get context: profile + pathway
        const profile = await getUserProfile(ctx.user.uid);
        const pathway = await getActivePathway(ctx.user.uid);
        let pathwayContext = "";
        if (pathway) {
          const steps = await getPathwaySteps(pathway.id);
          const completedCount = steps.filter((s) => s.isCompleted).length;
          pathwayContext = `Current pathway: "${pathway.title}" (${completedCount}/${steps.length} steps completed)`;
        }

        // Get recent history for context
        const recentHistory = await getChatHistory(ctx.user.uid);
        const last10 = recentHistory.slice(-10);

        const systemPrompt = `Ikaw ay si Sibol AI, isang mapagkakatiwalaang gabay sa kabuhayan para sa mga benepisyaryo ng 4Ps at iba pang nangangailangan sa Pilipinas.

You are Sibol AI, a trusted livelihood guide for 4Ps beneficiaries and underserved communities in the Philippines.

User Profile:
- Education: ${profile?.educationLevel || "Not specified"}
- Skills: ${profile?.skills?.join(", ") || "Not specified"}
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
          ...last10.slice(0, -1).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const assistantContent = String(response.choices[0].message.content ?? "");

        // Save assistant message
        await addChatMessage(ctx.user.uid, "assistant", assistantContent);

        return { content: assistantContent };
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await clearChatHistory(ctx.user.uid);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
