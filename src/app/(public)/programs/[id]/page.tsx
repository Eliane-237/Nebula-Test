import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock3, Users } from 'lucide-react';
import Link from 'next/link';
import { getProgramWithCohorts } from '@/app/actions/programsQueries';
import { getSession } from '@/lib/session';
import { CohortList } from './CohortList';

const DOMAIN_COLOR: Record<string, string> = {
  Finance: '#146138', Data: '#0E7C86', Product: '#2D5FB8',
  'Software Engineering': '#4A3FA6', Consulting: '#B8752D', Marketing: '#B23B6B',
};

export default async function PublicProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [program, session] = await Promise.all([
    getProgramWithCohorts(id),
    getSession(),
  ]);

  if (!program) notFound();

  const color       = DOMAIN_COLOR[program.domain] ?? '#146138';
  const isLoggedIn  = !!session;
  const isStudent   = session?.role === 'student';

  const totalEnrolled = program.cohorts.reduce((s, c) => s + c.enrolled, 0);
  const totalCapacity = program.cohorts.reduce((s, c) => s + c.capacity, 0);
  const spotsLeft     = Math.max(totalCapacity - totalEnrolled, 0);

  return (
    <div className="detail-shell">
      <Link href="/programs" className="detail-back">
        <ArrowLeft size={15} /> Back to programs
      </Link>

      {/* Banner */}
      <div className="detail-hero" style={{ background: color }}>
        <div className="banner-art" style={{ width: 200, height: 200, right: 60, bottom: -60 }}>
          <span style={{ font: '500 40px DM Mono, monospace', opacity: .35, color: '#fff' }}>
            {program.numSessions.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="detail-hero-content">
          <span className="category-pill" style={{ marginBottom: 10, display: 'inline-block', background: 'rgba(255,255,255,.22)', color: '#fff' }}>
            {program.domain}
          </span>
          <h1 style={{ color: '#fff', margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: '-0.5px', lineHeight: 1.2, fontFamily: "'Fraunces', Georgia, serif" }}>
            {program.title}
          </h1>
        </div>
      </div>

      <div className="detail-layout">
        {/* ── Main ── */}
        <div className="detail-main">
          <div className="detail-section">
            <h2>About this program</h2>
            <p>{program.description}</p>
            <div className="detail-program-meta">
              <span><Clock3 size={14} /> {program.numSessions * 2} weeks</span>
              <span><Users size={14} /> {program.numSessions} sessions · 45 min each</span>
              <span><Users size={14} /> Up to {program.maxCohortSize} participants per cohort</span>
            </div>
          </div>

          {program.learningOutcomes.length > 0 && (
            <div className="detail-section">
              <h2>What you'll learn</h2>
              <ul className="outcomes-list">
                {program.learningOutcomes.map((o, i) => (
                  <li key={i}>
                    <span className="outcome-check" style={{ background: '#e8f5ec', color }}>
                      <CheckCircle2 size={11} />
                    </span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <CohortList
            cohorts={program.cohorts}
            programId={program.id}
            numSessions={program.numSessions}
            isLoggedIn={isLoggedIn}
            isStudent={isStudent}
          />
        </div>

        {/* ── Sidebar ── */}
        <div className="detail-sidebar">
          <div className="sidebar-cta">
            <div className="sidebar-cta-banner" style={{ background: `linear-gradient(135deg, ${color}dd, ${color})` }}>
              <div className="sidebar-cta-banner-copy">
                <p>Led by</p>
                <strong>{program.coach}</strong>
              </div>
              <span className="avatar" style={{ width: 44, height: 44, borderRadius: 12, fontSize: 13, flexShrink: 0, background: 'rgba(255,255,255,.25)', color: '#fff' }}>
                {program.coachInitials}
              </span>
            </div>
            <div className="sidebar-cta-body">
              <div className="sidebar-cta-stats">
                <div className="sidebar-cta-stat">
                  <strong>{totalEnrolled}</strong>
                  <span>enrolled</span>
                </div>
                <div className="sidebar-cta-stat">
                  <strong>{spotsLeft}</strong>
                  <span>spots left</span>
                </div>
                <div className="sidebar-cta-stat">
                  <strong>{program.numSessions}</strong>
                  <span>sessions</span>
                </div>
                <div className="sidebar-cta-stat">
                  <strong>45m</strong>
                  <span>per session</span>
                </div>
              </div>
              <div className="sidebar-info">
                <Clock3 size={13} /> {program.difficulty} · {program.numSessions * 2} weeks
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
