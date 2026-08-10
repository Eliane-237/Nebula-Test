'use client';

import { useActionState } from 'react';
import { applyAsCoachAction } from '@/app/actions/applyAsCoachAction';

const DOMAINS = [
  'Finance', 'Consulting', 'Data', 'Product',
  'Software Engineering', 'Marketing', 'Entrepreneurship',
];

type Props = { onClose: () => void };

export function CoachApplicationModal({ onClose }: Props) {
  const [state, formAction, pending] = useActionState(applyAsCoachAction, null);

  if (state?.success) {
    return (
      <div
        className="modal-overlay"
        onClick={onClose}
        style={{ cursor: 'pointer' }}
        role="dialog"
        aria-modal="true"
        aria-label="Application envoyée"
      >
        <div
          className="modal-card"
          onClick={(e) => e.stopPropagation()}
          style={{ textAlign: 'center', padding: '48px 36px', cursor: 'default' }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#E8F5EC',
            display: 'grid', placeItems: 'center', margin: '0 auto 20px', fontSize: 24,
          }}>✓</div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: '#123524', margin: '0 0 10px' }}>
            Candidature envoyée !
          </h2>
          <p style={{ color: '#6B7680', fontSize: 13, lineHeight: 1.6, margin: '0 0 24px' }}>
            Merci pour votre intérêt. Notre équipe examinera votre candidature
            et vous contactera dans les prochains jours.
          </p>
          <button
            onClick={onClose}
            style={{
              background: '#1F8A4C', color: '#fff', border: 'none', borderRadius: 9,
              padding: '11px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Candidature coach"
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520, width: '100%', cursor: 'default' }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#1F8A4C', textTransform: 'uppercase', letterSpacing: '.6px', margin: '0 0 8px' }}>
            Devenir coach
          </p>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: '#123524', margin: '0 0 6px' }}>
            Rejoignez notre réseau de coachs
          </h2>
          <p style={{ color: '#6B7680', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
            Partagez votre expertise avec de futurs professionnels. Notre équipe
            examine chaque candidature sous 48 h.
          </p>
        </div>

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-two-col">
            <div className="form-row">
              <label className="form-label">Nom complet *</label>
              <input className="form-input" name="name" placeholder="Maya Thompson" required />
            </div>
            <div className="form-row">
              <label className="form-label">Email *</label>
              <input className="form-input" name="email" type="email" placeholder="you@email.com" required />
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Domaine d&apos;expertise *</label>
            <select className="form-select" name="domain" required defaultValue="">
              <option value="" disabled>Sélectionnez un domaine</option>
              {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-row">
            <label className="form-label">Expérience professionnelle *</label>
            <textarea
              className="form-textarea"
              name="experience"
              rows={3}
              placeholder="Ex: 6 ans en investment banking chez un établissement bulge-bracket, spécialisé M&A…"
              required
            />
          </div>

          <div className="form-row">
            <label className="form-label">Pourquoi souhaitez-vous coacher ? *</label>
            <textarea
              className="form-textarea"
              name="motivation"
              rows={3}
              placeholder="Ce qui vous motive à transmettre vos compétences et accompagner des étudiants…"
              required
            />
          </div>

          {state?.error && (
            <div className="alert-error">{state.error}</div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              className="secondary-button"
              disabled={pending}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              style={{
                background: '#1F8A4C', color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 20px', fontSize: 12, fontWeight: 700, cursor: pending ? 'wait' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              {pending ? 'Envoi en cours…' : 'Envoyer ma candidature →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
