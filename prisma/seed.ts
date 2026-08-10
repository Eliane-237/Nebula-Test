import {
  PrismaClient,
  Role,
  Domain,
  Difficulty,
  ProgramStatus,
  CohortStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { createHash } from 'crypto';
import 'dotenv/config';

const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

function hash(password: string): string {
  return createHash('sha256')
    .update(password + (process.env.PW_SALT ?? 'nebula-salt'))
    .digest('hex');
}

async function main() {
  // ── Cleanup ─────────────────────────────────────────────────────────────
  await prisma.enrollment.deleteMany();
  await prisma.session.deleteMany();
  await prisma.cohort.deleteMany();
  await prisma.exploration.deleteMany();
  await prisma.program.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ────────────────────────────────────────────────────────────────
  const student = await prisma.user.create({
    data: {
      email: 'student@nebula.com',
      name: 'Alex Carter',
      passwordHash: hash('student123'),
      role: Role.STUDENT,
      bio: 'Final-year business student exploring finance and consulting careers.',
    },
  });

  const coach1 = await prisma.user.create({
    data: {
      email: 'coach@nebula.com',
      name: 'Maya Thompson',
      passwordHash: hash('coach123'),
      role: Role.COACH,
      bio: 'Former investment banking associate. 8 years in M&A at a bulge-bracket bank.',
    },
  });

  const coach2 = await prisma.user.create({
    data: {
      email: 'ravi@nebula.com',
      name: 'Ravi Kapoor',
      passwordHash: hash('coach123'),
      role: Role.COACH,
      bio: 'Data scientist turned educator. Ex-Google, ex-McKinsey analytics.',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@nebula.com',
      name: 'Alicia Davis',
      passwordHash: hash('admin123'),
      role: Role.ADMIN,
    },
  });

  // ── Programs ─────────────────────────────────────────────────────────────
  const ibProgram = await prisma.program.create({
    data: {
      title: 'Investment Banking Analyst Immersion',
      description:
        'Build confidence in financial modelling and learn how analysts think through live deal situations. Designed for students targeting bulge-bracket and boutique roles.',
      domain: Domain.FINANCE,
      difficulty: Difficulty.INTERMEDIATE,
      targetAudience: 'Final-year students and early-career professionals',
      numSessions: 4,
      recommendedSize: 12,
      maxCohortSize: 20,
      learningOutcomes: [
        'Structure a credit risk or leveraged buyout analysis from scratch',
        'Read and interpret financial models like a junior analyst',
        'Navigate a live deal situation under time pressure',
        'Communicate findings confidently to senior stakeholders',
      ],
      status: ProgramStatus.PUBLISHED,
      coachId: coach1.id,
      explorations: {
        create: [
          {
            title: 'LBO Model — Retail Co.',
            description: 'Build a simplified 3-statement LBO model for a fictional retail acquisition.',
          },
          {
            title: 'Pitch deck critique',
            description: 'Review a real M&A pitchbook excerpt and write a 1-page executive summary.',
          },
        ],
      },
    },
  });

  const dataProgram = await prisma.program.create({
    data: {
      title: 'Data Analyst Bootcamp',
      description:
        'Turn messy business questions into clear analysis, useful insights and confident recommendations. Hands-on SQL and visualisation throughout.',
      domain: Domain.DATA,
      difficulty: Difficulty.BEGINNER,
      targetAudience: 'Students looking to break into data analytics or data science',
      numSessions: 4,
      recommendedSize: 10,
      maxCohortSize: 16,
      learningOutcomes: [
        'Translate messy business questions into clean analytical scope',
        'Build and interpret queries for insight extraction',
        'Create clear, stakeholder-ready data presentations',
        'Identify patterns and make confident data-driven recommendations',
      ],
      status: ProgramStatus.PUBLISHED,
      coachId: coach2.id,
    },
  });

  const consultingProgram = await prisma.program.create({
    data: {
      title: 'Strategy Consulting Case Program',
      description:
        'Crack ambiguous business problems using structured consulting frameworks and live case practice. Includes written and oral delivery.',
      domain: Domain.CONSULTING,
      difficulty: Difficulty.INTERMEDIATE,
      targetAudience: 'Students targeting MBB and tier-2 consulting firms',
      numSessions: 3,
      recommendedSize: 8,
      maxCohortSize: 16,
      learningOutcomes: [
        'Structure ambiguous business problems using consulting frameworks',
        'Run a hypothesis-driven analysis like a day-1 consultant',
        'Build and deliver a concise executive slide',
        'Handle challenging questions from senior stakeholders',
      ],
      status: ProgramStatus.PUBLISHED,
      coachId: coach1.id,
    },
  });

  // Draft program — not visible in the public catalogue
  await prisma.program.create({
    data: {
      title: 'Product Manager Case Practice',
      description:
        'Practice the product sense, analytics and communication skills that hiring teams look for at top tech companies.',
      domain: Domain.PRODUCT,
      difficulty: Difficulty.INTERMEDIATE,
      numSessions: 3,
      recommendedSize: 10,
      maxCohortSize: 20,
      learningOutcomes: [
        'Break down ambiguous product problems with a clear framework',
        'Apply product sense and data reasoning in case interviews',
        'Design metrics and experiments for a new product feature',
      ],
      status: ProgramStatus.DRAFT,
      coachId: coach1.id,
    },
  });

  // ── Cohorts ──────────────────────────────────────────────────────────────
  const ibCohortOpen = await prisma.cohort.create({
    data: {
      programId: ibProgram.id,
      startDate: new Date('2026-08-12'),
      endDate: new Date('2026-09-09'),
      maxParticipants: 20,
      status: CohortStatus.OPEN,
      sessions: {
        create: [
          { title: 'Financial modelling basics',   dateTime: new Date('2026-08-12T10:00:00Z'), duration: 45, order: 1 },
          { title: 'Valuation deep dive',           dateTime: new Date('2026-08-22T10:00:00Z'), duration: 45, order: 2 },
          { title: 'Deal analysis workshop',         dateTime: new Date('2026-09-01T10:00:00Z'), duration: 45, order: 3 },
          { title: 'Feedback & career discussion',  dateTime: new Date('2026-09-09T10:00:00Z'), duration: 45, order: 4 },
        ],
      },
    },
  });

  // Full cohort — no more spots available
  const ibCohortFull = await prisma.cohort.create({
    data: {
      programId: ibProgram.id,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-29'),
      maxParticipants: 12,
      status: CohortStatus.FULL,
      sessions: {
        create: [
          { title: 'Kick-off & financial literacy',  dateTime: new Date('2026-07-01T10:00:00Z'), duration: 45, order: 1 },
          { title: 'DCF modelling practice',          dateTime: new Date('2026-07-11T10:00:00Z'), duration: 45, order: 2 },
          { title: 'M&A case simulation',             dateTime: new Date('2026-07-20T10:00:00Z'), duration: 45, order: 3 },
          { title: 'Debrief & career Q&A',            dateTime: new Date('2026-07-29T10:00:00Z'), duration: 45, order: 4 },
        ],
      },
    },
  });

  const dataCohort = await prisma.cohort.create({
    data: {
      programId: dataProgram.id,
      startDate: new Date('2026-08-18'),
      endDate: new Date('2026-09-08'),
      maxParticipants: 16,
      status: CohortStatus.OPEN,
      sessions: {
        create: [
          { title: 'Business problem framing',       dateTime: new Date('2026-08-18T10:00:00Z'), duration: 45, order: 1 },
          { title: 'SQL fundamentals for analysts',  dateTime: new Date('2026-08-25T10:00:00Z'), duration: 45, order: 2 },
          { title: 'Data storytelling & charts',     dateTime: new Date('2026-09-01T10:00:00Z'), duration: 45, order: 3 },
          { title: 'Final presentation workshop',    dateTime: new Date('2026-09-08T10:00:00Z'), duration: 45, order: 4 },
        ],
      },
    },
  });

  const consultingCohort = await prisma.cohort.create({
    data: {
      programId: consultingProgram.id,
      startDate: new Date('2026-08-20'),
      endDate: new Date('2026-09-03'),
      maxParticipants: 12,
      status: CohortStatus.OPEN,
      sessions: {
        create: [
          { title: 'Framework fundamentals',   dateTime: new Date('2026-08-20T14:00:00Z'), duration: 45, order: 1 },
          { title: 'Live case simulation',      dateTime: new Date('2026-08-27T14:00:00Z'), duration: 45, order: 2 },
          { title: 'Slide delivery & feedback', dateTime: new Date('2026-09-03T14:00:00Z'), duration: 45, order: 3 },
        ],
      },
    },
  });

  // ── Enrollments ──────────────────────────────────────────────────────────
  // Alex (student) is enrolled in the open IB cohort
  await prisma.enrollment.create({
    data: { userId: student.id, cohortId: ibCohortOpen.id },
  });

  // Also in the consulting cohort
  await prisma.enrollment.create({
    data: { userId: student.id, cohortId: consultingCohort.id },
  });

  // ── Log ──────────────────────────────────────────────────────────────────
  console.log('\n---------------------- Seed complete! ----------------------\n');
  console.log('-----------------  Test accounts -------------------:');
  console.log(`   student  →  student@nebula.com  /  student123  (id: ${student.id})`);
  console.log(`   coach    →  coach@nebula.com    /  coach123    (id: ${coach1.id})`);
  console.log(`   admin    →  admin@nebula.com    /  admin123    (id: ${admin.id})`);
  console.log('\n-------------------  Created: -------------------\n');
  console.log(`   4 programs  (3 published, 1 draft)`);
  console.log(`   4 cohorts   (3 open, 1 full)`);
  console.log(`   14 sessions`);
  console.log(`   2 enrollments for Alex Carter\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
