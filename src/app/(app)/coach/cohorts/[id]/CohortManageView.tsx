'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, GraduationCap, Lock, Mail, Unlock, Users } from 'lucide-react';
import { updateCohortStatusAction } from '@/app/actions/updateCohortStatusAction';
import type { getCohortDetail } from '@/app/actions/coachQueries';
import { COHORT_STATUS_LABEL as STATUS_LABEL, COHORT_STATUS_COLOR as STATUS_COLOR } from '@/lib/labels';

type Cohort = NonNullable<Awaited<ReturnType<typeof getCohortDetail>>['data']>;

function fmt(d: Date | null | string) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CohortManageView({ cohort: initial }: { cohort: Cohort }) {
  const router = useRouter();
  const [cohortStatus, setCohortStatus] = useState(initial.status);
  const [statusMsg, setStatusMsg] = useState('');
  const [, start] = useTransition();

  const enrolled = initial.enrollments.map((e) => ({ ...e.user, enrolledAt: e.enrolledAt }));
  const isOpen   = cohortStatus === 'OPEN';
  const isFull   = cohortStatus === 'FULL';

  function toggleStatus() {
    const next = isOpen ? 'CLOSED' : 'OPEN';
    setStatusMsg('');
    start(async () => {
      const r = await updateCohortStatusAction(initial.id, next);
      if (!r.ok) { setStatusMsg((r as { ok: false; error: string }).error); return; }
      setCohortStatus(next);
    });
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button className="detail-back" style={{ padding: '0 0 16px' }} onClick={() => router.push(`/coach/programs/${initial.program.id}`)}>
          <ArrowLeft size={14} /> {initial.program.title}
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p className="eyebrow" style={{ margin: '0 0 3px' }}>Gestion de cohorte</p>
            <h1 style={{ margin: 0, fontSize: 21 }}>{initial.program.title}</h1>
            <div style={{ display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLOR[cohortStatus] ?? '#9aa4ab', background: `${STATUS_COLOR[cohortStatus] ?? '#9aa4ab'}18`, padding: '3px 9px', borderRadius: 6 }}>
                {STATUS_LABEL[cohortStatus] ?? cohortStatus}
              </span>
              <span style={{ fontSize: 11, color: '#87919a', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CalendarDays size={11} /> {fmt(initial.startDate)} → {fmt(initial.endDate)}
              </span>
              <span style={{ fontSize: 11, color: '#87919a', display: 'flex', alignItems: 'center', gap: 4 }}>
                <GraduationCap size={11} /> {enrolled.length} / {initial.maxParticipants} inscrits
              </span>
              <span style={{ fontSize: 11, color: '#87919a', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={11} /> {initial.sessions.length} sessions
              </span>
            </div>
          </div>
          {!isFull && (
            <button
              className={isOpen ? 'ghost-button' : 'outline-button'}
              style={{ fontSize: 12, border: '1px solid var(--line)' }}
              onClick={toggleStatus}
            >
              {isOpen
                ? <><Lock size={13} /> Fermer les inscriptions</>
                : <><Unlock size={13} /> Ouvrir les inscriptions</>}
            </button>
          )}
        </div>
        {statusMsg && <div className="form-error" style={{ marginTop: 10 }}>{statusMsg}</div>}
      </div>

      <div className="cohort-manage-grid">
        {/* Sessions */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <p className="eyebrow" style={{ margin: '0 0 3px' }}>Programme</p>
              <h2 style={{ margin: 0, fontSize: 16 }}>Sessions ({initial.sessions.length})</h2>
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            {initial.sessions.map((s) => (
              <div key={s.id} className="usession-row">
                <div className="usession-date" style={{ background: '#edf6f1', color: '#2e7a52', minWidth: 32, fontFamily: 'DM Mono, monospace', fontSize: 13, fontWeight: 800, borderRadius: 8, textAlign: 'center', padding: '4px 6px' }}>
                  {s.order}
                </div>
                <div className="usession-info">
                  <strong>{s.title}</strong>
                  {s.dateTime && <span>{fmt(s.dateTime)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students */}
        <div>
          <div className="section-heading" style={{ marginBottom: 14 }}>
            <div>
              <p className="eyebrow" style={{ margin: '0 0 3px' }}>Participants</p>
              <h2 style={{ margin: 0, fontSize: 16 }}>Étudiants inscrits ({enrolled.length})</h2>
            </div>
          </div>

          {enrolled.length === 0 ? (
            <div className="empty-state" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '32px 24px' }}>
              <div className="empty-state-icon"><GraduationCap size={22} /></div>
              <h3>Aucun inscrit</h3>
              <p>Les étudiants pourront s&apos;inscrire depuis le catalogue.</p>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
              {enrolled.map((student, i) => (
                <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < enrolled.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: '#edf2fa', color: '#3d6fa6', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 10, fontWeight: 800 }}>
                    {student.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{student.name}</div>
                    <div style={{ fontSize: 11, color: '#87919a', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Mail size={10} /> {student.email}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#a3acb4', flexShrink: 0 }}>
                    Inscrit le {fmt(student.enrolledAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
