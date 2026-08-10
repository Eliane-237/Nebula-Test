'use client';

import { ArrowUpRight, BookOpen, CalendarDays, Clock3, GraduationCap, Layers, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DOMAIN_COLOR: Record<string, string> = {
  FINANCE: '#146138', DATA: '#0E7C86', PRODUCT: '#2D5FB8',
  SOFTWARE_ENGINEERING: '#4A3FA6', CONSULTING: '#B8752D',
  MARKETING: '#B23B6B', ENTREPRENEURSHIP: '#7a5c38',
};

function fmtDay(d: Date | string)   { return new Date(d).getDate().toString().padStart(2, '0'); }
function fmtMonth(d: Date | string) { return new Date(d).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(); }
function fmtTime(d: Date | string)  { return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }

type CoachProgram = {
  id: string; title: string; domain: string; numSessions: number;
  status: string; cohortCount: number; totalEnrolled: number;
};
type UpcomingSession = {
  id: string; title: string; dateTime: Date | string;
  cohort: { program: { title: string } };
};

export default function CoachDashboard({
  name,
  programs,
  sessions,
}: {
  name:     string;
  programs: CoachProgram[];
  sessions: UpcomingSession[];
}) {
  const router = useRouter();

  const stats = {
    published:    programs.filter((p) => p.status === 'PUBLISHED').length,
    activeCohorts: programs.reduce((s, p) => s + p.cohortCount, 0),
    totalEnrolled: programs.reduce((s, p) => s + p.totalEnrolled, 0),
  };

  const preview = programs.slice(0, 2);

  return (
    <div>
      <div className="welcome-row" style={{ marginBottom: 32 }}>
        <div>
          <p className="eyebrow">Coach</p>
          <h1>Coach Dashboard</h1>
          <p className="welcome-subtitle">Welcome back, {name} — here's a look at your programs.</p>
        </div>
        <button className="primary-button" onClick={() => router.push('/coach/programs/new')}>
          <BookOpen size={13} /> New program
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-icon stat-green"><BookOpen size={15} /></div>
          <div>
            <p>My programs</p>
            <strong>{programs.length}</strong>
            <span>{stats.published} published</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-blue"><Layers size={15} /></div>
          <div>
            <p>Active cohorts</p>
            <strong>{stats.activeCohorts}</strong>
            <span>running now</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-orange"><GraduationCap size={15} /></div>
          <div>
            <p>Enrolled students</p>
            <strong>{stats.totalEnrolled}</strong>
            <span>across cohorts</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Active programs preview */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div><p className="eyebrow">Your programs</p><h2>Active programs</h2></div>
            <button className="ghost-button" onClick={() => router.push('/coach/programs')}>
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          {preview.length === 0 ? (
            <div className="empty-state" style={{ border: '1px dashed var(--line)', borderRadius: 12, padding: 24 }}>
              <p style={{ fontSize: 12, color: '#9aa4ab' }}>No programs yet. Create your first one!</p>
            </div>
          ) : (
            <div className="program-grid compact">
              {preview.map((p) => {
                const color = DOMAIN_COLOR[p.domain] ?? '#426f8d';
                return (
                  <div key={p.id} className="program-card" style={{ cursor: 'default' }}>
                    <div className="program-banner" style={{ background: `${color}22` }}>
                      <span className="category-pill" style={{ color, background: `${color}22` }}>
                        {p.domain.replace(/_/g, ' ')}
                      </span>
                      <div className="banner-art">
                        <span style={{ color, opacity: .5, font: '500 23px DM Mono, monospace' }}>
                          {String(p.numSessions).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    <div className="program-card-body">
                      <div className="program-card-heading">
                        <h3>{p.title}</h3>
                        <span className={`badge ${p.status === 'PUBLISHED' ? 'badge-published' : 'badge-draft'}`}>
                          {p.status === 'PUBLISHED' ? 'Live' : 'Draft'}
                        </span>
                      </div>
                      <div className="program-meta">
                        <span><Users size={11} /> {p.totalEnrolled} enrolled</span>
                        <span><CalendarDays size={11} /> {p.numSessions} sessions</span>
                      </div>
                      <div className="coach-row">
                        <button className="text-button" style={{ marginLeft: 0 }} onClick={() => router.push('/coach/programs')}>
                          Manage <ArrowUpRight size={10} />
                        </button>
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
            <div><p className="eyebrow">Schedule</p><h2>Upcoming sessions</h2></div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            {sessions.length === 0 ? (
              <p style={{ fontSize: 12, color: '#9aa4ab', padding: 16 }}>No upcoming sessions.</p>
            ) : sessions.map((s, i) => (
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
