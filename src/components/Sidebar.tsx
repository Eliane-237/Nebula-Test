'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  BookOpen, BriefcaseBusiness, CalendarDays, CircleHelp,
  Compass, LayoutDashboard, LogOut, Menu, Settings, Users, X,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/logoutAction';
import { useUser } from '@/lib/user-context';
import type { Role } from '@/types';

type SidebarProps = {
  role: Role;
  activePage: string;
  onPageChange: (page: string) => void;
};

const roleItems: Record<Role, { label: string; icon: typeof LayoutDashboard; href: string }[]> = {
  student: [
    { label: 'Overview',         icon: LayoutDashboard,   href: '/dashboard'    },
    { label: 'Explore programs', icon: Compass,           href: '/programs'     },
    { label: 'My programs',      icon: BriefcaseBusiness, href: '/my-programs'  },
    { label: 'Calendar',         icon: CalendarDays,      href: '/calendar'     },
  ],
  coach: [
    { label: 'Overview',    icon: LayoutDashboard,   href: '/dashboard'      },
    { label: 'My programs', icon: BriefcaseBusiness, href: '/coach/programs' },
    { label: 'Calendar',    icon: CalendarDays,      href: '/calendar'       },
  ],
  admin: [
    { label: 'Platform overview', icon: LayoutDashboard, href: '/admin'    },
    { label: 'All programs',      icon: BookOpen,        href: '/programs' },
    { label: 'Cohorts',           icon: Users,           href: '/cohorts'  },
    { label: 'Calendar',          icon: CalendarDays,    href: '/calendar' },
  ],
};

const AVATAR_BG: Record<Role, string> = {
  student: '#69a785',
  coach:   '#8873a5',
  admin:   '#5485ac',
};

export function Sidebar({ role, activePage, onPageChange }: SidebarProps) {
  const [open, setOpen]   = useState(false);
  const router            = useRouter();
  const pathname          = usePathname();
  const user              = useUser();
  const items             = roleItems[role];

  const initials = user.name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLabel =
    role === 'student' ? 'Étudiant' :
    role === 'coach'   ? 'Coach' :
    'Administrateur';

  function navigate(href: string, label: string) {
    onPageChange(label);
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button className="mobile-menu" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu size={21} />
      </button>
      {open && (
        <button className="sidebar-scrim" onClick={() => setOpen(false)} aria-label="Close menu" />
      )}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-mark">n</span>
            <span className="brand-name">nebula</span>
          </div>
          <button className="close-menu" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={19} />
          </button>

          {/* User identity card — no role switcher */}
          <div className="role-switcher" style={{ cursor: 'default' }}>
            <span
              className="avatar"
              style={{ background: AVATAR_BG[role], width: 28, height: 28, borderRadius: 9, fontSize: 9, fontWeight: 800, flexShrink: 0 }}
            >
              {initials}
            </span>
            <div>
              <strong>{user.name}</strong>
              <small>{roleLabel}</small>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">Workspace</p>
          {items.map(({ label, icon: Icon, href }) => (
            <button
              key={label}
              className={`nav-item ${pathname === href ? 'active' : ''}`}
              onClick={() => navigate(href, label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
          <p className="nav-label nav-label-spaced">Manage</p>
          <button
            className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}
            onClick={() => navigate('/settings', 'Settings')}
          >
            <Settings size={18} /><span>Settings</span>
          </button>
          <button
            className={`nav-item ${pathname === '/help' ? 'active' : ''}`}
            onClick={() => navigate('/help', 'Help center')}
          >
            <CircleHelp size={18} /><span>Help center</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon">✦</span>
            <div>
              <strong>Make progress visible</strong>
              <p>Keep your goals close and your next step clear.</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="logout">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
