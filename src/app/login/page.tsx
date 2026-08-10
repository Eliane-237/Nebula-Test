import { Suspense } from 'react';
import { LoginForm } from './LoginForm'; // ajuste le chemin selon ton arborescence

export const metadata = {
  title: 'Sign in — Nebula',
};

function LoginFallback() {
  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="auth-brand">
          <span className="brand-mark">n</span>
          <span className="auth-brand-name">nebula</span>
        </div>
        <div className="auth-footer">© 2026 Nebula Learning. All rights reserved.</div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="auth-sub">Sign in to continue your learning journey.</p>
          <div
            aria-hidden
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              marginTop: 24,
            }}
          >
            <div style={{ height: 42, borderRadius: 10, background: 'var(--line, #eceff1)' }} />
            <div style={{ height: 42, borderRadius: 10, background: 'var(--line, #eceff1)' }} />
            <div style={{ height: 42, borderRadius: 10, background: 'var(--line, #eceff1)', marginTop: 8 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}