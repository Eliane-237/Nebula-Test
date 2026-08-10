'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, CalendarDays, CheckCircle2, Loader2, Sparkles, Users, Zap,
} from 'lucide-react';
import { createCohortAction } from '@/app/actions/createCohortAction';
import { cohortMembers } from '@/data';

/* ── Types ────────────────────────────────────────────────────── */
type SessionDraft = { title: string; date: string };

/* ── Mock cohort context ──────────────────────────────────────── */
const MOCK = {
  programId:    'ib-analyst',
  programTitle: 'Investment Banking Analyst Immersion',
  color:        '#146138',
  sessionCount: 4,
  sessions: [
    { title: 'Financial modelling basics',    date: '' },
    { title: 'Valuation deep dive',           date: '' },
    { title: 'Deal analysis workshop',         date: '' },
    { title: 'Feedback & career discussion',  date: '' },
  ] as SessionDraft[],
};

/* ── Auto-schedule helper ─────────────────────────────────────── */
function distribute(start: Date, end: Date, n: number): Date[] {
  if (n === 1) return [new Date(start)];
  const interval = (end.getTime() - start.getTime()) / (n - 1);
  return Array.from({ length: n }, (_, i) => new Date(start.getTime() + Math.round(interval * i)));
}

function toInput(d: Date) { return d.toISOString().slice(0, 10); }

/* ── Component ────────────────────────────────────────────────── */
export default function CohortManagePage() {
  const router  = useRouter();
  const params  = useParams<{ id: string }>();

  const [startDate, setStart]   = useState('2026-08-12');
  const [endDate,   setEnd]     = useState('2026-09-09');
  const [maxPart,   setMaxPart] = useState(16);
  const [sessions,  setSessions] = useState<SessionDraft[]>(MOCK.sessions);
  const [autoFired, setAutoFired] = useState(false);

  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  /* Auto-schedule */
  function handleAutoSchedule() {
    if (!startDate || !endDate) { setError('Veuillez d\'abord sélectionner les dates de début et de fin.'); return; }
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e <= s) { setError('La date de fin doit être après la date de début.'); return; }
    const dates = distribute(s, e, sessions.length);
    setSessions((prev) => prev.map((ss, i) => ({ ...ss, date: toInput(dates[i]) })));
    setAutoFired(true);
    setError('');
  }

  /* Save */
  async function handleSave() {
    setError('');
    if (!startDate || !endDate)            { setError('Les dates de début et fin sont obligatoires.'); return; }
    if (!sessions.every((s) => !!s.date)) { setError('Chaque session doit avoir une date (ou utilisez le planning automatique).'); return; }
    setSaving(true);
    try {
      const result = await createCohortAction({
        programId: MOCK.programId, startDate, endDate,
        maxParticipants: maxPart,
        sessions: sessions.map((s) => ({ title: s.title, date: s.date })),
      });
      if (!result.ok) {
        setError((result as { ok: false; error: string }).error);
        setSaving(false);
        return;
      }
      setSuccess('Cohorte enregistrée avec succès !');
      setTimeout(() => router.push('/coach/programs'), 1600);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
      setSaving(false);
    }
  }

  /* ── Render ── */
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button className="detail-back" style={{ padding: '0 0 16px' }} onClick={() => router.push('/coach/programs')}>
          <ArrowLeft size={14} /> Retour à mes programmes
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `${MOCK.color}22`, color: MOCK.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="eyebrow" style={{ margin: '0 0 3px' }}>Gestion de cohorte</p>
            <h1 style={{ margin: 0, fontSize: 21 }}>{MOCK.programTitle}</h1>
            <p className="welcome-subtitle" style={{ marginTop: 4 }}>
              ID cohorte : <code style={{ fontFamily: 'DM Mono, monospace', fontSize: 10 }}>{params.id}</code>
            </p>
          </div>
        </div>
      </div>

      <div className="cohort-manage-grid">
        {/* ── Colonne gauche : configuration ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Dates + capacité */}
          <div className="form-card" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, letterSpacing: '-.3px' }}>
              Configuration
            </h3>
            <div className="coach-form">
              <div className="form-two-col">
                <div className="form-row" style={{ marginBottom: 0 }}>
                  <label className="form-label">Date de début</label>
                  <input type="date" className="form-input" style={{ width: '100%' }}
                    value={startDate} onChange={(e) => { setStart(e.target.value); setAutoFired(false); }} />
                </div>
                <div className="form-row" style={{ marginBottom: 0 }}>
                  <label className="form-label">Date de fin</label>
                  <input type="date" className="form-input" style={{ width: '100%' }}
                    value={endDate} onChange={(e) => { setEnd(e.target.value); setAutoFired(false); }} />
                </div>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-label">Capacité maximale <span style={{ fontSize: 9, color: '#9aa4ab', fontWeight: 400, textTransform: 'none' }}>(1 – 20 participants)</span></label>
                <input type="number" className="form-input" style={{ width: 140 }}
                  min={1} max={20}
                  value={maxPart} onChange={(e) => setMaxPart(Math.min(20, Math.max(1, Number(e.target.value))))} />
              </div>
            </div>
          </div>

          {/* Calendrier des sessions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p className="eyebrow" style={{ margin: '0 0 3px' }}>Planning</p>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                  Sessions ({sessions.length})
                </h3>
              </div>
            </div>

            {/* Auto-schedule call-to-action */}
            <div className="auto-sched-bar" style={{ marginBottom: 16 }}>
              <Zap size={16} style={{ color: '#3a7055', flexShrink: 0 }} />
              <p>
                Répartissez automatiquement {sessions.length} sessions de façon uniforme entre le {startDate || '…'} et le {endDate || '…'}.
                {autoFired && <strong style={{ color: '#2c7650' }}> ✓ Dates appliquées</strong>}
              </p>
              <button className="outline-button" style={{ padding: '8px 12px', fontSize: 10, flexShrink: 0 }} onClick={handleAutoSchedule}>
                <Sparkles size={12} /> {autoFired ? 'Recalculer' : 'Planification auto'}
              </button>
            </div>

            {/* Session list */}
            <div className="session-builder">
              {sessions.map((s, i) => (
                <div key={i} className="session-builder-row">
                  <div className="session-num-badge">{i + 1}</div>
                  <input type="text"
                    placeholder={`Titre session ${i + 1}`}
                    value={s.title}
                    onChange={(e) => setSessions((prev) => prev.map((ss, idx) => idx === i ? { ...ss, title: e.target.value } : ss))}
                  />
                  <input type="date"
                    value={s.date}
                    onChange={(e) => setSessions((prev) => prev.map((ss, idx) => idx === i ? { ...ss, date: e.target.value } : ss))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Feedback + actions */}
          {error   && <div className="form-error">{error}</div>}
          {success && <div className="form-success"><CheckCircle2 size={13} /> {success}</div>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="secondary-button" onClick={() => router.push('/coach/programs')}>Annuler</button>
            <button className="primary-button" disabled={saving} onClick={handleSave}>
              {saving
                ? <><Loader2 size={13} className="spin" /> Enregistrement…</>
                : <><CheckCircle2 size={13} /> Enregistrer la cohorte</>}
            </button>
          </div>
        </div>

        {/* ── Colonne droite : trombinoscope ── */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <p className="eyebrow" style={{ margin: '0 0 3px' }}>Participants</p>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                Étudiants inscrits
              </h3>
            </div>
            <button className="outline-button" style={{ padding: '7px 11px', fontSize: 10 }}>
              <Users size={11} /> Inviter
            </button>
          </div>

          {/* Status summary chips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'En bonne voie', count: cohortMembers.filter((m) => m.status === 'On track').length,   bg: '#edf6ef', color: '#3a8059' },
              { label: 'En retard',     count: cohortMembers.filter((m) => m.status === 'Behind').length,     bg: '#fdf0e2', color: '#b07840' },
              { label: 'Terminé',       count: cohortMembers.filter((m) => m.status === 'Completed').length,  bg: '#e5eef7', color: '#4470a0' },
            ].map((stat) => (
              <div key={stat.label} style={{ background: stat.bg, borderRadius: 9, padding: '11px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: stat.color, letterSpacing: '-.8px', lineHeight: 1 }}>{stat.count}</div>
                <div style={{ fontSize: 9, color: stat.color, marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Student list */}
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            {cohortMembers.map((m) => {
              const bg = m.avatarColor === 'green' ? '#4d8063' : m.avatarColor === 'purple' ? '#8675a0' : m.avatarColor === 'blue' ? '#5485ac' : '#c18a4b';
              return (
                <div key={m.id} className="member-row" style={{ padding: '13px 16px' }}>
                  <span className="avatar" style={{ background: bg, width: 34, height: 34, borderRadius: 10, fontSize: 10, fontWeight: 800 }}>
                    {m.initials}
                  </span>
                  <div className="member-info">
                    <strong>{m.name}</strong>
                    <span>{m.email}</span>
                  </div>
                  <div className="member-progress">
                    <div className="member-progress-bar">
                      <div className="member-progress-fill" style={{ width: `${m.progress}%` }} />
                    </div>
                    <span>{m.progress}%</span>
                  </div>
                  <span className={`badge badge-${m.status === 'On track' ? 'green' : m.status === 'Completed' ? 'blue' : 'orange'}`}>
                    {m.status === 'On track' ? 'En bonne voie' : m.status === 'Completed' ? 'Terminé' : 'En retard'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
