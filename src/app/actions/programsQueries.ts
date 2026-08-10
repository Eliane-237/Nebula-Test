'use server';

import { prisma } from '@/lib/prisma';

/* ── Display maps ─────────────────────────────────────────────── */
const DOMAIN_DISPLAY: Record<string, string> = {
  FINANCE: 'Finance', DATA: 'Data', PRODUCT: 'Product',
  SOFTWARE_ENGINEERING: 'Software Engineering',
  CONSULTING: 'Consulting', MARKETING: 'Marketing',
};

const DIFF_DISPLAY: Record<string, string> = {
  BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced',
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Types ────────────────────────────────────────────────────── */
export type ProgramSummary = {
  id: string;
  title: string;
  description: string;
  domain: string;
  coach: string;
  coachInitials: string;
  numSessions: number;
  maxCohortSize: number;
  difficulty: string;
  totalEnrolled: number;
  nextCohortStart: string | null;
  openSpotsTotal: number;
};

export type CohortSummary = {
  id: string;
  startDate: string;
  endDate: string;
  enrolled: number;
  capacity: number;
  status: string;
};

export type ProgramDetail = {
  id: string;
  title: string;
  description: string;
  domain: string;
  coach: string;
  coachInitials: string;
  numSessions: number;
  maxCohortSize: number;
  difficulty: string;
  learningOutcomes: string[];
  cohorts: CohortSummary[];
};

/* ── Mock fallback data ───────────────────────────────────────── */
const MOCK_CATALOG: ProgramSummary[] = [
  { id: 'ib-analyst', title: 'Investment Banking Analyst Immersion', description: 'Build confidence in financial modelling and learn how analysts think through live deal situations.', domain: 'Finance', coach: 'Maya Thompson', coachInitials: 'MT', numSessions: 4, maxCohortSize: 20, difficulty: 'Intermediate', totalEnrolled: 16, nextCohortStart: 'Aug 12, 2026', openSpotsTotal: 4 },
  { id: 'product-case', title: 'Product Manager Case Practice', description: 'Practice the product sense, analytics and communication skills that hiring teams look for.', domain: 'Product', coach: 'Sofia Lange', coachInitials: 'SL', numSessions: 3, maxCohortSize: 20, difficulty: 'Intermediate', totalEnrolled: 14, nextCohortStart: 'Aug 4, 2026', openSpotsTotal: 6 },
  { id: 'data-bootcamp', title: 'Data Analyst Bootcamp', description: 'Turn messy business questions into clear analysis, useful insights and confident recommendations.', domain: 'Data', coach: 'Ravi Kapoor', coachInitials: 'RK', numSessions: 4, maxCohortSize: 16, difficulty: 'Beginner', totalEnrolled: 14, nextCohortStart: 'Jul 1, 2026', openSpotsTotal: 2 },
  { id: 'risk-immersion', title: 'Quantitative Risk Analyst Immersion', description: 'Explore risk frameworks and build a practical point of view through guided case work.', domain: 'Finance', coach: 'Daniel Eyo', coachInitials: 'DE', numSessions: 4, maxCohortSize: 20, difficulty: 'Advanced', totalEnrolled: 20, nextCohortStart: 'Sep 2, 2026', openSpotsTotal: 0 },
  { id: 'consulting-case', title: 'Consulting Case Accelerator', description: 'Structure and crack consulting case interviews with frameworks used by MBB insiders.', domain: 'Consulting', coach: 'Amara Bello', coachInitials: 'AB', numSessions: 3, maxCohortSize: 12, difficulty: 'Intermediate', totalEnrolled: 9, nextCohortStart: 'Jul 20, 2026', openSpotsTotal: 3 },
  { id: 'swe-interview', title: 'SWE Interview Intensive', description: 'Ace FAANG-style interviews with real mock sessions, DSA walkthroughs, and system design coaching.', domain: 'Software Engineering', coach: 'Ivan Petrov', coachInitials: 'IP', numSessions: 4, maxCohortSize: 10, difficulty: 'Advanced', totalEnrolled: 5, nextCohortStart: 'Aug 18, 2026', openSpotsTotal: 5 },
];

const MOCK_OUTCOMES: Record<string, string[]> = {
  'ib-analyst': ['Structure a credit risk or leveraged buyout analysis from scratch', 'Read and interpret financial models like a junior analyst', 'Navigate a live deal situation under time pressure', 'Communicate findings confidently to senior stakeholders'],
  'product-case': ['Break down ambiguous product problems with a clear framework', 'Apply product sense and data reasoning in case interviews', 'Craft a compelling product narrative under pressure', 'Prioritize features using structured trade-off analysis'],
  'data-bootcamp': ['Translate messy business questions into clean analytical scope', 'Build and interpret queries for insight extraction', 'Create clear, stakeholder-ready data presentations', 'Identify patterns and make confident data-driven recommendations'],
  'risk-immersion': ['Apply quantitative frameworks to real risk scenarios', 'Build practical intuition for market and credit risk', 'Present risk assessments to non-technical audiences', 'Evaluate risk-adjusted returns in portfolio decisions'],
  'consulting-case': ['Structure ambiguous business problems using consulting frameworks', 'Run a hypothesis-driven analysis like a day-1 consultant', 'Build and deliver a concise executive slide', 'Handle challenging questions from senior stakeholders'],
  'swe-interview': ['Solve algorithmic problems clearly under time pressure', 'Design scalable systems with trade-off reasoning', 'Communicate technical decisions to interviewers', 'Walk through real mock interviews with practising engineers'],
};

const MOCK_COHORTS: Record<string, CohortSummary[]> = {
  'ib-analyst':      [{ id: 'mock-ib-c1', startDate: 'Aug 12, 2026', endDate: 'Sep 9, 2026',   enrolled: 8,  capacity: 16, status: 'OPEN' }, { id: 'mock-ib-c2', startDate: 'Sep 15, 2026', endDate: 'Oct 13, 2026', enrolled: 3, capacity: 16, status: 'OPEN' }],
  'product-case':    [{ id: 'mock-pm-c1', startDate: 'Aug 4, 2026',  endDate: 'Aug 25, 2026',  enrolled: 14, capacity: 20, status: 'OPEN' }],
  'data-bootcamp':   [{ id: 'mock-da-c1', startDate: 'Jul 1, 2026',  endDate: 'Jul 15, 2026',  enrolled: 14, capacity: 16, status: 'OPEN' }],
  'risk-immersion':  [{ id: 'mock-ri-c1', startDate: 'Sep 2, 2026',  endDate: 'Sep 30, 2026',  enrolled: 20, capacity: 20, status: 'FULL' }],
  'consulting-case': [{ id: 'mock-cc-c1', startDate: 'Jul 20, 2026', endDate: 'Aug 10, 2026',  enrolled: 9,  capacity: 12, status: 'OPEN' }],
  'swe-interview':   [{ id: 'mock-sw-c1', startDate: 'Aug 18, 2026', endDate: 'Sep 15, 2026',  enrolled: 5,  capacity: 10, status: 'OPEN' }],
};

/* ── Queries ──────────────────────────────────────────────────── */
export async function getPublishedPrograms(): Promise<ProgramSummary[]> {
  try {
    const rows = await prisma.program.findMany({
      where:   { status: 'PUBLISHED' },
      include: {
        coach:  { select: { name: true } },
        cohorts: {
          where:   { status: 'OPEN' },
          include: { _count: { select: { enrollments: true } } },
          orderBy: { startDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((p) => {
      const first     = p.cohorts[0];
      const openSpots = p.cohorts.reduce((s, c) => s + (c.maxParticipants - c._count.enrollments), 0);
      const enrolled  = p.cohorts.reduce((s, c) => s + c._count.enrollments, 0);
      return {
        id:             p.id,
        title:          p.title,
        description:    p.description,
        domain:         DOMAIN_DISPLAY[p.domain] ?? p.domain,
        coach:          p.coach.name,
        coachInitials:  initials(p.coach.name),
        numSessions:    p.numSessions,
        maxCohortSize:  p.maxCohortSize,
        difficulty:     DIFF_DISPLAY[p.difficulty] ?? p.difficulty,
        totalEnrolled:  enrolled,
        nextCohortStart: first ? fmtDate(first.startDate) : null,
        openSpotsTotal:  openSpots,
      };
    });
  } catch {
    return MOCK_CATALOG;
  }
}

export async function getProgramWithCohorts(id: string): Promise<ProgramDetail | null> {
  try {
    const p = await prisma.program.findUnique({
      where:   { id },
      include: {
        coach:  { select: { name: true } },
        cohorts: {
          where:   { status: { in: ['OPEN', 'FULL'] } },
          include: { _count: { select: { enrollments: true } } },
          orderBy: { startDate: 'asc' },
        },
      },
    });
    if (!p || p.status !== 'PUBLISHED') throw new Error('not found');

    return {
      id:              p.id,
      title:           p.title,
      description:     p.description,
      domain:          DOMAIN_DISPLAY[p.domain] ?? p.domain,
      coach:           p.coach.name,
      coachInitials:   initials(p.coach.name),
      numSessions:     p.numSessions,
      maxCohortSize:   p.maxCohortSize,
      difficulty:      DIFF_DISPLAY[p.difficulty] ?? p.difficulty,
      learningOutcomes: p.learningOutcomes,
      cohorts: p.cohorts.map((c) => ({
        id:        c.id,
        startDate: fmtDate(c.startDate),
        endDate:   fmtDate(c.endDate),
        enrolled:  c._count.enrollments,
        capacity:  c.maxParticipants,
        status:    c.status,
      })),
    };
  } catch {
    const mock = MOCK_CATALOG.find((p) => p.id === id);
    if (!mock) return null;
    return {
      ...mock,
      learningOutcomes: MOCK_OUTCOMES[id] ?? [],
      cohorts:          MOCK_COHORTS[id]  ?? [],
    };
  }
}
