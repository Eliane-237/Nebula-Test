'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CalendarDays, CheckCircle2, Loader2, Sparkles, Users, Zap,
} from 'lucide-react';
import { createCohortAction } from '@/app/actions/createCohortAction';

type SessionDraft = { title: string; date: string };

function distribute(start: Date, end: Date, n: number): Date[] {
  if (n === 1) return [new Date(start)];
  const interval = (end.getTime() - start.getTime()) / (n - 1);
  return Array.from({ length: n }, (_, i) => new Date(start.getTime() + Math.round(interval * i)));
}

function toInput(d: Date) { return d.toISOString().slice(0, 10); }

type Props = {
  programId:    string;
  programTitle: string;
  color:        string;
  sessions:     SessionDraft[];
  backUrl?:     string;
};

export default function CohortCreateForm({ programId, programTitle, color, sessions: initialSessions, backUrl = '/coach/programs' }: Props) {
  const router = useRouter();

  const [startDate, setStart]    = useState('');
  const [endDate,   setEnd]      = useState('');
  const [maxPart,   setMaxPart]  = useState(10);
  const [sessions,  setSessions] = useState<SessionDraft[]>(initialSessions);
  const [autoFired, setAutoFired] = useState(false);

  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  function handleAutoSchedule() {
    if (!startDate || !endDate) { setError('Please select start and end dates first.'); return; }
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e <= s) { setError('End date must be after start date.'); return; }
    const dates = distribute(s, e, sessions.length);
    setSessions((prev) => prev.map((ss, i) => ({ ...ss, date: toInput(dates[i]) })));
    setAutoFired(true);
    setError('');
  }

  async function handleSave() {
    setError('');
    if (!startDate || !endDate)            { setError('Start and end dates are required.'); return; }
    if (!sessions.every((s) => !!s.date)) { setError('Every session needs a date (or use auto-schedule).'); return; }
    setSaving(true);
    try {
      const result = await createCohortAction({
        programId,
        startDate,
        endDate,
        maxParticipants: maxPart,
        sessions: sessions.map((s) => ({ title: s.title, date: s.date })),
      });
      if (!result.ok) {
        setError((result as { ok: false; error: string }).error);
        setSaving(false);
        return;
      }
      setSuccess('Cohort saved successfully!');
      setTimeout(() => router.push(backUrl), 1600);
    } catch {
      setError('An error occurred. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button className="detail-back" style={{ padding: '0 0 16px' }} onClick={() => router.push(backUrl)}>
          <ArrowLeft size={14} /> Back to my programs
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}22`, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="eyebrow" style={{ margin: '0 0 3px' }}>Create cohort</p>
            <h1 style={{ margin: 0, fontSize: 21 }}>{programTitle}</h1>
            <p className="welcome-subtitle" style={{ marginTop: 4 }}>
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} required
            </p>
          </div>
        </div>
      </div>

      <div className="cohort-manage-grid">
        {/* Left column: configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Dates + capacity */}
          <div className="form-card" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, letterSpacing: '-.3px' }}>
              Cohort configuration
            </h3>
            <div className="coach-form">
              <div className="form-two-col">
                <div className="form-row" style={{ marginBottom: 0 }}>
                  <label className="form-label">Start date</label>
                  <input type="date" className="form-input" style={{ width: '100%' }}
                    value={startDate} onChange={(e) => { setStart(e.target.value); setAutoFired(false); }} />
                </div>
                <div className="form-row" style={{ marginBottom: 0 }}>
                  <label className="form-label">End date</label>
                  <input type="date" className="form-input" style={{ width: '100%' }}
                    value={endDate} onChange={(e) => { setEnd(e.target.value); setAutoFired(false); }} />
                </div>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Max participants <span style={{ fontSize: 9, color: '#9aa4ab', fontWeight: 400, textTransform: 'none' }}>(1–20)</span>
                </label>
                <input type="number" className="form-input" style={{ width: 140 }}
                  min={1} max={20}
                  value={maxPart} onChange={(e) => setMaxPart(Math.min(20, Math.max(1, Number(e.target.value))))} />
              </div>
            </div>
          </div>

          {/* Session schedule */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p className="eyebrow" style={{ margin: '0 0 3px' }}>Schedule</p>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Sessions ({sessions.length})</h3>
              </div>
            </div>

            <div className="auto-sched-bar" style={{ marginBottom: 16 }}>
              <Zap size={16} style={{ color: '#3a7055', flexShrink: 0 }} />
              <p>
                Auto-distribute {sessions.length} sessions between {startDate || '…'} and {endDate || '…'}.
                {autoFired && <strong style={{ color: '#2c7650' }}> ✓ Dates applied</strong>}
              </p>
              <button className="outline-button" style={{ padding: '8px 12px', fontSize: 10, flexShrink: 0 }} onClick={handleAutoSchedule}>
                <Sparkles size={12} /> {autoFired ? 'Recalculate' : 'Auto-schedule'}
              </button>
            </div>

            <div className="session-builder">
              {sessions.map((s, i) => (
                <div key={i} className="session-builder-row">
                  <div className="session-num-badge">{i + 1}</div>
                  <input type="text"
                    placeholder={`Session ${i + 1} title`}
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

          {error   && <div className="form-error">{error}</div>}
          {success && <div className="form-success"><CheckCircle2 size={13} /> {success}</div>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="secondary-button" onClick={() => router.push(backUrl)}>Cancel</button>
            <button className="primary-button" disabled={saving} onClick={handleSave}>
              {saving
                ? <><Loader2 size={13} className="spin" /> Saving…</>
                : <><CheckCircle2 size={13} /> Save cohort</>}
            </button>
          </div>
        </div>

        {/* Right column: info */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <p className="eyebrow" style={{ margin: '0 0 3px' }}>About this program</p>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Session overview</h3>
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            {sessions.map((s, i) => (
              <div key={i} className="usession-row">
                <div className="usession-date" style={{ background: `${color}15`, color, minWidth: 32, fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 800, borderRadius: 8, textAlign: 'center', padding: '4px 6px' }}>
                  {i + 1}
                </div>
                <div className="usession-info">
                  <strong>{s.title || `Session ${i + 1}`}</strong>
                  {s.date && <span>{new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, background: '#f5f8fa', borderRadius: 10, padding: '14px 16px', fontSize: 12, color: '#6a7880' }}>
            <Users size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Max {maxPart} participant{maxPart !== 1 ? 's' : ''} · Enrollment status will be <strong>Open</strong> on creation.
          </div>
        </div>
      </div>
    </div>
  );
}
