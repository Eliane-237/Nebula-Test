'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Minus, Plus, Trash2,
} from 'lucide-react';
import { createProgramAction } from '@/app/actions/createProgramAction';

/* ── Constants ────────────────────────────────────────────────── */
const DOMAINS     = ['Finance', 'Data', 'Product', 'Software Engineering', 'Consulting', 'Marketing'];
const DIFFICULTIES = ['Débutant', 'Intermédiaire', 'Avancé'];
const MIN_SESSIONS = 2;
const MAX_SESSIONS = 4;

type Exploration = { title: string; description: string };

/* ── Step indicator ───────────────────────────────────────────── */
const STEPS = [
  { num: 1, label: 'Infos générales' },
  { num: 2, label: 'Structure'       },
  { num: 3, label: 'Exercices'       },
];

function StepWizard({ current }: { current: number }) {
  return (
    <div className="step-wizard">
      {STEPS.map((step, i) => {
        const isDone   = current > step.num;
        const isActive = current === step.num;
        return (
          <div key={step.num} style={{ display: 'flex', alignItems: 'flex-start', flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <div className={`step-dot${isActive ? ' active' : isDone ? ' done' : ''}`}>
                {isDone ? <Check size={14} /> : step.num}
              </div>
              <span className={`step-label${isActive ? ' active' : isDone ? ' done' : ''}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-connector${isDone ? ' done' : ''}`} style={{ marginTop: 16, flex: 1, height: 2 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function NewProgramPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  /* Step 1 state */
  const [title,         setTitle]       = useState('');
  const [description,   setDesc]        = useState('');
  const [domain,        setDomain]      = useState(DOMAINS[0]);
  const [targetAudience,setAudience]    = useState('');
  const [difficulty,    setDifficulty]  = useState(DIFFICULTIES[1]);

  /* Step 2 state */
  const [sessionCount,  setSessions]    = useState(3);
  const [outcomes,      setOutcomes]    = useState(['', '', '']);
  const [recommendedSize, setRecommend] = useState(10);
  const [maxCohortSize, setMaxSize]     = useState(20);

  /* Step 3 state */
  const [explorations, setExplorations] = useState<Exploration[]>([
    { title: '', description: '' },
  ]);

  /* Submission */
  const [submitting, setSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState<'draft' | 'publish'>('draft');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  /* ── Validation ── */
  function validateStep(s: number): string {
    if (s === 1) {
      if (!title.trim())       return 'Le titre est obligatoire.';
      if (!description.trim()) return 'La description est obligatoire.';
    }
    if (s === 2) {
      if (outcomes.filter((o) => o.trim()).length === 0)
        return 'Ajoutez au moins un objectif d\'apprentissage.';
    }
    return '';
  }

  function handleNext() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => s + 1);
  }

  function handleBack() { setError(''); setStep((s) => s - 1); }

  /* ── Outcome helpers ── */
  const updateOutcome = (i: number, v: string) =>
    setOutcomes((prev) => prev.map((o, idx) => idx === i ? v : o));
  const addOutcome = () => setOutcomes((prev) => [...prev, '']);
  const removeOutcome = (i: number) => setOutcomes((prev) => prev.filter((_, idx) => idx !== i));

  /* ── Exploration helpers ── */
  const updateExplor = (i: number, field: keyof Exploration, v: string) =>
    setExplorations((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: v } : e));
  const addExplor    = () => setExplorations((prev) => [...prev, { title: '', description: '' }]);
  const removeExplor = (i: number) => setExplorations((prev) => prev.filter((_, idx) => idx !== i));

  /* ── Submit ── */
  async function handleSubmit(mode: 'draft' | 'publish') {
    setError('');
    setSubmitMode(mode);
    setSubmitting(true);
    try {
      const result = await createProgramAction({
        title:          title.trim(),
        description:    description.trim(),
        domain,
        targetAudience: targetAudience.trim() || 'Tous niveaux',
        difficulty,
        sessionCount,
        recommendedSize,
        maxCohortSize,
        learningOutcomes: outcomes.map((o) => o.trim()).filter(Boolean),
      });
      if (!result.ok) {
        setError((result as { ok: false; error: string }).error);
        setSubmitting(false);
        return;
      }
      setSuccess(mode === 'draft' ? 'Programme sauvegardé en brouillon.' : 'Programme publié avec succès !');
      setTimeout(() => router.push('/coach/programs'), 1500);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
      setSubmitting(false);
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
        <div className="welcome-row" style={{ marginBottom: 0 }}>
          <div>
            <p className="eyebrow">Coach · Nouveau programme</p>
            <h1>Créer un programme</h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680 }}>
        {/* Step indicator */}
        <StepWizard current={step} />

        {/* ── STEP 1: Infos générales ── */}
        {step === 1 && (
          <div className="form-card">
            <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, letterSpacing: '-.3px' }}>
              Informations générales
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: 11, color: '#87919a' }}>
              Décrivez votre programme pour qu'il soit compréhensible en un coup d'œil.
            </p>

            <div className="coach-form">
              <div className="form-row">
                <label className="form-label">Titre du programme <span style={{ color: '#c25d4b' }}>*</span></label>
                <input
                  className="form-input" style={{ width: '100%' }}
                  placeholder="ex : Investment Banking Analyst Immersion"
                  value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
                />
                <span className="form-hint">{title.length}/120 caractères</span>
              </div>

              <div className="form-row">
                <label className="form-label">Description <span style={{ color: '#c25d4b' }}>*</span></label>
                <textarea
                  className="form-textarea" style={{ width: '100%', minHeight: 100 }}
                  placeholder="Que vivront les étudiants ? Soyez précis et engageant."
                  value={description} onChange={(e) => setDesc(e.target.value)} maxLength={600}
                />
                <span className="form-hint">{description.length}/600 caractères</span>
              </div>

              <div className="form-two-col">
                <div className="form-row" style={{ marginBottom: 0 }}>
                  <label className="form-label">Domaine</label>
                  <select className="form-select" style={{ width: '100%' }} value={domain} onChange={(e) => setDomain(e.target.value)}>
                    {DOMAINS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-row" style={{ marginBottom: 0 }}>
                  <label className="form-label">Niveau</label>
                  <select className="form-select" style={{ width: '100%' }} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <label className="form-label">Public cible <small style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optionnel</small></label>
                <input
                  className="form-input" style={{ width: '100%' }}
                  placeholder="ex : Étudiants en fin d'études et jeunes professionnels"
                  value={targetAudience} onChange={(e) => setAudience(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Structure ── */}
        {step === 2 && (
          <div className="form-card">
            <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, letterSpacing: '-.3px' }}>
              Structure du programme
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: 11, color: '#87919a' }}>
              Définissez le nombre de sessions (entre 2 et 4) et les objectifs pédagogiques.
            </p>

            <div className="coach-form">
              {/* Session count */}
              <div className="form-row">
                <label className="form-label">Nombre de sessions</label>
                <div className="form-stepper">
                  <button type="button" disabled={sessionCount <= MIN_SESSIONS}
                    onClick={() => setSessions((n) => Math.max(MIN_SESSIONS, n - 1))}>
                    <Minus size={14} />
                  </button>
                  <div className="form-stepper-val">{sessionCount}</div>
                  <button type="button" disabled={sessionCount >= MAX_SESSIONS}
                    onClick={() => setSessions((n) => Math.min(MAX_SESSIONS, n + 1))}>
                    <Plus size={14} />
                  </button>
                </div>
                <span className="form-hint">Entre {MIN_SESSIONS} et {MAX_SESSIONS} sessions · 45 minutes chacune.</span>
              </div>

              {/* Cohort sizes */}
              <div className="form-two-col">
                <div className="form-row" style={{ marginBottom: 0 }}>
                  <label className="form-label">Taille recommandée</label>
                  <input type="number" className="form-input" style={{ width: '100%' }} min={1} max={20}
                    value={recommendedSize} onChange={(e) => setRecommend(Number(e.target.value))} />
                  <span className="form-hint">Nombre idéal d'étudiants.</span>
                </div>
                <div className="form-row" style={{ marginBottom: 0 }}>
                  <label className="form-label">Capacité maximale</label>
                  <input type="number" className="form-input" style={{ width: '100%' }} min={1} max={20}
                    value={maxCohortSize} onChange={(e) => setMaxSize(Number(e.target.value))} />
                  <span className="form-hint">Plafond d'inscription (1–20).</span>
                </div>
              </div>

              {/* Learning outcomes */}
              <div className="form-row">
                <label className="form-label">
                  Objectifs d'apprentissage <span style={{ color: '#c25d4b' }}>*</span>
                </label>
                <p style={{ margin: '0 0 12px', fontSize: 10, color: '#9aa4ab' }}>
                  Utilisez des verbes d'action — « Construire », « Analyser », « Présenter ».
                </p>
                <div className="outcomes-list-edit">
                  {outcomes.map((o, i) => (
                    <div key={i} className="outcome-row">
                      <input
                        className="form-input" style={{ flex: 1 }}
                        placeholder={`Objectif ${i + 1} — ex : Construire un modèle financier de zéro`}
                        value={o} onChange={(e) => updateOutcome(i, e.target.value)}
                      />
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
        )}

        {/* ── STEP 3: Exercices (Explorations) ── */}
        {step === 3 && (
          <div className="form-card">
            <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, letterSpacing: '-.3px' }}>
              Exercices & Explorations
            </h3>
            <p style={{ margin: '0 0 6px', fontSize: 11, color: '#87919a' }}>
              Les <strong>Explorations</strong> sont des tâches à la maison que vous assignez aux étudiants entre les sessions.
            </p>
            <p style={{ margin: '0 0 24px', fontSize: 10, color: '#9aa4ab' }}>
              Cette étape est facultative — vous pourrez en ajouter après la création du programme.
            </p>

            <div className="explor-rows">
              {explorations.map((e, i) => (
                <div key={i} className="explor-row">
                  <span className="explor-row-num">#{i + 1}</span>
                  <input
                    className="form-input" style={{ width: '100%' }}
                    placeholder={`Titre — ex : Analyser le bilan d'une entreprise`}
                    value={e.title} onChange={(ev) => updateExplor(i, 'title', ev.target.value)}
                  />
                  <textarea
                    className="form-textarea" style={{ width: '100%', minHeight: 60 }}
                    placeholder="Description de la tâche (optionnelle)"
                    value={e.description} onChange={(ev) => updateExplor(i, 'description', ev.target.value)}
                  />
                  {explorations.length > 1 && (
                    <button
                      type="button"
                      style={{ alignSelf: 'flex-start', border: 0, background: 'none', color: '#c0c8ce', cursor: 'pointer', padding: 0, fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={() => removeExplor(i)}
                    >
                      <Trash2 size={11} /> Supprimer
                    </button>
                  )}
                </div>
              ))}
            </div>

            {explorations.length < 6 && (
              <button type="button" className="explor-add" onClick={addExplor}>
                <Plus size={13} /> Ajouter une exploration
              </button>
            )}
          </div>
        )}

        {/* Feedback */}
        {error   && <div className="form-error"   style={{ marginTop: 14 }}>{error}</div>}
        {success && <div className="form-success" style={{ marginTop: 14 }}><CheckCircle2 size={13} /> {success}</div>}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <button
            className="secondary-button"
            onClick={step === 1 ? () => router.push('/coach/programs') : handleBack}
          >
            {step === 1 ? 'Annuler' : <><ArrowLeft size={13} /> Précédent</>}
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            {step < 3 ? (
              <button className="primary-button" onClick={handleNext}>
                Suivant <ArrowRight size={13} />
              </button>
            ) : (
              <>
                <button className="outline-button" disabled={submitting} onClick={() => handleSubmit('draft')}>
                  {submitting && submitMode === 'draft'
                    ? <><Loader2 size={12} className="spin" /> Sauvegarde…</>
                    : 'Sauvegarder brouillon'}
                </button>
                <button className="primary-button" disabled={submitting} onClick={() => handleSubmit('publish')}>
                  {submitting && submitMode === 'publish'
                    ? <><Loader2 size={12} className="spin" /> Publication…</>
                    : <><CheckCircle2 size={13} /> Publier le programme</>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
