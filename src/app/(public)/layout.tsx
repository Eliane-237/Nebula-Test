import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getSession } from '@/lib/session';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  return (
    <div className="public-shell">
      <header className="public-nav">
        <div className="pub-nav-inner">
          <Link href="/programs" className="pub-brand">
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
              <Link href="/dashboard" className="pub-btn-primary">
                Dashboard <ArrowUpRight size={14} />
              </Link>
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
