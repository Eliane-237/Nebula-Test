'use client';

import { type ReactNode } from 'react';
import { Bell, ChevronRight, LogOut, Search } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { useUser } from '@/lib/user-context';
import { logoutAction } from '@/app/actions/logoutAction';
import type { Role } from '@/types';

export function AppShell({ children }: { children: ReactNode }) {
  const user = useUser();

  const initials = user.name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      <Sidebar
        role={user.role as Role}
        activePage=""
        onPageChange={() => {}}
      />
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{user.name}</strong>
          </div>
          <div className="topbar-actions">
            <button className="search-trigger">
              <Search size={17} />
              <span>Search anything</span>
              <kbd>⌘ K</kbd>
            </button>
            <button className="notification-button" aria-label="Notifications">
              <Bell size={19} />
              <span />
            </button>
            <form action={logoutAction} style={{ display: 'contents' }}>
              <button
                type="submit"
                className="topbar-avatar"
                title={`${user.email} — Sign out`}
                style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, width: 'auto', padding: '0 8px', borderRadius: 9 }}
              >
                <span style={{ fontSize: 9, fontWeight: 800 }}>{initials}</span>
                <LogOut size={13} style={{ opacity: 0.7 }} />
              </button>
            </form>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
