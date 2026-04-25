import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  chatMessages,
  pathwaySteps,
  pathways,
  programs,
  userProfiles,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── User Profiles ───────────────────────────────────────────────────────────
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertUserProfile(
  userId: number,
  data: {
    educationLevel?: string;
    skills?: string[];
    location?: string;
    latitude?: string;
    longitude?: string;
    dependents?: number;
    goals?: string;
    monthlyIncome?: string;
    onboardingComplete?: boolean;
  }
) {
  const db = await getDb();
  if (!db) return;
  const existing = await getUserProfile(userId);
  if (existing) {
    await db.update(userProfiles).set(data).where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({ userId, ...data });
  }
  return getUserProfile(userId);
}

// ─── Pathways ────────────────────────────────────────────────────────────────
export async function getActivePathway(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(pathways)
    .where(and(eq(pathways.userId, userId), eq(pathways.isActive, true)))
    .orderBy(desc(pathways.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getPathwaySteps(pathwayId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pathwaySteps).where(eq(pathwaySteps.pathwayId, pathwayId));
}

export async function createPathwayWithSteps(
  userId: number,
  pathway: { title: string; description: string; category: string },
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    resources: string[];
    estimatedDuration: string;
  }>
) {
  const db = await getDb();
  if (!db) return null;
  // Deactivate existing pathways
  await db.update(pathways).set({ isActive: false }).where(eq(pathways.userId, userId));
  // Create new pathway
  const [result] = await db.insert(pathways).values({ userId, ...pathway, isActive: true });
  const pathwayId = (result as { insertId: number }).insertId;
  // Insert steps
  for (const step of steps) {
    await db.insert(pathwaySteps).values({ pathwayId, ...step, resources: step.resources });
  }
  return pathwayId;
}

export async function markStepComplete(stepId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  // Verify ownership via join
  const step = await db.select().from(pathwaySteps).where(eq(pathwaySteps.id, stepId)).limit(1);
  if (!step.length) return;
  const pathway = await db.select().from(pathways).where(and(eq(pathways.id, step[0].pathwayId), eq(pathways.userId, userId))).limit(1);
  if (!pathway.length) return;
  await db.update(pathwaySteps).set({ isCompleted: true, completedAt: new Date() }).where(eq(pathwaySteps.id, stepId));
}

export async function markStepIncomplete(stepId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  const step = await db.select().from(pathwaySteps).where(eq(pathwaySteps.id, stepId)).limit(1);
  if (!step.length) return;
  const pathway = await db.select().from(pathways).where(and(eq(pathways.id, step[0].pathwayId), eq(pathways.userId, userId))).limit(1);
  if (!pathway.length) return;
  await db.update(pathwaySteps).set({ isCompleted: false, completedAt: null }).where(eq(pathwaySteps.id, stepId));
}

// ─── Programs ────────────────────────────────────────────────────────────────
export async function getPrograms(filters?: { category?: string; region?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(programs.isActive, true)];
  if (filters?.category) {
    conditions.push(eq(programs.category, filters.category as "training" | "grants" | "employment" | "microfinance" | "social_protection" | "enterprise"));
  }
  return db.select().from(programs).where(and(...conditions)).orderBy(programs.name);
}

export async function getProgramById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(programs).where(eq(programs.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function seedPrograms() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(programs).limit(1);
  if (existing.length > 0) return; // already seeded

  const seedData = [
    {
      name: "TESDA Technical-Vocational Education and Training",
      organization: "Technical Education and Skills Development Authority (TESDA)",
      category: "training" as const,
      description: "Free skills training programs in various technical-vocational courses including automotive, electronics, food processing, beauty care, and more.",
      eligibility: "Filipino citizens 15 years old and above who want to acquire technical-vocational skills.",
      benefits: "Free training, national certification, and skills assessment. Training duration ranges from 2 weeks to 6 months.",
      howToApply: "Visit the nearest TESDA Provincial/District Office or Technology Institution. Register online at tesda.gov.ph.",
      contactInfo: "TESDA Hotline: 8887-7777 | Email: info@tesda.gov.ph",
      website: "https://www.tesda.gov.ph",
      regions: ["NCR", "Region I", "Region II", "Region III", "Region IV-A", "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII", "Region IX", "Region X", "Region XI", "Region XII", "Region XIII", "CAR", "BARMM"],
    },
    {
      name: "Sustainable Livelihood Program (SLP)",
      organization: "Department of Social Welfare and Development (DSWD)",
      category: "grants" as const,
      description: "A community-based capacity building program that aims to improve the socioeconomic status of poor, vulnerable, and marginalized households through two tracks: Microenterprise Development and Employment Facilitation.",
      eligibility: "4Ps beneficiaries, indigent families, and other poor households listed in the NHTS-PR.",
      benefits: "Seed capital fund, livelihood kits, skills training, and business mentoring. Grants range from PHP 5,000 to PHP 15,000.",
      howToApply: "Coordinate with your barangay social worker or visit the nearest DSWD Field Office.",
      contactInfo: "DSWD Hotline: 8-931-8101 | Email: osec@dswd.gov.ph",
      website: "https://slp.dswd.gov.ph",
      regions: ["NCR", "Region I", "Region II", "Region III", "Region IV-A", "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII", "Region IX", "Region X", "Region XI", "Region XII", "Region XIII", "CAR", "BARMM"],
    },
    {
      name: "DOLE Integrated Livelihood Program (DILP)",
      organization: "Department of Labor and Employment (DOLE)",
      category: "grants" as const,
      description: "Provides livelihood assistance to displaced workers, underemployed individuals, and vulnerable sectors through skills training and starter kits.",
      eligibility: "Displaced workers, underemployed individuals, returning OFWs, and other vulnerable workers.",
      benefits: "Livelihood starter kits worth PHP 5,000 to PHP 10,000, skills training, and job placement assistance.",
      howToApply: "Visit the nearest DOLE Regional/Provincial/Field Office and submit application form with required documents.",
      contactInfo: "DOLE Hotline: 1349 | Email: osec@dole.gov.ph",
      website: "https://www.dole.gov.ph",
      regions: ["NCR", "Region I", "Region II", "Region III", "Region IV-A", "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII", "Region IX", "Region X", "Region XI", "Region XII", "Region XIII", "CAR", "BARMM"],
    },
    {
      name: "Negosyo Center Business Assistance",
      organization: "Department of Trade and Industry (DTI)",
      category: "enterprise" as const,
      description: "One-stop shop for business registration, business development services, and access to financing for micro and small enterprises.",
      eligibility: "Aspiring entrepreneurs and existing micro/small business owners.",
      benefits: "Free business registration assistance, business counseling, market linkage, and access to government financing programs.",
      howToApply: "Visit the nearest DTI Negosyo Center in your city or municipality.",
      contactInfo: "DTI Hotline: 1-800-10-DTI-CARES (1-800-10-384-2273) | Email: ask@dti.gov.ph",
      website: "https://www.dti.gov.ph/negosyo-center",
      regions: ["NCR", "Region I", "Region II", "Region III", "Region IV-A", "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII", "Region IX", "Region X", "Region XI", "Region XII", "Region XIII", "CAR", "BARMM"],
    },
    {
      name: "Pondo sa Pagbabago at Pag-asenso (P3)",
      organization: "Small Business Corporation (SBCorp) / DTI",
      category: "microfinance" as const,
      description: "Micro-lending program providing affordable credit to micro-enterprises at low interest rates to help them grow their businesses.",
      eligibility: "Micro-entrepreneurs with existing businesses for at least 1 year. No collateral required for loans up to PHP 100,000.",
      benefits: "Loans from PHP 5,000 to PHP 200,000 at 2.5% interest per month. No collateral for small amounts.",
      howToApply: "Apply through accredited microfinance institutions (MFIs) or cooperatives in your area.",
      contactInfo: "SBCorp Hotline: 8-651-3333 | Email: info@sbgfc.org.ph",
      website: "https://www.sbgfc.org.ph",
      regions: ["NCR", "Region I", "Region II", "Region III", "Region IV-A", "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII", "Region IX", "Region X", "Region XI", "Region XII", "Region XIII"],
    },
    {
      name: "PhilSys Financial Inclusion Program",
      organization: "Bangko Sentral ng Pilipinas (BSP)",
      category: "microfinance" as const,
      description: "Uses the Philippine Identification System (PhilSys) to expand access to formal financial services including savings accounts, insurance, and credit for unbanked Filipinos.",
      eligibility: "All Filipino citizens and resident aliens with PhilSys ID.",
      benefits: "Access to basic savings accounts, microinsurance, and formal credit facilities.",
      howToApply: "Present your PhilSys ID at any participating bank or financial institution.",
      contactInfo: "BSP Consumer Assistance: 8708-7087 | Email: consumeraffairs@bsp.gov.ph",
      website: "https://www.bsp.gov.ph",
      regions: ["NCR", "Region I", "Region II", "Region III", "Region IV-A", "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII", "Region IX", "Region X", "Region XI", "Region XII", "Region XIII", "CAR", "BARMM"],
    },
    {
      name: "DOLE JobStart Philippines",
      organization: "Department of Labor and Employment (DOLE)",
      category: "employment" as const,
      description: "A youth employment program that provides life skills training, technical skills training, and paid internship to out-of-school youth aged 18-24.",
      eligibility: "Out-of-school youth aged 18-24 years old who are not in employment, education, or training (NEET).",
      benefits: "Life skills training, technical skills training, paid internship (PHP 75/day allowance), and job placement assistance.",
      howToApply: "Register at the nearest Public Employment Service Office (PESO) or DOLE Regional Office.",
      contactInfo: "DOLE Hotline: 1349",
      website: "https://www.dole.gov.ph/jobstart",
      regions: ["NCR", "Region I", "Region III", "Region IV-A", "Region VI", "Region VII", "Region X", "Region XI"],
    },
    {
      name: "Pantawid Pamilyang Pilipino Program (4Ps)",
      organization: "Department of Social Welfare and Development (DSWD)",
      category: "social_protection" as const,
      description: "Conditional cash transfer program providing cash grants to poor households to improve health, nutrition, and education of children.",
      eligibility: "Poor households with children 0-18 years old and/or pregnant women. Must be listed in the NHTS-PR.",
      benefits: "Monthly cash grants: PHP 750 for health/nutrition, PHP 300-500 per child for education (up to 3 children).",
      howToApply: "Registration is through DSWD community validation. Contact your barangay social worker.",
      contactInfo: "DSWD Hotline: 8-931-8101",
      website: "https://4ps.dswd.gov.ph",
      regions: ["NCR", "Region I", "Region II", "Region III", "Region IV-A", "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII", "Region IX", "Region X", "Region XI", "Region XII", "Region XIII", "CAR", "BARMM"],
    },
    {
      name: "CARD MRI Microfinance Services",
      organization: "CARD Mutually Reinforcing Institutions (CARD MRI)",
      category: "microfinance" as const,
      description: "Microfinance services for poor women entrepreneurs including micro-loans, savings, insurance, and livelihood training.",
      eligibility: "Women 18 years and above from low-income households. Must form or join a solidarity group.",
      benefits: "Micro-loans starting at PHP 2,000, life insurance, savings products, and livelihood training.",
      howToApply: "Contact the nearest CARD Bank or CARD MFI branch in your area.",
      contactInfo: "CARD MRI: (049) 562-5900",
      website: "https://www.cardinc.org",
      regions: ["NCR", "Region I", "Region II", "Region III", "Region IV-A", "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII", "Region IX", "Region X", "Region XI", "Region XII", "Region XIII"],
    },
    {
      name: "TUPAD (Tulong Panghanapbuhay sa Ating Disadvantaged/Displaced Workers)",
      organization: "Department of Labor and Employment (DOLE)",
      category: "employment" as const,
      description: "Emergency employment program providing short-term employment to displaced, underemployed, and seasonal workers in community projects.",
      eligibility: "Displaced workers, underemployed individuals, and seasonal workers aged 18 and above.",
      benefits: "10-30 days of employment at minimum wage rate for community improvement projects.",
      howToApply: "Apply through your barangay or LGU. DOLE coordinates with LGUs for implementation.",
      contactInfo: "DOLE Hotline: 1349",
      website: "https://www.dole.gov.ph",
      regions: ["NCR", "Region I", "Region II", "Region III", "Region IV-A", "Region IV-B", "Region V", "Region VI", "Region VII", "Region VIII", "Region IX", "Region X", "Region XI", "Region XII", "Region XIII", "CAR", "BARMM"],
    },
  ];

  for (const program of seedData) {
    await db.insert(programs).values(program);
  }
  console.log("[DB] Programs seeded successfully");
}
