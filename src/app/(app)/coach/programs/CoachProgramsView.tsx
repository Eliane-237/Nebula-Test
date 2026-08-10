'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CalendarDays, GraduationCap, Layers, Pencil, Plus, Users, X } from 'lucide-react';
import { createExplorationAction } from '@/app/actions/createExplorationAction';
import { updateProgramStatusAction } from '@/app/actions/updateProgramStatusAction';
import { DOMAIN_COLOR, DOMAIN_LABEL, DIFF_LABEL, STATUS_CONFIG } from '@/lib/labels';

/* ── Types ────────────────────────────────────────────────────── */
type CoachProgram = {
  id:            string;
  title:         string;
  description:   string;
  domain:        string;
  difficulty:    string;
  numSessions:   number;
  maxCohortSize: number;
  status:        string;
  cohortCount:   number;
  totalEnrolled: number;
};

/* ── Exploration Modal ────────────────────────────────────────── */
function ExplorationModal({ programId, programTitle, onClose }: { programId: string; programTitle: string; onClose: () => void }) {
  const [title, setTitle]   = useState('');
  const [desc, setDesc]     = useState('');
  const [due, setDue]       = useState('');
  const [error, setError]   = useState('');
  const [done, setDone]     = useState(false);
  const [isPending, start]  = useTransition();

  function handleSave() {
    setError('');
    start(async () => {
      const r = await createExplorationAction({ programId, title, description: desc, dueDate: due || undefined });
      if (r.ok) {
        setDone(true);
        setTimeout(onClose, 1200);
      } else {
        setError((r as { ok: false; error: string }).error);
      }
    });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="form-card" style={{ width: 440, margin: 0, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#9aa4ab' }}>
          <X size={18} />
        </button>
        <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>Ajouter une exploration</h3>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: '#9aa4ab' }}>{programTitle}</p>

        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#2e7a52', fontWeight: 600 }}>✓ Exploration créée !</div>
        ) : (
          <div className="coach-form">
            <div className="form-row">
              <label className="form-label">Titre <span style={{ color: '#e74c3c' }}>*</span></label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Étude de cas DCF" />
            </div>
            <div className="form-row">
              <label className="form-label">Description <span style={{ color: '#e74c3c' }}>*</span></label>
              <textarea className="form-input" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Décrivez le contexte et les attendus…" style={{ resize: 'vertical' }} />
            </div>
            <div className="form-row">
              <label className="form-label">Date limite <span style={{ fontSize: 10, color: '#9aa4ab', fontWeight: 400 }}>(optionnel)</span></label>
              <input type="date" className="form-input" value={due} onChange={(e) => setDue(e.target.value)} style={{ width: 180 }} />
            </div>
            {error && <p style={{ color: '#e74c3c', fontSize: 12, margin: '0 0 12px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="ghost-button" onClick={onClose}>Annuler</button>
              <button className="primary-button" onClick={handleSave} disabled={isPending || !title || !desc}>
                {isPending ? 'Enregistrement…' : 'Ajouter'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Program Card ─────────────────────────────────────────────── */
function ProgramCard({
  program,
  onManage,
  onExploration,
  onEdit,
  onStatusChange,
}: {
  program:        CoachProgram;
  onManage:       (id: string) => void;
  onExploration:  (id: string, title: string) => void;
  onEdit:         (id: string) => void;
  onStatusChange: (id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => void;
}) {
  const domainKey  = program.domain;
  const color      = DOMAIN_COLOR[domainKey] ?? '#4d8063';
  const domainLabel = DOMAIN_LABEL[domainKey] ?? domainKey;
  const diffLabel  = DIFF_LABEL[program.difficulty] ?? program.difficulty;
  const sc         = STATUS_CONFIG[program.status] ?? { label: program.status, className: 'badge-draft' };
  const isDraft     = program.status === 'DRAFT';
  const isPublished = program.status === 'PUBLISHED';
  const isArchived  = program.status === 'ARCHIVED';

  return (
    <div className="coach-prog-card">
      <div className="coach-prog-card-header" style={{ background: `linear-gradient(135deg, ${color}dd, ${color}99)` }}>
        <span style={{ background: 'rgba(255,255,255,.22)', color: '#fff', padding: '4px 9px', borderRadius: 5, font: '600 9px DM Mono, monospace', letterSpacing: '.5px' }}>
          {domainLabel.toUpperCase()}
        </span>
        <span className={`badge ${sc.className}`}>{sc.label}</span>
      </div>

      <div className="coach-prog-card-body">
        <h3 className="coach-prog-card-title">{program.title}</h3>
        <p className="coach-prog-card-desc">{program.description}</p>
        <div className="coach-prog-card-stats">
          <span><CalendarDays size={11} /> {program.numSessions} sessions</span>
          <span><BookOpen size={11} /> {diffLabel}</span>
          {program.cohortCount > 0 && <span><Layers size={11} /> {program.cohortCount} cohorte{program.cohortCount > 1 ? 's' : ''}</span>}
          {program.totalEnrolled > 0 && <span><GraduationCap size={11} /> {program.totalEnrolled} inscrits</span>}
        </div>
      </div>

      <div className="coach-prog-card-footer">
        <div className="coach-prog-card-actions">
          {isPublished && (
            <button className="outline-button" style={{ padding: '6px 10px', fontSize: 10 }} onClick={() => onManage(program.id)}>
              <Users size={11} /> {program.cohortCount > 0 ? `Cohorts (${program.cohortCount})` : 'Create cohort'}
            </button>
          )}
          <button
            className="ghost-button"
            style={{ padding: '6px 10px', fontSize: 10, border: '1px solid var(--line)' }}
            onClick={() => onExploration(program.id, program.title)}
          >
            + Exploration
          </button>
          <button
            className="ghost-button"
            style={{ padding: '6px 10px', fontSize: 10, border: '1px solid var(--line)' }}
            onClick={() => onEdit(program.id)}
            title="Modifier"
          >
            <Pencil size={11} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {isDraft && (
            <button className="primary-button" style={{ padding: '5px 12px', fontSize: 10 }}
              onClick={() => onStatusChange(program.id, 'PUBLISHED')}>
              Publier
            </button>
          )}
          {isPublished && (
            <button className="ghost-button" style={{ padding: '5px 12px', fontSize: 10, border: '1px solid var(--line)', color: '#9aa4ab' }}
              onClick={() => onStatusChange(program.id, 'ARCHIVED')}>
              Archiver
            </button>
          )}
          {isArchived && (
            <button className="outline-button" style={{ padding: '5px 12px', fontSize: 10 }}
              onClick={() => onStatusChange(program.id, 'DRAFT')}>
              Réactiver
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Page view ────────────────────────────────────────────────── */
type Tab = 'All' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

const TABS: { label: string; value: Tab }[] = [
  { label: 'Tous', value: 'All' },
  { label: 'Publiés', value: 'PUBLISHED' },
  { label: 'Brouillons', value: 'DRAFT' },
  { label: 'Archivés', value: 'ARCHIVED' },
];

export function CoachProgramsView({
  coachName,
  programs: initialPrograms,
  coachId,
}: {
  coachName: string;
  programs:  CoachProgram[];
  coachId:   string;
}) {
  const router = useRouter();
  const [tab,     setTab]     = useState<Tab>('All');
  const [modal,   setModal]   = useState<{ programId: string; programTitle: string } | null>(null);
  const [programs, setPrograms] = useState<CoachProgram[]>(initialPrograms);
  const [statusMsg, setStatusMsg] = useState('');
  const [, startStatus] = useTransition();

  void coachId;

  const filtered = tab === 'All' ? programs : programs.filter((p) => p.status === tab);

  const stats = {
    published: programs.filter((p) => p.status === 'PUBLISHED').length,
    draft:     programs.filter((p) => p.status === 'DRAFT').length,
    cohorts:   programs.reduce((s, p) => s + p.cohortCount, 0),
    enrolled:  programs.reduce((s, p) => s + p.totalEnrolled, 0),
  };

  function handleStatusChange(id: string, newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') {
    setStatusMsg('');
    startStatus(async () => {
      const r = await updateProgramStatusAction(id, newStatus);
      if (!r.ok) {
        setStatusMsg((r as { ok: false; error: string }).error);
        return;
      }
      setPrograms((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p));
    });
  }

  return (
    <div>
      {modal && (
        <ExplorationModal
          programId={modal.programId}
          programTitle={modal.programTitle}
          onClose={() => setModal(null)}
        />
      )}

      {/* Header */}
      <div className="welcome-row" style={{ marginBottom: 28 }}>
        <div>
          <p className="eyebrow">Coach · {coachName}</p>
          <h1>Mes programmes</h1>
          <p className="welcome-subtitle">
            {stats.published} publié{stats.published > 1 ? 's' : ''} · {stats.draft} brouillon{stats.draft > 1 ? 's' : ''} · {stats.enrolled} étudiants inscrits
          </p>
        </div>
        <button className="primary-button" onClick={() => router.push('/coach/programs/new')}>
          <Plus size={14} /> Créer un programme
        </button>
      </div>

      {statusMsg && <div className="form-error" style={{ marginBottom: 16 }}>{statusMsg}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon stat-green"><BookOpen size={15} /></div>
          <div><p>Programmes</p><strong>{programs.length}</strong><span>{stats.published} publiés</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-blue"><Layers size={15} /></div>
          <div><p>Cohortes actives</p><strong>{stats.cohorts}</strong><span>en cours</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-orange"><GraduationCap size={15} /></div>
          <div><p>Inscrits</p><strong>{stats.enrolled}</strong><span>au total</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-purple"><Users size={15} /></div>
          <div><p>Taille moy. cohorte</p><strong>{stats.cohorts > 0 ? Math.round(stats.enrolled / stats.cohorts) : 0}</strong><span>participants</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-row" style={{ marginBottom: 24 }}>
        {TABS.map((t) => (
          <button
            key={t.value}
            className={`tab-btn${tab === t.value ? ' tab-active' : ''}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
            <span style={{ marginLeft: 6, background: tab === t.value ? '#2e7a5222' : '#f0f3f4', color: tab === t.value ? '#2e7a52' : '#9aa4ad', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 700 }}>
              {t.value === 'All' ? programs.length : programs.filter((p) => p.status === t.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {programs.length === 0 ? (
        <div className="empty-state" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12 }}>
          <div className="empty-state-icon"><BookOpen size={22} /></div>
          <h3>Aucun programme</h3>
          <p>Créez votre premier programme pour commencer.</p>
          <button className="primary-button" style={{ marginTop: 16 }} onClick={() => router.push('/coach/programs/new')}>
            <Plus size={14} /> Créer un programme
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12 }}>
          <div className="empty-state-icon"><BookOpen size={22} /></div>
          <h3>Aucun programme dans cette catégorie</h3>
        </div>
      ) : (
        <div className="coach-prog-grid">
          {filtered.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onManage={(id) => router.push(`/coach/programs/${id}`)}
              onExploration={(id, title) => setModal({ programId: id, programTitle: title })}
              onEdit={(id) => router.push(`/coach/programs/${id}/edit`)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
