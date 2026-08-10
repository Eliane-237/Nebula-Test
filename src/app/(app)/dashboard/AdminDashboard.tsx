'use client';

import { useRouter } from 'next/navigation';
import { BookOpen, CalendarDays, Clock3, GraduationCap, Layers, TrendingUp, Users } from 'lucide-react';
import { DOMAIN_COLOR, DOMAIN_LABEL, STATUS_CONFIG } from '@/lib/labels';

const AVATAR_BG = ['#4d8063', '#426f8d', '#8675a0', '#ac7041'];

function timeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtDay(d: Date | string)   { return new Date(d).getDate().toString().padStart(2, '0'); }
function fmtMonth(d: Date | string) { return new Date(d).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(); }
function fmtTime(d: Date | string)  { return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
function initials(name: string)     { return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(); }

type UpcomingSession   = { id: string; title: string; dateTime: Date | string; cohort: { program: { title: string } } };
type LatestEnrollment  = { id: string; enrolledAt: Date | string; user: { name: string }; cohort: { program: { title: string } } };
type ProgramRow        = { id: string; title: string; domain: string; status: string; coachName: string; cohortCount: number; totalEnrolled: number };

type AdminStats = {
  totalPrograms: number; publishedPrograms: number; activeCohorts: number;
  totalEnrollments: number; totalStudents: number; totalCoaches: number;
  upcomingSessions: UpcomingSession[]; latestEnrollments: LatestEnrollment[];
  allPrograms: ProgramRow[];
};

function KpiCard({ icon, label, value, sub, iconBg, iconColor }: {
  icon: React.ReactNode; label: string; value: number | string; sub: string;
  iconBg: string; iconColor: string;
}) {
  return (
    <div className="admin-kpi-card">
      <div className="admin-kpi-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <p className="kpi-label">{label}</p>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );
}

export default function AdminDashboard({ stats, name }: { stats: AdminStats | null; name: string }) {
  const router = useRouter();
  const s = stats;

  const kpis = [
    { icon: <BookOpen size={18} />, label: 'Total programs', value: s?.totalPrograms ?? '—', sub: `${s?.publishedPrograms ?? '—'} published`, iconBg: '#edf5f0', iconColor: '#3a8059' },
    { icon: <Layers size={18} />, label: 'Active cohorts', value: s?.activeCohorts ?? '—', sub: 'Running this month', iconBg: '#eaf2f9', iconColor: '#4470a0' },
    { icon: <TrendingUp size={18} />, label: 'Total enrollments', value: s?.totalEnrollments ?? '—', sub: 'Across all cohorts', iconBg: '#fdf0e2', iconColor: '#b07840' },
    { icon: <GraduationCap size={18} />, label: 'Students', value: s?.totalStudents ?? '—', sub: 'Active participants', iconBg: '#f1edf7', iconColor: '#7a67a0' },
    { icon: <Users size={18} />, label: 'Coaches', value: s?.totalCoaches ?? '—', sub: 'Platform coaches', iconBg: '#fce9e7', iconColor: '#a35550' },
  ];

  return (
    <div>
      <div className="welcome-row" style={{ marginBottom: 32 }}>
        <div>
          <p className="eyebrow">Administrator · {name}</p>
          <h1>Platform Overview</h1>
          <p className="welcome-subtitle">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · All data is live.
          </p>
        </div>
      </div>

      <div className="admin-kpi-grid" style={{ marginBottom: 36 }}>
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 40 }}>
        {/* Latest enrollments */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div><p className="eyebrow">Activity</p><h2>Latest enrollments</h2></div>
          </div>
          <div className="enroll-feed">
            {(s?.latestEnrollments ?? []).length === 0 ? (
              <p style={{ fontSize: 12, color: '#9aa4ab', padding: 16 }}>No enrollments yet.</p>
            ) : (s?.latestEnrollments ?? []).map((e, i) => (
              <div key={e.id} className="enroll-feed-row">
                <span className="avatar" style={{ background: AVATAR_BG[i % AVATAR_BG.length], width: 32, height: 32, borderRadius: 9, fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                  {initials(e.user.name)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="enroll-name">{e.user.name}</div>
                  <div className="enroll-prog">{e.cohort.program.title}</div>
                </div>
                <span className="enroll-time">{timeAgo(e.enrolledAt)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming sessions */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div><p className="eyebrow">Schedule</p><h2>Upcoming sessions</h2></div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            {(s?.upcomingSessions ?? []).length === 0 ? (
              <p style={{ fontSize: 12, color: '#9aa4ab', padding: 16 }}>No upcoming sessions.</p>
            ) : (s?.upcomingSessions ?? []).map((sess, i) => (
              <div key={sess.id} className="usession-row" style={{ background: i % 2 === 0 ? '#fff' : '#fafcfb' }}>
                <div className="usession-date">
                  <strong>{fmtDay(sess.dateTime)}</strong>
                  <span>{fmtMonth(sess.dateTime)}</span>
                </div>
                <div className="usession-info">
                  <strong>{sess.title}</strong>
                  <span><CalendarDays size={10} /> {sess.cohort.program.title}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#35424c' }}>{fmtTime(sess.dateTime)}</span>
                  <span style={{ fontSize: 9, color: '#9aa4ab' }}><Clock3 size={9} /> 45 min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All programs table */}
      <div>
        <div className="section-heading" style={{ marginBottom: 16 }}>
          <div><p className="eyebrow">Platform</p><h2>All programs ({(s?.allPrograms ?? []).length})</h2></div>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
          {(s?.allPrograms ?? []).length === 0 ? (
            <p style={{ fontSize: 12, color: '#9aa4ab', padding: 20 }}>No programs yet.</p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px 80px 80px', padding: '10px 18px', borderBottom: '1px solid var(--line)', fontSize: 10, fontWeight: 700, color: '#9aa4ab', textTransform: 'uppercase', letterSpacing: '.8px', gap: 8 }}>
                <span>Programme</span><span>Coach</span><span>Domaine</span><span>Statut</span><span>Cohortes</span><span>Inscrits</span>
              </div>
              {(s?.allPrograms ?? []).map((p, i) => {
                const sc    = STATUS_CONFIG[p.status] ?? { label: p.status, className: 'badge-draft' };
                const color = DOMAIN_COLOR[p.domain] ?? '#4d8063';
                const label = DOMAIN_LABEL[p.domain] ?? p.domain;
                return (
                  <div
                    key={p.id}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px 80px 80px', padding: '13px 18px', borderBottom: i < (s?.allPrograms ?? []).length - 1 ? '1px solid var(--line)' : 'none', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    onClick={() => router.push(`/coach/programs/${p.id}`)}
                  >
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#1e2d38', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                    <span style={{ fontSize: 11, color: '#6a7880', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.coachName}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}18`, padding: '2px 7px', borderRadius: 5, display: 'inline-block' }}>{label}</span>
                    <span className={`badge ${sc.className}`} style={{ fontSize: 9 }}>{sc.label}</span>
                    <span style={{ fontSize: 12, color: '#56616c', fontWeight: 600 }}>{p.cohortCount}</span>
                    <span style={{ fontSize: 12, color: '#56616c', fontWeight: 600 }}>{p.totalEnrolled}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
