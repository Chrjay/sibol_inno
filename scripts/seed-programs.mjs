import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const programs = [
  {
    name: "TESDA Technical-Vocational Education and Training (TVET)",
    organization: "Technical Education and Skills Development Authority (TESDA)",
    category: "training",
    description: "Free technical and vocational training programs in various skills such as automotive, electronics, food processing, beauty care, and more. Leads to National Certificates (NC) recognized by employers.",
    eligibility: "Filipino citizens aged 15 and above. Priority given to out-of-school youth, displaced workers, and 4Ps beneficiaries.",
    benefits: "Free skills training, National Certificate (NC I, II, III, IV), improved employment opportunities, and access to scholarship programs.",
    howToApply: "Visit the nearest TESDA Provincial/District Office or Technology Institution. Bring valid ID, birth certificate, and barangay certificate. You can also apply online at tesda.gov.ph.",
    contactInfo: "TESDA Hotline: 8887-7777 | Website: tesda.gov.ph | Email: info@tesda.gov.ph",
    website: "https://www.tesda.gov.ph",
    location: "Nationwide",
    isActive: true,
  },
  {
    name: "Sustainable Livelihood Program (SLP)",
    organization: "Department of Social Welfare and Development (DSWD)",
    category: "grants",
    description: "Provides poor families with access to livelihood opportunities through microenterprise development and employment facilitation. Includes seed capital grants and skills training.",
    eligibility: "4Ps beneficiaries, poor households listed in the Listahanan (National Household Targeting System), and other vulnerable sectors.",
    benefits: "Seed capital grant (up to ₱10,000 per beneficiary), skills training, business development services, and market linkage assistance.",
    howToApply: "Register with your local DSWD office or barangay. Participate in community assemblies and training sessions. Submit required documents including valid ID and proof of eligibility.",
    contactInfo: "DSWD Hotline: 8-931-8101 | Website: dswd.gov.ph",
    website: "https://www.dswd.gov.ph/programs-projects/sustainable-livelihood-program/",
    location: "Nationwide",
    isActive: true,
  },
  {
    name: "TUPAD (Tulong Panghanapbuhay sa Ating Disadvantaged/Displaced Workers)",
    organization: "Department of Labor and Employment (DOLE)",
    category: "employment",
    description: "Emergency employment program that provides short-term wage employment to displaced, underemployed, and seasonal workers. Workers are hired for community projects.",
    eligibility: "Displaced workers, underemployed individuals, seasonal workers, and other vulnerable workers. Priority for those affected by natural disasters or economic displacement.",
    benefits: "Short-term employment (10-30 days), daily wage at minimum wage rate, accident insurance coverage.",
    howToApply: "Apply at the nearest DOLE Regional/Provincial/Field Office. Bring valid ID and proof of displacement or underemployment. Barangay officials can also endorse qualified applicants.",
    contactInfo: "DOLE Hotline: 1349 | Website: dole.gov.ph",
    website: "https://www.dole.gov.ph",
    location: "Nationwide",
    isActive: true,
  },
  {
    name: "Negosyo Center Program",
    organization: "Department of Trade and Industry (DTI)",
    category: "enterprise",
    description: "One-stop shop for business registration, business advisory services, and access to financing for micro, small, and medium enterprises (MSMEs). Provides free business coaching and mentoring.",
    eligibility: "Aspiring entrepreneurs and existing micro and small business owners. No minimum capital requirement for consultation services.",
    benefits: "Free business registration assistance, business advisory and mentoring, access to financing programs, market linkage, and technology upgrading.",
    howToApply: "Visit the nearest DTI Provincial Office or Negosyo Center. Bring valid ID and business concept/plan. Services are free of charge.",
    contactInfo: "DTI Hotline: 1-DTI (1-384) | Website: dti.gov.ph | Email: ask@dti.gov.ph",
    website: "https://www.dti.gov.ph/negosyo-center/",
    location: "Nationwide",
    isActive: true,
  },
  {
    name: "Pantawid Pamilyang Pilipino Program (4Ps)",
    organization: "Department of Social Welfare and Development (DSWD)",
    category: "social_protection",
    description: "Conditional cash transfer program that provides cash grants to poor households to improve health, nutrition, and education of children. Also provides access to social services.",
    eligibility: "Poor households with children aged 0-18 years old, pregnant women, or households with members with disabilities. Must be listed in the Listahanan.",
    benefits: "Monthly cash grants for health (₱750/month) and education (₱300-500/child/month), access to health services, social protection, and livelihood programs.",
    howToApply: "Registration is done through DSWD community validation. Contact your local DSWD office or barangay social worker to check eligibility and register.",
    contactInfo: "DSWD Hotline: 8-931-8101 | Website: dswd.gov.ph/4ps",
    website: "https://www.dswd.gov.ph/programs-projects/4ps/",
    location: "Nationwide",
    isActive: true,
  },
  {
    name: "Pondo sa Pagbabago at Pag-asenso (P3) Program",
    organization: "Small Business Corporation (SB Corp) / DTI",
    category: "microfinance",
    description: "Provides affordable microfinance loans to micro-entrepreneurs through accredited lending conduits. Offers lower interest rates than traditional moneylenders (5-2.5% per month).",
    eligibility: "Micro-entrepreneurs with existing business or those starting a business. Must be a Filipino citizen, 18-65 years old, with a viable business plan.",
    benefits: "Loans from ₱5,000 to ₱200,000, lower interest rates (2.5% per month), flexible repayment terms, business development services.",
    howToApply: "Apply through accredited microfinance institutions, cooperatives, or SB Corp offices. Submit business plan, valid ID, proof of residence, and other required documents.",
    contactInfo: "SB Corp Hotline: 8651-3333 | Website: sbcorp.gov.ph",
    website: "https://www.sbcorp.gov.ph",
    location: "Nationwide",
    isActive: true,
  },
  {
    name: "DOLE Integrated Livelihood Program (DILP)",
    organization: "Department of Labor and Employment (DOLE)",
    category: "grants",
    description: "Provides livelihood assistance packages to workers in the informal economy, displaced workers, and vulnerable sectors. Includes starter kits, equipment, and training.",
    eligibility: "Workers in the informal economy, displaced workers, returning overseas Filipino workers (OFWs), persons with disabilities, and other vulnerable workers.",
    benefits: "Livelihood starter kits worth up to ₱10,000, skills training, business development assistance, and market linkage.",
    howToApply: "Apply at the nearest DOLE Regional/Provincial/Field Office. Submit application form, valid ID, and proof of eligibility. Group applications are encouraged.",
    contactInfo: "DOLE Hotline: 1349 | Website: dole.gov.ph",
    website: "https://www.dole.gov.ph",
    location: "Nationwide",
    isActive: true,
  },
  {
    name: "Agricultural Credit Policy Council (ACPC) Loan Programs",
    organization: "Department of Agriculture (DA) / ACPC",
    category: "microfinance",
    description: "Provides affordable credit to small farmers and fisherfolk through various lending programs. Includes the SURE Aid and Recovery Project for agricultural workers.",
    eligibility: "Small farmers, fisherfolk, and agricultural workers. Priority for those affected by natural disasters and those with no access to formal credit.",
    benefits: "Low-interest loans (0-6% per annum), flexible repayment terms aligned with harvest seasons, crop insurance, and technical assistance.",
    howToApply: "Apply through accredited rural banks, cooperatives, or microfinance institutions. Contact the nearest DA Provincial Office for referral and guidance.",
    contactInfo: "ACPC Hotline: 8-920-4048 | Website: acpc.gov.ph",
    website: "https://www.acpc.gov.ph",
    location: "Nationwide",
    isActive: true,
  },
  {
    name: "Go Negosyo Mentor Me Program",
    organization: "Philippine Center for Entrepreneurship (PCE) / Go Negosyo",
    category: "enterprise",
    description: "Free mentoring program that connects aspiring and existing entrepreneurs with experienced business mentors. Provides guidance on business planning, marketing, and operations.",
    eligibility: "Aspiring entrepreneurs and existing micro and small business owners. Open to all Filipinos regardless of age or educational background.",
    benefits: "Free one-on-one mentoring sessions, access to business networks, market linkage opportunities, and business development resources.",
    howToApply: "Register online at gonegosyo.net or visit the nearest Negosyo Center. Submit basic business information and mentoring needs.",
    contactInfo: "Go Negosyo Hotline: 8-888-7777 | Website: gonegosyo.net",
    website: "https://www.gonegosyo.net",
    location: "Nationwide",
    isActive: true,
  },
  {
    name: "OWWA Livelihood Development Program",
    organization: "Overseas Workers Welfare Administration (OWWA)",
    category: "grants",
    description: "Provides livelihood assistance to returning OFWs and their families. Includes skills training, business development, and financial assistance for enterprise development.",
    eligibility: "Active and returning OFW members of OWWA and their qualified dependents. Must be registered OWWA members.",
    benefits: "Livelihood grants up to ₱20,000, skills training, business development assistance, and access to OWWA loan programs.",
    howToApply: "Apply at the nearest OWWA Regional Welfare Office. Bring OWWA membership card, valid ID, and proof of OFW status. Attend orientation seminar.",
    contactInfo: "OWWA Hotline: 1348 | Website: owwa.gov.ph",
    website: "https://www.owwa.gov.ph",
    location: "Nationwide",
    isActive: true,
  },
  {
    name: "PhilSys (Philippine Identification System) Registration",
    organization: "Philippine Statistics Authority (PSA)",
    category: "social_protection",
    description: "National ID system that provides a single national ID for all Filipinos and resident aliens. The PhilSys ID is required for accessing many government programs and services.",
    eligibility: "All Filipino citizens and resident aliens. Free registration for all.",
    benefits: "Free national ID, simplified access to government services, easier application for social protection programs, and financial inclusion.",
    howToApply: "Register online at philsys.gov.ph or visit the nearest PSA registration center. Bring original birth certificate and one valid ID.",
    contactInfo: "PSA Hotline: 8461-6000 | Website: philsys.gov.ph",
    website: "https://philsys.gov.ph",
    location: "Nationwide",
    isActive: true,
  },
  {
    name: "TESDA STEP (Special Training for Employment Program)",
    organization: "Technical Education and Skills Development Authority (TESDA)",
    category: "training",
    description: "Community-based training program that provides short-duration skills training (10-40 hours) to out-of-school youth, unemployed adults, and other disadvantaged groups.",
    eligibility: "Out-of-school youth, unemployed adults, indigenous peoples, persons with disabilities, and other disadvantaged groups. No educational requirement.",
    benefits: "Free short-term skills training, certificate of completion, improved employability, and access to job placement assistance.",
    howToApply: "Contact the nearest TESDA Provincial/District Office or accredited training institution. Registration is free and open year-round.",
    contactInfo: "TESDA Hotline: 8887-7777 | Website: tesda.gov.ph",
    website: "https://www.tesda.gov.ph",
    location: "Nationwide",
    isActive: true,
  },
];

async function seed() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log("Seeding programs...");
  
  for (const program of programs) {
    await conn.execute(
      `INSERT IGNORE INTO programs (name, organization, category, description, eligibility, benefits, howToApply, contactInfo, website, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = name`,
      [
        program.name,
        program.organization,
        program.category,
        program.description,
        program.eligibility,
        program.benefits,
        program.howToApply,
        program.contactInfo,
        program.website,
        program.isActive ? 1 : 0,
      ]
    );
    console.log(`  ✓ ${program.name}`);
  }
  
  await conn.end();
  console.log("Done seeding programs!");
}

seed().catch(console.error);
