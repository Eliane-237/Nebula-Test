import Link from 'next/link';
import { ArrowUpRight, LogOut } from 'lucide-react';
import { getSession } from '@/lib/session';
import { logoutAction } from '@/app/actions/logoutAction';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  const homeHref =
    user?.role === 'admin' ? '/admin' :
    user?.role === 'coach' ? '/coach/programs' :
    '/my-programs';

  return (
    <div className="public-shell">
      <header className="public-nav">
        <div className="pub-nav-inner">
          <Link href="/programs" className="pub-brand" translate="no">
            <span className="brand-mark">n</span>
            <span className="brand-name">nebula</span>
          </Link>

          <nav className="pub-nav-links">
            <Link href="/programs" className="pub-nav-link">Programs</Link>
            <a href="#how" className="pub-nav-link">How it works</a>
            <a href="#coaches" className="pub-nav-link">For coaches</a>
          </nav>

          <div className="pub-nav-actions">
            {user ? (
              <>
                <span
                  className="pub-nav-link"
                  style={{ fontSize: 12, color: '#9aa4ab', whiteSpace: 'nowrap' }}
                  translate="no"
                >
                  {user.name} · {user.role}
                </span>
                <Link href={homeHref} className="pub-btn-primary">
                  Dashboard <ArrowUpRight size={14} />
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="pub-btn-ghost"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="pub-btn-ghost">Sign in</Link>
                <Link href="/login" className="pub-btn-primary">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="public-main">{children}</main>
    </div>
  );
}