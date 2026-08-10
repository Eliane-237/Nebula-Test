'use client';

import { useState, useTransition } from 'react';
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Compass, Send, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitExplorationResponse } from '@/app/actions/explorationResponseActions';

const DOMAIN_COLOR: Record<string, string> = {
  FINANCE: '#426f8d', DATA: '#4d8063', PRODUCT: '#6b5e9e',
  SOFTWARE_ENGINEERING: '#5c5098', CONSULTING: '#ac7041', MARKETING: '#a03d6b',
  ENTREPRENEURSHIP: '#7a5c38',
};

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

type ExplorationResponse = { id: string; text: string; coachFeedback: string | null };
type Exploration = {
  id: string;
  title: string;
  description: string;
  dueDate?: Date | string | null;
  responses: ExplorationResponse[];
};
type Session = { id: string; title: string; dateTime: Date | string; order: number };
type Program = {
  id: string;
  title: string;
  domain: string;
  numSessions: number;
  coach: { name: string };
  explorations: Exploration[];
};
type Cohort = {
  startDate: Date | string;
  endDate: Date | string;
  sessions: Session[];
  _count: { enrollments: number };
};
type Enrollment = { id: string; cohort: Cohort & { program: Program } };

/* ── Exploration card with inline submission ──────────────────── */
function ExplorationCard({
  exploration,
  programTitle,
}: {
  exploration: Exploration & { programTitle: string };
  programTitle: string;
}) {
  const existing = exploration.responses[0] ?? null;
  const [open, setOpen]     = useState(false);
  const [text, setText]     = useState(existing?.text ?? '');
  const [done, setDone]     = useState(!!existing);
  const [error, setError]   = useState('');
  const [isPending, start]  = useTransition();

  function handleSubmit() {
    setError('');
    start(async () => {
      const r = await submitExplorationResponse(exploration.id, text);
      if (r.ok) {
        setDone(true);
        setOpen(false);
      } else {
        setError((r as { ok: false; error: string }).error);
      }
    });
  }

  return (
    <div className="myprog-explo-card">
      <div className="myprog-explo-label">{programTitle}</div>
      <div className="myprog-explo-title">{exploration.title}</div>
      <div className="myprog-explo-desc">{exploration.description}</div>

      {exploration.dueDate && (
        <div style={{ fontSize: 10, color: '#9aa4ab', marginTop: 6 }}>
          <Clock3 size={10} style={{ verticalAlign: 'middle' }} />{' '}
          Due {fmtDate(exploration.dueDate)}
        </div>
      )}

      {existing?.coachFeedback && (
        <div style={{ marginTop: 10, background: '#edf6ef', borderRadius: 8, padding: '10px 12px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#3a8059', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.4px' }}>Coach feedback</p>
          <p style={{ fontSize: 12, color: '#25333d', margin: 0 }}>{existing.coachFeedback}</p>
        </div>
      )}

      {open ? (
        <div style={{ marginTop: 12 }}>
          <textarea
            className="form-input"
            rows={4}
            placeholder="Write your response here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: '100%', resize: 'vertical', fontSize: 12 }}
          />
          {error && <p style={{ fontSize: 11, color: '#e74c3c', marginTop: 4 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="ghost-button" style={{ fontSize: 10, padding: '6px 10px' }} onClick={() => setOpen(false)}>Cancel</button>
            <button
              className="primary-button"
              style={{ fontSize: 10, padding: '6px 12px' }}
              disabled={isPending || !text.trim()}
              onClick={handleSubmit}
            >
              <Send size={11} /> {isPending ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      ) : (
        <div className="myprog-explo-footer">
          {done
            ? <span style={{ fontSize: 11, color: '#3a8059', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> Submitted</span>
            : <span className="myprog-due"><Clock3 size={11} /> Pending</span>
          }
          <button className="myprog-explo-btn" onClick={() => setOpen(true)}>
            {done ? 'Edit response' : 'Start'} <ArrowUpRight size={10} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Enrolled program card ────────────────────────────────────── */
function EnrolledCard({ enrollment }: { enrollment: Enrollment }) {
  const { cohort } = enrollment;
  const { program } = cohort;
  const color = DOMAIN_COLOR[program.domain] ?? '#426f8d';

  const now = Date.now();
  const futureSessions  = cohort.sessions.filter((s) => new Date(s.dateTime).getTime() > now);
  const completedCount  = cohort.sessions.length - futureSessions.length;
  const nextSession     = futureSessions[0] ?? null;
  const progressPct     = program.numSessions > 0 ? Math.round((completedCount / program.numSessions) * 100) : 0;
  const isDone          = completedCount >= program.numSessions;
  const enrolledCount   = cohort._count.enrollments;

  return (
    <div className="myprog-card">
      <div className="myprog-card-banner" style={{ background: `${color}22`, color }}>
        <span className="category-pill" style={{ background: 'rgba(255,255,255,.7)', color }}>
          {program.domain.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="myprog-card-body">
        <h3 className="myprog-card-title">{program.title}</h3>

        <div className="myprog-card-meta">
          <span><CalendarDays size={12} /> {fmtDate(cohort.startDate)} – {fmtDate(cohort.endDate)}</span>
          <span><Users size={12} /> {enrolledCount} participant{enrolledCount !== 1 ? 's' : ''}</span>
        </div>

        <div style={{ fontSize: 11, color: '#6a7880', marginTop: 6 }}>
          Coach: <strong>{program.coach.name}</strong>
        </div>

        <div className="myprog-progress-row">
          <div className="myprog-progress-label">
            <span>Session progress</span>
            <span>{completedCount}/{program.numSessions} completed</span>
          </div>
          <div className="myprog-session-track">
            {Array.from({ length: program.numSessions }).map((_, i) => (
              <div
                key={i}
                className={`myprog-session-pip${i < completedCount ? ' done' : i === completedCount ? ' active' : ''}`}
              />
            ))}
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {nextSession ? (
          <div className="myprog-next-session">
            <div className="myprog-next-dot" />
            <div>
              <div className="myprog-next-label">Next session</div>
              <div className="myprog-next-title">{nextSession.title}</div>
            </div>
            <span className="myprog-next-time">
              {new Date(nextSession.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              {' · '}
              {new Date(nextSession.dateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ) : isDone ? (
          <div className="myprog-done-badge">
            <CheckCircle2 size={16} />
            All sessions completed — program finished!
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ── Main view ────────────────────────────────────────────────── */
export function MyProgramsView({ enrollments }: { enrollments: Enrollment[] }) {
  const router = useRouter();

  const allExplorations = enrollments.flatMap((e) =>
    e.cohort.program.explorations.map((ex) => ({
      ...ex,
      programTitle: e.cohort.program.title,
    })),
  );

  const allUpcoming = enrollments
    .flatMap((e) => e.cohort.sessions.map((s) => ({ ...s, program: e.cohort.program.title })))
    .filter((s) => new Date(s.dateTime).getTime() > Date.now())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 5);

  if (enrollments.length === 0) {
    return (
      <div>
        <div className="welcome-row">
          <div>
            <p className="eyebrow">Student</p>
            <h1>My Programs</h1>
          </div>
        </div>
        <div className="myprog-empty">
          <div className="empty-state-icon"><Compass size={22} /></div>
          <h3>No programs yet</h3>
          <p>Browse the catalog and enroll in a cohort to get started.</p>
          <button className="primary-button" style={{ marginTop: 16 }} onClick={() => router.push('/programs')}>
            Explore programs <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="welcome-row" style={{ marginBottom: 28 }}>
        <div>
          <p className="eyebrow">Student</p>
          <h1>My Programs</h1>
          <p className="welcome-subtitle">
            You&apos;re enrolled in {enrollments.length} program{enrollments.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <button className="outline-button" onClick={() => router.push('/programs')}>
          <Compass size={13} /> Explore more
        </button>
      </div>

      <div className="myprog-grid">
        {/* Enrolled programs */}
        <div>
          <div className="section-heading" style={{ marginBottom: 16 }}>
            <div><p className="eyebrow">Enrolled</p><h2>Your programs</h2></div>
          </div>
          <div className="myprog-enrolled-list">
            {enrollments.map((e) => <EnrolledCard key={e.id} enrollment={e} />)}
          </div>
        </div>

        {/* Upcoming sessions */}
        <div>
          <div className="section-heading" style={{ marginBottom: 16 }}>
            <div><p className="eyebrow">Agenda</p><h2>Upcoming sessions</h2></div>
          </div>
          <div className="myprog-sidebar-section">
            {allUpcoming.length === 0 ? (
              <p style={{ fontSize: 11, color: '#87919a' }}>No upcoming sessions.</p>
            ) : (
              allUpcoming.map((s) => (
                <div key={s.id} className="myprog-session-row">
                  <div className="myprog-date-chip">
                    <strong>{new Date(s.dateTime).getDate()}</strong>
                    <span>{new Date(s.dateTime).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</span>
                  </div>
                  <div className="myprog-session-info">
                    <strong>{s.title}</strong>
                    <span>{s.program} · {new Date(s.dateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {allExplorations.length > 0 && (
        <div className="myprog-explo-section">
          <div className="myprog-explo-header">
            <h3>Explorations</h3>
            <span className="eyebrow" style={{ margin: 0 }}>Take-home tasks from your coaches</span>
          </div>
          <div className="myprog-explo-grid">
            {allExplorations.map((e) => (
              <ExplorationCard key={e.id} exploration={e} programTitle={e.programTitle} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
