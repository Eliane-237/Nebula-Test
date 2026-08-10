'use client';

import { useActionState, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '@/app/actions/loginAction';
import { quickLoginAction } from '@/app/actions/quickLoginAction';

function QuickLogin({
  email,
  password,
  label,
  role,
  accentColor,
  redirect,
}: {
  email: string;
  password: string;
  label: string;
  role: string;
  accentColor: string;
  redirect: string;
}) {
  return (
    <form action={quickLoginAction}>
      <input type="hidden" name="email"    value={email}    />
      <input type="hidden" name="password" value={password} />
      <input type="hidden" name="redirect" value={redirect} />
      <button
        type="submit"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
          gap: 3, padding: '11px 14px', borderRadius: 10, border: '1.5px solid',
          borderColor: accentColor + '44', background: accentColor + '10',
          cursor: 'pointer', width: '100%', textAlign: 'left',
          transition: 'background .15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = accentColor + '20')}
        onMouseLeave={(e) => (e.currentTarget.style.background = accentColor + '10')}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: accentColor, letterSpacing: '.4px', textTransform: 'uppercase' }}>
          {role}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#35424c' }}>{label}</span>
        <span style={{ fontSize: 10, color: '#9aa4ab', fontFamily: 'DM Mono, monospace' }}>{email}</span>
      </button>
    </form>
  );
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect     = searchParams.get('redirect') ?? '';

  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="auth-shell">
      {/* ── Left visual panel ── */}
      <div className="auth-visual">
        <div className="auth-brand">
          <span className="brand-mark">n</span>
          <span className="auth-brand-name">nebula</span>
        </div>
        <div className="auth-quote">
          <blockquote>
            &ldquo;The best way to learn is by doing. Nebula gave me the structure and the coaching
            to go from curious to confident.&rdquo;
          </blockquote>
          <cite>— Priya S., Product Manager at Fintech Co.</cite>
        </div>
        <div className="auth-footer">© 2026 Nebula Learning. All rights reserved.</div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="auth-sub">Sign in to continue your learning journey.</p>

          <form action={formAction} style={{ marginBottom: 0 }}>
            <input type="hidden" name="redirect" value={redirect} />
            <div className="auth-field">
              <label>Email</label>
              <input type="email" name="email" placeholder="you@email.com" required />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" name="password" placeholder="••••••••" required minLength={3} />
            </div>
            {state?.error && <div className="auth-error">{state.error}</div>}
            <button
              type="submit"
              className="primary-button full-width"
              style={{ marginTop: 18, height: 42 }}
              disabled={pending}
            >
              {pending ? 'Please wait…' : 'Sign in'}
            </button>
          </form>

          <div style={{ margin: '24px 0 0' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
              color: '#9aa4ab',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.4px', whiteSpace: 'nowrap' }}>
                CONNEXION RAPIDE — DÉMO
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <QuickLogin email="student@nebula.com" password="student123" label="Alex Carter"   role="Étudiant" accentColor="#2e7a52" redirect={redirect} />
              <QuickLogin email="coach@nebula.com"   password="coach123"   label="Maya Thompson" role="Coach"    accentColor="#7a52a0" redirect={redirect} />
              <QuickLogin email="admin@nebula.com"   password="admin123"   label="Alicia Davis"  role="Admin"   accentColor="#3d607a" redirect={redirect} />
            </div>

            <p style={{ marginTop: 12, fontSize: 10, color: '#b5bec5', textAlign: 'center', lineHeight: 1.5 }}>
              Comptes de démonstration — aucune inscription requise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
