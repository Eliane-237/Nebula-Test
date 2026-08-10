'use client';

import {
  ArrowUpRight, BookOpen, CalendarDays, Layers, TrendingUp,
  Users, GraduationCap, BarChart3, Clock3, Compass,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/user-context';
import { programs, upcomingSessions } from '@/data';

/* ── helpers ──────────────────────────────────────────────────── */

const DOMAIN_COLOR: Record<string, string> = {
  Finance: '#146138', Data: '#0E7C86', Product: '#2D5FB8',
  'Software Engineering': '#4A3FA6', Consulting: '#B8752D', Marketing: '#B23B6B',
};

const AVATAR_BG = ['#426f8d', '#4d8063', '#8675a0', '#ac7041'];

/* ── mock stats (replace with getAdminStats() when DB is live) ── */
const ADMIN_STATS = {
  totalPrograms: 6,
  publishedPrograms: 6,
  activeCohorts: 4,
  totalEnrollments: 84,
  totalStudents: 42,
  totalCoaches: 6,
};

const LATEST_ENROLLMENTS = [
  { id: 'e1', name: 'Alex Carter',    initials: 'AC', program: 'Investment Banking Analyst Immersion',    timeAgo: '12m ago',  color: AVATAR_BG[0] },
  { id: 'e2', name: 'Yuki Tanaka',    initials: 'YT', program: 'Data Analyst Bootcamp',                  timeAgo: '1h ago',   color: AVATAR_BG[1] },
  { id: 'e3', name: 'Priya Sharma',   initials: 'PS', program: 'Strategy Consulting Case Program',       timeAgo: '2h ago',   color: AVATAR_BG[2] },
  { id: 'e4', name: 'Marcus Chen',    initials: 'MC', program: 'Product Manager Case Practice',          timeAgo: '5h ago',   color: AVATAR_BG[3] },
  { id: 'e5', name: 'James Okafor',   initials: 'JO', program: 'Software Engineering Interview Simulation', timeAgo: '1d ago', color: AVATAR_BG[0] },
];

const UPCOMING_SESSIONS = [
  { id: 'u1', day: '12', month: 'AUG', title: 'Financial modelling basics',          program: 'IB Analyst Immersion',         time: '10:00' },
  { id: 'u2', day: '14', month: 'AUG', title: 'Valuation deep dive',                program: 'IB Analyst Immersion',         time: '16:00' },
  { id: 'u3', day: '18', month: 'AUG', title: 'SWE mock interview #2',              program: 'SWE Interview Simulation',     time: '11:00' },
  { id: 'u4', day: '20', month: 'AUG', title: 'Consulting case walkthrough',        program: 'Strategy Consulting Program',  time: '14:00' },
  { id: 'u5', day: '22', month: 'AUG', title: 'Problem framing — live session',     program: 'Data Analyst Bootcamp',        time: '10:00' },
];

/* ── KPI card ─────────────────────────────────────────────────── */
function KpiCard({
  icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="admin-kpi-card">
      <div className="admin-kpi-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <p className="kpi-label">{label}</p>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );
}

/* ── Admin view ───────────────────────────────────────────────── */
function AdminDashboard() {
  return (
    <div>
      <div className="welcome-row" style={{ marginBottom: 32 }}>
        <div>
          <p className="eyebrow">Administrator</p>
          <h1>Platform Overview</h1>
          <p className="welcome-subtitle">Today — Aug 10, 2026 · All data is live across all programs.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="admin-kpi-grid">
        <KpiCard icon={<BookOpen size={18} />}    label="Total programs"   value={ADMIN_STATS.totalPrograms}    sub={`${ADMIN_STATS.publishedPrograms} published`}    iconBg="#edf5f0" iconColor="#3a8059" />
        <KpiCard icon={<Layers size={18} />}      label="Active cohorts"   value={ADMIN_STATS.activeCohorts}    sub="Running this month"                               iconBg="#eaf2f9" iconColor="#4470a0" />
        <KpiCard icon={<TrendingUp size={18} />}  label="Total enrollments" value={ADMIN_STATS.totalEnrollments} sub="Across all cohorts"                             iconBg="#fdf0e2" iconColor="#b07840" />
        <KpiCard icon={<GraduationCap size={18} />} label="Students"       value={ADMIN_STATS.totalStudents}    sub="Active participants"                              iconBg="#f1edf7" iconColor="#7a67a0" />
        <KpiCard icon={<Users size={18} />}       label="Coaches"          value={ADMIN_STATS.totalCoaches}     sub="Across 6 domains"                                 iconBg="#fce9e7" iconColor="#a35550" />
        <KpiCard icon={<BarChart3 size={18} />}   label="Avg. coach rating" value="4.9"                         sub="Based on session feedback"                        iconBg="#edf5f0" iconColor="#3a8059" />
      </div>

      {/* Feeds */}
      <div className="dashboard-grid">
        {/* Latest enrollments */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <p className="eyebrow">Activity</p>
              <h2>Latest enrollments</h2>
            </div>
          </div>
          <div className="enroll-feed">
            {LATEST_ENROLLMENTS.map((e) => (
              <div key={e.id} className="enroll-feed-row">
                <span
                  className="avatar"
                  style={{ background: e.color, width: 32, height: 32, borderRadius: 9, fontSize: 10, fontWeight: 800, flexShrink: 0 }}
                >
                  {e.initials}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="enroll-name">{e.name}</div>
                  <div className="enroll-prog">{e.program}</div>
                </div>
                <span className="enroll-time">{e.timeAgo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming sessions */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <p className="eyebrow">Schedule</p>
              <h2>Upcoming sessions</h2>
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            {UPCOMING_SESSIONS.map((s) => (
              <div key={s.id} className="usession-row">
                <div className="usession-date">
                  <strong>{s.day}</strong>
                  <span>{s.month}</span>
                </div>
                <div className="usession-info">
                  <strong>{s.title}</strong>
                  <span><Clock3 size={10} /> {s.program} · {s.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Coach view ───────────────────────────────────────────────── */
function CoachDashboard() {
  const router = useRouter();
  const enrolled = programs.reduce((s, p) => s + p.enrolled, 0);

  return (
    <div>
      <div className="welcome-row" style={{ marginBottom: 32 }}>
        <div>
          <p className="eyebrow">Coach</p>
          <h1>Coach Dashboard</h1>
          <p className="welcome-subtitle">Welcome back — here's a quick look at your programs.</p>
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
            <strong>3</strong>
            <span>2 published</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-blue"><Layers size={15} /></div>
          <div>
            <p>Active cohorts</p>
            <strong>3</strong>
            <span>running now</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-orange"><GraduationCap size={15} /></div>
          <div>
            <p>Enrolled students</p>
            <strong>29</strong>
            <span>across cohorts</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <p className="eyebrow">Your programs</p>
              <h2>Active programs</h2>
            </div>
            <button className="ghost-button" onClick={() => router.push('/coach/programs')}>
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="program-grid compact">
            {programs.slice(0, 2).map((p) => {
              const color = DOMAIN_COLOR[p.category] ?? '#426f8d';
              return (
                <div key={p.id} className="program-card" style={{ cursor: 'default' }}>
                  <div className="program-banner" style={{ background: `${color}22` }}>
                    <span className="category-pill" style={{ color, background: `${color}22` }}>{p.category}</span>
                    <div className="banner-art">
                      <span style={{ color, opacity: .5, font: '500 23px DM Mono, monospace' }}>
                        {String(p.sessions).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                  <div className="program-card-body">
                    <div className="program-card-heading">
                      <h3>{p.title}</h3>
                      <span className="badge badge-published">Live</span>
                    </div>
                    <div className="program-meta">
                      <span><Users size={11} /> {p.enrolled}/{p.capacity}</span>
                      <span><CalendarDays size={11} /> {p.sessions} sessions</span>
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
        </div>

        {/* Upcoming sessions */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <p className="eyebrow">Schedule</p>
              <h2>Upcoming sessions</h2>
            </div>
          </div>
          <div className="session-list">
            {upcomingSessions.map((s) => (
              <div key={s.id} className="session-row">
                <div className="date-block">
                  <strong>{s.date === 'Today' ? '★' : s.date === 'Tomorrow' ? '↑' : s.date.split(' ')[1]}</strong>
                  <span>{s.date === 'Today' ? 'TODAY' : s.date === 'Tomorrow' ? 'TMW' : s.date.split(' ')[0]}</span>
                </div>
                <div className="session-info">
                  <strong>{s.title}</strong>
                  <span>{s.program} · {s.time}</span>
                </div>
                <span className={`badge badge-${s.type === 'Workshop' ? 'blue' : s.type === 'Feedback' ? 'orange' : 'green'}`}>
                  {s.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Student view ─────────────────────────────────────────────── */
function StudentDashboard() {
  const router = useRouter();

  return (
    <div>
      <div className="welcome-row" style={{ marginBottom: 32 }}>
        <div>
          <p className="eyebrow">Student</p>
          <h1>Welcome back</h1>
          <p className="welcome-subtitle">You have 1 active program and 3 upcoming sessions.</p>
        </div>
        <button className="outline-button" onClick={() => router.push('/programs')}>
          <Compass size={13} /> Explore programs
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-icon stat-green"><BookOpen size={15} /></div>
          <div><p>Enrolled programs</p><strong>2</strong><span>1 active</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-blue"><CalendarDays size={15} /></div>
          <div><p>Sessions this week</p><strong>3</strong><span>next: today</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-orange"><TrendingUp size={15} /></div>
          <div><p>Sessions completed</p><strong>6</strong><span>2 programs</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-purple"><GraduationCap size={15} /></div>
          <div><p>Explorations</p><strong>2</strong><span>pending</span></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <p className="eyebrow">Programs</p>
              <h2>Your programs</h2>
            </div>
            <button className="ghost-button" onClick={() => router.push('/my-programs')}>
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="program-grid compact">
            {programs.slice(0, 2).map((p) => {
              const color = DOMAIN_COLOR[p.category] ?? '#426f8d';
              return (
                <div key={p.id} className="program-card" style={{ cursor: 'default' }}>
                  <div className="program-banner" style={{ background: `${color}22` }}>
                    <span className="category-pill" style={{ color, background: `${color}22` }}>{p.category}</span>
                    <div className="banner-art">
                      <span style={{ color, opacity: .5, font: '500 23px DM Mono, monospace' }}>
                        {String(p.sessions).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                  <div className="program-card-body">
                    <div className="program-card-heading">
                      <h3>{p.title}</h3>
                    </div>
                    <div className="progress-bar-track" style={{ marginTop: 8 }}>
                      <div className="progress-bar-fill" style={{ width: '50%', background: color }} />
                    </div>
                    <div className="program-meta">
                      <span><Clock3 size={11} /> {p.duration}</span>
                      <span><Users size={11} /> {p.coach}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <p className="eyebrow">Agenda</p>
              <h2>Upcoming sessions</h2>
            </div>
          </div>
          <div className="session-list">
            {upcomingSessions.map((s) => (
              <div key={s.id} className="session-row">
                <div className="date-block">
                  <strong>{s.date === 'Today' ? '★' : s.date === 'Tomorrow' ? '↑' : s.date.split(' ')[1]}</strong>
                  <span>{s.date === 'Today' ? 'TODAY' : s.date === 'Tomorrow' ? 'TMW' : s.date.split(' ')[0]}</span>
                </div>
                <div className="session-info">
                  <strong>{s.title}</strong>
                  <span>{s.program} · {s.time}</span>
                </div>
                <span className={`badge badge-${s.type === 'Workshop' ? 'blue' : s.type === 'Feedback' ? 'orange' : 'green'}`}>
                  {s.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page entry ───────────────────────────────────────────────── */
export default function DashboardPage() {
  const { role } = useUser();

  if (role === 'admin')  return <AdminDashboard />;
  if (role === 'coach')  return <CoachDashboard />;
  return <StudentDashboard />;
}
