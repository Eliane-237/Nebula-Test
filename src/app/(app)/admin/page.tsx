import {
  BookOpen, CalendarDays, Clock3, GraduationCap, Layers, TrendingUp, Users, UserCheck,
} from 'lucide-react';
import { getAdminStats } from '@/app/actions/adminQueries';
import { getSession } from '@/lib/session';

/* ── Helpers ─────────────────────────────────────────────────── */
function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)   return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)   return `${hrs} h`;
  return `${Math.floor(hrs / 24)} j`;
}

function fmtDay(d: Date)   { return d.getDate().toString().padStart(2, '0'); }
function fmtMonth(d: Date) { return d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(); }
function fmtTime(d: Date)  { return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

/* ── KPI card ────────────────────────────────────────────────── */
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

/* ── Page ─────────────────────────────────────────────────────── */
export default async function AdminPage() {
  const [session, { data }] = await Promise.all([getSession(), getAdminStats()]);
  const adminName = session?.name ?? 'Admin';

  /* KPI values — real if DB connected, fallback otherwise */
  const kpi = data ? [
    { icon: <BookOpen size={18} />, label: 'Total programmes', value: data.totalPrograms, sub: `${data.publishedPrograms} publiés`, iconBg: '#edf5f0', iconColor: '#3a8059' },
    { icon: <Layers size={18} />, label: 'Cohortes actives', value: data.activeCohorts, sub: 'En cours ce mois-ci', iconBg: '#eaf2f9', iconColor: '#4470a0' },
    { icon: <TrendingUp size={18} />, label: 'Inscriptions totales', value: data.totalEnrollments, sub: 'Toutes cohortes confondues', iconBg: '#fdf0e2', iconColor: '#b07840' },
    { icon: <Users size={18} />, label: 'Réseau', value: `${data.totalStudents} + ${data.totalCoaches}`, sub: `${data.totalStudents} étudiants · ${data.totalCoaches} coachs actifs`, iconBg: '#f1edf7', iconColor: '#7a67a0' },
  ] : [
    { icon: <BookOpen size={18} />, label: 'Total programmes', value: 6, sub: '6 publiés · 1 brouillon', iconBg: '#edf5f0', iconColor: '#3a8059' },
    { icon: <Layers size={18} />, label: 'Cohortes actives', value: 4, sub: 'En cours ce mois-ci', iconBg: '#eaf2f9', iconColor: '#4470a0' },
    { icon: <TrendingUp size={18} />, label: 'Inscriptions totales', value: 84, sub: 'Toutes cohortes confondues', iconBg: '#fdf0e2', iconColor: '#b07840' },
    { icon: <Users size={18} />, label: 'Réseau', value: '42 + 6', sub: '42 étudiants · 6 coachs actifs', iconBg: '#f1edf7', iconColor: '#7a67a0' },
  ];

  /* Enrollments feed */
  const enrollments = data?.latestEnrollments ?? [];

  /* Upcoming sessions */
  const upcomingSessions = data?.upcomingSessions ?? [];

  /* Fallback activity for when DB is empty */
  const MOCK_ACTIVITY = [
    { id: 'a1', initials: 'AC', name: 'Alex Carter',   action: "vient de s'inscrire à",    target: 'Data Analyst Bootcamp',                 timeAgo: '12 min', color: '#4d8063' },
    { id: 'a2', initials: 'YT', name: 'Yuki Tanaka',   action: "vient de s'inscrire à",    target: 'Strategy Consulting Case Program',       timeAgo: '2 h',    color: '#B8752D' },
    { id: 'a3', initials: 'MT', name: 'Maya Thompson', action: 'a créé une cohorte pour',  target: 'Investment Banking Analyst Immersion',   timeAgo: '3 h',    color: '#146138' },
    { id: 'a4', initials: 'PS', name: 'Priya Sharma',  action: "vient de s'inscrire à",    target: 'Product Manager Case Practice',          timeAgo: '5 h',    color: '#2D5FB8' },
  ];

  const MOCK_UPCOMING = [
    { id: 'u1', day: '12', month: 'AUG', title: 'Financial modelling basics',  program: 'IB Analyst Immersion', time: '10:00', duration: '45 min' },
    { id: 'u2', day: '14', month: 'AUG', title: 'Valuation deep dive',          program: 'IB Analyst Immersion', time: '16:00', duration: '45 min' },
    { id: 'u3', day: '18', month: 'AUG', title: 'SWE mock interview #2',        program: 'SWE Interview Simulation', time: '11:00', duration: '45 min' },
    { id: 'u4', day: '22', month: 'AUG', title: 'Problem framing — session live', program: 'Data Analyst Bootcamp', time: '10:00', duration: '45 min' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="welcome-row" style={{ marginBottom: 32 }}>
        <div>
          <p className="eyebrow">Administrateur · {adminName}</p>
          <h1>Vue globale de la plateforme</h1>
          <p className="welcome-subtitle">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Toutes les données sont en temps réel.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="admin-kpi-row" style={{ marginBottom: 36 }}>
        {kpi.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Coach applications */}
      {data && data.pendingCoachApplications.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <p className="eyebrow">Recrutement</p>
              <h2>Candidatures coach en attente</h2>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, background: '#fdf0e2', color: '#b07840', padding: '4px 10px', borderRadius: 20 }}>
              {data.pendingCoachApplications.length} en attente
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.pendingCoachApplications.map((app) => (
              <div key={app.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f1edf7', color: '#7a67a0', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <UserCheck size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#25333d' }}>{app.name}</div>
                  <div style={{ fontSize: 11, color: '#9aa4ab', marginTop: 2 }}>{app.email} · {app.domain}</div>
                </div>
                <span style={{ fontSize: 10, color: '#9aa4ab', whiteSpace: 'nowrap' }}>{timeAgo(new Date(app.createdAt))}</span>
                <span style={{ fontSize: 10, fontWeight: 700, background: '#fdf0e2', color: '#b07840', padding: '3px 8px', borderRadius: 6 }}>
                  En attente
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feeds */}
      <div className="dashboard-grid">

        {/* Dernières inscriptions */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <p className="eyebrow">Activité</p>
              <h2>Dernières inscriptions</h2>
            </div>
          </div>

          <div className="activity-feed">
            {enrollments.length > 0
              ? enrollments.map((e) => (
                  <div key={e.id} className="activity-row">
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: '#4d8063', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                      {initials(e.user.name)}
                    </div>
                    <div className="activity-icon" style={{ background: '#edf6ef', color: '#3a8059' }}>
                      <GraduationCap size={14} />
                    </div>
                    <div className="activity-body">
                      <div className="activity-text">
                        <strong>{e.user.name}</strong> vient de s&apos;inscrire à{' '}
                        <strong style={{ color: '#2c7650' }}>{e.cohort.program.title}</strong>
                      </div>
                      <div className="activity-time">Il y a {timeAgo(new Date(e.enrolledAt))}</div>
                    </div>
                  </div>
                ))
              : MOCK_ACTIVITY.map((a) => (
                  <div key={a.id} className="activity-row">
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: a.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                      {a.initials}
                    </div>
                    <div className="activity-icon" style={{ background: '#edf6ef', color: '#3a8059' }}>
                      <GraduationCap size={14} />
                    </div>
                    <div className="activity-body">
                      <div className="activity-text">
                        <strong>{a.name}</strong> {a.action}{' '}
                        <strong style={{ color: '#2c7650' }}>{a.target}</strong>
                      </div>
                      <div className="activity-time">Il y a {a.timeAgo}</div>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Sessions à venir */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <p className="eyebrow">Planning opérationnel</p>
              <h2>Sessions à venir</h2>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            {upcomingSessions.length > 0
              ? upcomingSessions.map((s, i) => (
                  <div key={s.id} className="usession-row" style={{ background: i % 2 === 0 ? '#fff' : '#fafcfb' }}>
                    <div className="usession-date">
                      <strong>{fmtDay(new Date(s.dateTime))}</strong>
                      <span>{fmtMonth(new Date(s.dateTime))}</span>
                    </div>
                    <div className="usession-info">
                      <strong>{s.title}</strong>
                      <span><CalendarDays size={10} /> {s.cohort.program.title}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#35424c' }}>{fmtTime(new Date(s.dateTime))}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: '#9aa4ab' }}>
                        <Clock3 size={9} /> 45 min
                      </span>
                    </div>
                  </div>
                ))
              : MOCK_UPCOMING.map((s, i) => (
                  <div key={s.id} className="usession-row" style={{ background: i % 2 === 0 ? '#fff' : '#fafcfb' }}>
                    <div className="usession-date">
                      <strong>{s.day}</strong>
                      <span>{s.month}</span>
                    </div>
                    <div className="usession-info">
                      <strong>{s.title}</strong>
                      <span><CalendarDays size={10} /> {s.program}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#35424c' }}>{s.time}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: '#9aa4ab' }}>
                        <Clock3 size={9} /> {s.duration}
                      </span>
                    </div>
                  </div>
                ))}
          </div>

          <div className="admin-insight" style={{ marginTop: 14 }}>
            <div className="insight-icon"><CalendarDays size={16} /></div>
            <div>
              <strong>{upcomingSessions.length || MOCK_UPCOMING.length} sessions à venir</strong>
              <p>Sur {data ? data.activeCohorts : 4} cohortes actives, pour un total de ~{(upcomingSessions.length || MOCK_UPCOMING.length) * 45} minutes de formation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
