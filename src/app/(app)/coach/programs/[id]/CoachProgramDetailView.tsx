'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, GraduationCap, Layers, MessageSquare, Pencil, Plus, Users } from 'lucide-react';
import { updateProgramStatusAction } from '@/app/actions/updateProgramStatusAction';
import { addCoachFeedback } from '@/app/actions/explorationResponseActions';
import type { getCoachProgramDetail } from '@/app/actions/coachQueries';
import { DOMAIN_COLOR, DOMAIN_LABEL, STATUS_CONFIG, COHORT_STATUS_LABEL, COHORT_STATUS_COLOR } from '@/lib/labels';

type Program = NonNullable<Awaited<ReturnType<typeof getCoachProgramDetail>>['data']>;


function fmt(d: Date | null | string) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── Exploration card with student responses + feedback ──────── */
function ExplorationCard({ exploration }: { exploration: Program['explorations'][number] }) {
  const [open, setOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>(
    Object.fromEntries(exploration.responses.map((r) => [r.user.id, r.coachFeedback ?? ''])),
  );
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, start] = useTransition();

  function handleFeedback(studentId: string) {
    const text = feedbacks[studentId] ?? '';
    if (!text.trim()) { setErrors((p) => ({ ...p, [studentId]: 'Le feedback ne peut pas être vide.' })); return; }
    setErrors((p) => ({ ...p, [studentId]: '' }));
    start(async () => {
      const r = await addCoachFeedback(exploration.id, studentId, text);
      if (!r.ok) { setErrors((p) => ({ ...p, [studentId]: (r as { ok: false; error: string }).error })); return; }
      setSaved((p) => ({ ...p, [studentId]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [studentId]: false })), 2500);
    });
  }

  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
      <button
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{exploration.title}</div>
          <div style={{ fontSize: 11, color: '#87919a' }}>
            {exploration.responses.length} réponse{exploration.responses.length !== 1 ? 's' : ''}
            {exploration.dueDate ? ` · Échéance : ${fmt(exploration.dueDate)}` : ''}
          </div>
        </div>
        {open ? <ChevronUp size={16} color="#9aa4ab" /> : <ChevronDown size={16} color="#9aa4ab" />}
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '16px 18px', background: '#fafcfb' }}>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6a7880', lineHeight: 1.5 }}>{exploration.description}</p>

          {exploration.responses.length === 0 ? (
            <p style={{ fontSize: 12, color: '#9aa4ab', fontStyle: 'italic' }}>Aucune réponse soumise pour le moment.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {exploration.responses.map((resp) => (
                <div key={resp.user.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: '14px 16px' }}>
                  {/* Student identity */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#edf2fa', color: '#3d6fa6', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 9, fontWeight: 800 }}>
                      {resp.user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{resp.user.name}</div>
                      <div style={{ fontSize: 10, color: '#9aa4ab' }}>{resp.user.email} · {fmt(resp.submittedAt)}</div>
                    </div>
                  </div>

                  {/* Student response */}
                  <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#4a555e', lineHeight: 1.6, marginBottom: 12, borderLeft: '3px solid #d0d8de' }}>
                    {resp.text}
                  </div>

                  {/* Coach feedback */}
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#6a7880', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 6 }}>
                      <MessageSquare size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      Feedback coach
                    </label>
                    <textarea
                      rows={3}
                      className="form-input"
                      style={{ width: '100%', fontSize: 12, resize: 'vertical' }}
                      placeholder="Écrivez votre retour sur la réponse de l'étudiant…"
                      value={feedbacks[resp.user.id] ?? ''}
                      onChange={(e) => setFeedbacks((p) => ({ ...p, [resp.user.id]: e.target.value }))}
                    />
                    {errors[resp.user.id] && (
                      <p style={{ color: '#e74c3c', fontSize: 11, margin: '4px 0 0' }}>{errors[resp.user.id]}</p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                      <button
                        className="primary-button"
                        style={{ padding: '6px 14px', fontSize: 11 }}
                        onClick={() => handleFeedback(resp.user.id)}
                      >
                        {saved[resp.user.id] ? <><CheckCircle2 size={12} /> Enregistré</> : 'Envoyer le feedback'}
                      </button>
                      {resp.coachFeedback && !saved[resp.user.id] && (
                        <span style={{ fontSize: 10, color: '#2e7a52' }}><CheckCircle2 size={11} style={{ verticalAlign: 'middle' }} /> Feedback existant</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main view ────────────────────────────────────────────────── */
export default function CoachProgramDetailView({ program }: { program: Program }) {
  const router = useRouter();
  const [status, setStatus] = useState(program.status);
  const [statusMsg, setStatusMsg] = useState('');
  const [, startStatus] = useTransition();

  const color = DOMAIN_COLOR[program.domain] ?? '#4d8063';
  const sc    = STATUS_CONFIG[status] ?? { label: status, className: 'badge-draft' };
  const isDraft     = status === 'DRAFT';
  const isPublished = status === 'PUBLISHED';
  const isArchived  = status === 'ARCHIVED';

  function changeStatus(newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') {
    setStatusMsg('');
    startStatus(async () => {
      const r = await updateProgramStatusAction(program.id, newStatus);
      if (!r.ok) { setStatusMsg((r as { ok: false; error: string }).error); return; }
      setStatus(newStatus);
    });
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button className="detail-back" style={{ padding: '0 0 16px' }} onClick={() => router.push('/coach/programs')}>
          <ArrowLeft size={14} /> Retour à mes programmes
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 13, background: `${color}22`, color, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 11, fontWeight: 800, letterSpacing: '.5px', fontFamily: 'DM Mono, monospace' }}>
              {(DOMAIN_LABEL[program.domain] ?? program.domain).slice(0, 3).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className={`badge ${sc.className}`}>{sc.label}</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 21 }}>{program.title}</h1>
              <p className="welcome-subtitle" style={{ marginTop: 4 }}>
                {program.numSessions} sessions · Max {program.maxCohortSize} par cohorte
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {isDraft && (
              <button className="primary-button" style={{ fontSize: 12 }} onClick={() => changeStatus('PUBLISHED')}>
                Publier
              </button>
            )}
            {isPublished && (
              <button className="ghost-button" style={{ fontSize: 12, border: '1px solid var(--line)', color: '#9aa4ab' }} onClick={() => changeStatus('ARCHIVED')}>
                Archiver
              </button>
            )}
            {isArchived && (
              <button className="outline-button" style={{ fontSize: 12 }} onClick={() => changeStatus('DRAFT')}>
                Réactiver
              </button>
            )}
            <button className="outline-button" style={{ fontSize: 12 }} onClick={() => router.push(`/coach/programs/${program.id}/edit`)}>
              <Pencil size={13} /> Modifier
            </button>
            {isPublished && (
              <button className="primary-button" style={{ fontSize: 12 }} onClick={() => router.push(`/coach/programs/${program.id}/cohort/new`)}>
                <Plus size={14} /> Nouvelle cohorte
              </button>
            )}
          </div>
        </div>
        {statusMsg && <div className="form-error" style={{ marginTop: 12 }}>{statusMsg}</div>}
      </div>

      {/* Description */}
      {program.description && (
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 22px', marginBottom: 28, fontSize: 13, color: '#56616c', lineHeight: 1.6 }}>
          {program.description}
        </div>
      )}

      {/* Cohorts */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-heading" style={{ marginBottom: 16 }}>
          <div>
            <p className="eyebrow" style={{ margin: '0 0 3px' }}>Gestion</p>
            <h2 style={{ margin: 0, fontSize: 16 }}>Cohortes ({program.cohorts.length})</h2>
          </div>
        </div>

        {program.cohorts.length === 0 ? (
          <div className="empty-state" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12 }}>
            <div className="empty-state-icon"><Layers size={22} /></div>
            <h3>Aucune cohorte</h3>
            <p>Publiez le programme, puis créez la première cohorte.</p>
            {isPublished && (
              <button className="primary-button" style={{ marginTop: 16 }} onClick={() => router.push(`/coach/programs/${program.id}/cohort/new`)}>
                <Plus size={14} /> Créer une cohorte
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {program.cohorts.map((cohort, idx) => (
              <div key={cohort.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, color, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 14, fontWeight: 800 }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>Cohorte {idx + 1}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: COHORT_STATUS_COLOR[cohort.status] ?? '#9aa4ab', background: `${COHORT_STATUS_COLOR[cohort.status] ?? '#9aa4ab'}18`, padding: '2px 7px', borderRadius: 5 }}>
                        {COHORT_STATUS_LABEL[cohort.status] ?? cohort.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#87919a', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarDays size={11} /> {fmt(cohort.startDate)} → {fmt(cohort.endDate)}
                      </span>
                      <span style={{ fontSize: 11, color: '#87919a', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <GraduationCap size={11} /> {cohort._count.enrollments} / {cohort.maxParticipants} inscrits
                      </span>
                      <span style={{ fontSize: 11, color: '#87919a', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={11} /> {cohort.sessions.length} sessions
                      </span>
                    </div>
                  </div>
                </div>
                <button className="outline-button" style={{ padding: '8px 14px', fontSize: 11 }} onClick={() => router.push(`/coach/cohorts/${cohort.id}`)}>
                  Gérer →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explorations */}
      <div>
        <div className="section-heading" style={{ marginBottom: 16 }}>
          <div>
            <p className="eyebrow" style={{ margin: '0 0 3px' }}>Contenu & Réponses</p>
            <h2 style={{ margin: 0, fontSize: 16 }}>Explorations ({program.explorations.length})</h2>
          </div>
        </div>
        {program.explorations.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9aa4ab' }}>Aucune exploration. Ajoutez-en depuis la liste des programmes.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {program.explorations.map((ex) => (
              <ExplorationCard key={ex.id} exploration={ex} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
