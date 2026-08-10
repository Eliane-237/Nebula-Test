'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { updateProgramAction } from '@/app/actions/updateProgramAction';

const DOMAINS     = ['Finance', 'Data', 'Product', 'Software Engineering', 'Consulting', 'Marketing'];
const DIFFICULTIES = ['Débutant', 'Intermédiaire', 'Avancé'];

const DOMAIN_DISPLAY: Record<string, string> = {
  FINANCE: 'Finance', DATA: 'Data', PRODUCT: 'Product',
  SOFTWARE_ENGINEERING: 'Software Engineering', CONSULTING: 'Consulting',
  MARKETING: 'Marketing', ENTREPRENEURSHIP: 'Entrepreneurship',
};
const DIFF_DISPLAY: Record<string, string> = {
  BEGINNER: 'Débutant', INTERMEDIATE: 'Intermédiaire', ADVANCED: 'Avancé',
};

type Initial = {
  title: string; description: string; domain: string; difficulty: string;
  targetAudience: string; numSessions: number; recommendedSize: number;
  maxCohortSize: number; learningOutcomes: string[];
};

export default function EditProgramForm({ programId, initial }: { programId: string; initial: Initial }) {
  const router  = useRouter();
  const [isPending, start] = useTransition();

  const [title,          setTitle]    = useState(initial.title);
  const [description,    setDesc]     = useState(initial.description);
  const [domain,         setDomain]   = useState(DOMAIN_DISPLAY[initial.domain] ?? initial.domain);
  const [difficulty,     setDiff]     = useState(DIFF_DISPLAY[initial.difficulty] ?? initial.difficulty);
  const [targetAudience, setAudience] = useState(initial.targetAudience);
  const [numSessions,    setSessions] = useState(initial.numSessions);
  const [recommendedSize,setRecommend]= useState(initial.recommendedSize);
  const [maxCohortSize,  setMaxSize]  = useState(initial.maxCohortSize);
  const [outcomes,       setOutcomes] = useState<string[]>(
    initial.learningOutcomes.length > 0 ? initial.learningOutcomes : [''],
  );

  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const updateOutcome = (i: number, v: string) =>
    setOutcomes((prev) => prev.map((o, idx) => idx === i ? v : o));
  const addOutcome    = () => setOutcomes((prev) => [...prev, '']);
  const removeOutcome = (i: number) => setOutcomes((prev) => prev.filter((_, idx) => idx !== i));

  function handleSave() {
    if (!title.trim())       { setError('Le titre est obligatoire.'); return; }
    if (!description.trim()) { setError('La description est obligatoire.'); return; }
    setError('');
    start(async () => {
      const r = await updateProgramAction({
        programId,
        title:            title.trim(),
        description:      description.trim(),
        domain,
        difficulty,
        targetAudience:   targetAudience.trim() || undefined,
        numSessions,
        recommendedSize,
        maxCohortSize,
        learningOutcomes: outcomes.map((o) => o.trim()).filter(Boolean),
      });
      if (!r.ok) { setError((r as { ok: false; error: string }).error); return; }
      setSuccess('Programme mis à jour !');
      setTimeout(() => router.push(`/coach/programs/${programId}`), 1200);
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <button className="detail-back" style={{ padding: '0 0 16px' }} onClick={() => router.push(`/coach/programs/${programId}`)}>
          <ArrowLeft size={14} /> Retour au programme
        </button>
        <div className="welcome-row" style={{ marginBottom: 0 }}>
          <div>
            <p className="eyebrow">Coach · Modifier</p>
            <h1>Modifier le programme</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* General info */}
        <div className="form-card" style={{ marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700 }}>Informations générales</h3>
          <div className="coach-form">
            <div className="form-row">
              <label className="form-label">Titre <span style={{ color: '#c25d4b' }}>*</span></label>
              <input className="form-input" style={{ width: '100%' }} value={title}
                onChange={(e) => setTitle(e.target.value)} maxLength={120} />
              <span className="form-hint">{title.length}/120 caractères</span>
            </div>
            <div className="form-row">
              <label className="form-label">Description <span style={{ color: '#c25d4b' }}>*</span></label>
              <textarea className="form-textarea" style={{ width: '100%', minHeight: 90 }} value={description}
                onChange={(e) => setDesc(e.target.value)} maxLength={600} />
              <span className="form-hint">{description.length}/600 caractères</span>
            </div>
            <div className="form-two-col">
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-label">Domaine</label>
                <select className="form-select" style={{ width: '100%' }} value={domain}
                  onChange={(e) => setDomain(e.target.value)}>
                  {DOMAINS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-label">Niveau</label>
                <select className="form-select" style={{ width: '100%' }} value={difficulty}
                  onChange={(e) => setDiff(e.target.value)}>
                  {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label className="form-label">Public cible <small style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optionnel</small></label>
              <input className="form-input" style={{ width: '100%' }} value={targetAudience}
                onChange={(e) => setAudience(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Structure */}
        <div className="form-card" style={{ marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700 }}>Structure</h3>
          <div className="coach-form">
            <div className="form-row">
              <label className="form-label">Nombre de sessions</label>
              <div className="form-stepper">
                <button type="button" disabled={numSessions <= 2}
                  onClick={() => setSessions((n) => Math.max(2, n - 1))}><Minus size={14} /></button>
                <div className="form-stepper-val">{numSessions}</div>
                <button type="button" disabled={numSessions >= 4}
                  onClick={() => setSessions((n) => Math.min(4, n + 1))}><Plus size={14} /></button>
              </div>
              <span className="form-hint">Entre 2 et 4 sessions · 45 min chacune.</span>
            </div>
            <div className="form-two-col">
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-label">Taille recommandée</label>
                <input type="number" className="form-input" style={{ width: '100%' }} min={1} max={20}
                  value={recommendedSize} onChange={(e) => setRecommend(Number(e.target.value))} />
              </div>
              <div className="form-row" style={{ marginBottom: 0 }}>
                <label className="form-label">Capacité maximale</label>
                <input type="number" className="form-input" style={{ width: '100%' }} min={1} max={20}
                  value={maxCohortSize} onChange={(e) => setMaxSize(Number(e.target.value))} />
              </div>
            </div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <label className="form-label">Objectifs d&apos;apprentissage</label>
              <div className="outcomes-list-edit">
                {outcomes.map((o, i) => (
                  <div key={i} className="outcome-row">
                    <input className="form-input" style={{ flex: 1 }}
                      placeholder={`Objectif ${i + 1}`}
                      value={o} onChange={(e) => updateOutcome(i, e.target.value)} />
                    {outcomes.length > 1 && (
                      <button type="button" className="outcome-del icon-btn-danger" onClick={() => removeOutcome(i)}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {outcomes.length < 8 && (
                <button type="button" className="outcome-add" style={{ marginTop: 10 }} onClick={addOutcome}>
                  <Plus size={13} /> Ajouter un objectif
                </button>
              )}
            </div>
          </div>
        </div>

        {error   && <div className="form-error">{error}</div>}
        {success && <div className="form-success"><CheckCircle2 size={13} /> {success}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="secondary-button" onClick={() => router.push(`/coach/programs/${programId}`)}>Annuler</button>
          <button className="primary-button" disabled={isPending} onClick={handleSave}>
            {isPending
              ? <><Loader2 size={13} className="spin" /> Enregistrement…</>
              : <><CheckCircle2 size={13} /> Enregistrer les modifications</>}
          </button>
        </div>
      </div>
    </div>
  );
}
