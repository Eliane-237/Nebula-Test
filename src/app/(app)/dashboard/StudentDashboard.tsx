'use client';

import { ArrowUpRight, BookOpen, CalendarDays, Clock3, Compass, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DOMAIN_COLOR: Record<string, string> = {
  FINANCE: '#426f8d', DATA: '#4d8063', PRODUCT: '#6b5e9e',
  SOFTWARE_ENGINEERING: '#5c5098', CONSULTING: '#ac7041', MARKETING: '#a03d6b',
  ENTREPRENEURSHIP: '#7a5c38',
};

type Session = { id: string; title: string; dateTime: Date | string; order: number };
type Program = { id: string; title: string; domain: string; numSessions: number; coach: { name: string } };
type Cohort  = { startDate: Date | string; endDate: Date | string; sessions: Session[]; _count: { enrollments: number } };
type Enrollment = { id: string; cohort: Cohort & { program: Program } };
type UpcomingSession = {
  id: string; title: string; dateTime: Date | string;
  cohort: { program: { title: string } };
};

function fmtDay(d: Date | string)   { return new Date(d).getDate().toString().padStart(2, '0'); }
function fmtMonth(d: Date | string) { return new Date(d).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(); }
function fmtTime(d: Date | string)  { return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }

export default function StudentDashboard({
  name,
  enrollments,
  upcomingSessions,
}: {
  name:             string;
  enrollments:      Enrollment[];
  upcomingSessions: UpcomingSession[];
}) {
  const router = useRouter();
  const now = Date.now();

  const allSessions = enrollments.flatMap((e) => e.cohort.sessions);
  const completed   = allSessions.filter((s) => new Date(s.dateTime).getTime() < now).length;
  const thisWeek    = upcomingSessions.filter((s) => new Date(s.dateTime).getTime() < now + 7 * 86400000).length;

  const preview = enrollments.slice(0, 2);

  return (
    <div>
      <div className="welcome-row" style={{ marginBottom: 32 }}>
        <div>
          <p className="eyebrow">Student</p>
          <h1>Welcome back, {name}</h1>
          <p className="welcome-subtitle">
            {enrollments.length > 0
              ? `You have ${enrollments.length} active program${enrollments.length !== 1 ? 's' : ''} and ${upcomingSessions.length} upcoming session${upcomingSessions.length !== 1 ? 's' : ''}.`
              : 'Explore programs and enroll to get started.'}
          </p>
        </div>
        <button className="outline-button" onClick={() => router.push('/programs')}>
          <Compass size={13} /> Explore programs
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-icon stat-green"><BookOpen size={15} /></div>
          <div><p>Enrolled programs</p><strong>{enrollments.length}</strong><span>active</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-blue"><CalendarDays size={15} /></div>
          <div><p>Sessions this week</p><strong>{thisWeek}</strong><span>upcoming</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-orange"><TrendingUp size={15} /></div>
          <div><p>Sessions completed</p><strong>{completed}</strong><span>total</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-purple"><GraduationCap size={15} /></div>
          <div><p>Total sessions</p><strong>{allSessions.length}</strong><span>across programs</span></div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Programs preview */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div><p className="eyebrow">Programs</p><h2>Your programs</h2></div>
            <button className="ghost-button" onClick={() => router.push('/my-programs')}>
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          {preview.length === 0 ? (
            <div className="empty-state" style={{ border: '1px dashed var(--line)', borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 12, color: '#9aa4ab' }}>Not enrolled in any program yet.</p>
              <button className="primary-button" style={{ marginTop: 12, fontSize: 11 }} onClick={() => router.push('/programs')}>
                Browse catalog <ArrowUpRight size={11} />
              </button>
            </div>
          ) : (
            <div className="program-grid compact">
              {preview.map((e) => {
                const p = e.cohort.program;
                const color = DOMAIN_COLOR[p.domain] ?? '#426f8d';
                const cohortSessions = e.cohort.sessions;
                const done = cohortSessions.filter((s) => new Date(s.dateTime).getTime() < now).length;
                const pct  = p.numSessions > 0 ? Math.round((done / p.numSessions) * 100) : 0;
                return (
                  <div key={e.id} className="program-card" style={{ cursor: 'default' }}>
                    <div className="program-banner" style={{ background: `${color}22` }}>
                      <span className="category-pill" style={{ color, background: `${color}22` }}>
                        {p.domain.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="program-card-body">
                      <div className="program-card-heading"><h3>{p.title}</h3></div>
                      <div className="progress-bar-track" style={{ marginTop: 8 }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <div className="program-meta">
                        <span><Users size={11} /> {e.cohort._count.enrollments} enrolled</span>
                        <span><Clock3 size={11} /> {p.coach.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming sessions */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div><p className="eyebrow">Agenda</p><h2>Upcoming sessions</h2></div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            {upcomingSessions.length === 0 ? (
              <p style={{ fontSize: 12, color: '#9aa4ab', padding: 16 }}>No upcoming sessions.</p>
            ) : upcomingSessions.map((s, i) => (
              <div key={s.id} className="usession-row" style={{ background: i % 2 === 0 ? '#fff' : '#fafcfb' }}>
                <div className="usession-date">
                  <strong>{fmtDay(s.dateTime)}</strong>
                  <span>{fmtMonth(s.dateTime)}</span>
                </div>
                <div className="usession-info">
                  <strong>{s.title}</strong>
                  <span><Clock3 size={10} /> {s.cohort.program.title} · {fmtTime(s.dateTime)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
