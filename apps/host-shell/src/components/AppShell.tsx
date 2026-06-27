import { Link } from '@tanstack/react-router';

import type { ReactNode } from 'react';

/**
 * Navigation item definition.
 */
interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

/**
 * SVG icon components for navigation items.
 */
function ChartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 3v14h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 13l3-4 3 2 4-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3 10h14M10 3c2 2.5 2 11.5 0 14M10 3c-2 2.5-2 11.5 0 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 5h12M4 10h12M4 15h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Navigation items configuration.
 */
const navItems: NavItem[] = [
  { to: '/portfolio', label: 'Portfolio', icon: <ChartIcon /> },
  { to: '/currencies', label: 'Currencies', icon: <GlobeIcon /> },
  { to: '/transactions', label: 'Transactions', icon: <ListIcon /> },
];

/**
 * Application Shell component.
 * Provides persistent navigation sidebar (desktop), bottom bar (mobile),
 * header, and main content area.
 */
export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="shell-layout">
      <Header />
      <Sidebar />
      <main className="shell-main">{children}</main>
      <BottomBar />
    </div>
  );
}

/**
 * Top header bar with application title and user avatar placeholder.
 */
function Header() {
  return (
    <header className="header-bar">
      <h1 className="header-bar__title">Wealth Analytics</h1>
      <div className="header-bar__avatar" aria-label="User profile">
        WA
      </div>
    </header>
  );
}

/**
 * Desktop navigation sidebar.
 * Uses TanStack Router's Link with activeProps for route highlighting.
 */
function Sidebar() {
  return (
    <nav className="nav-sidebar" aria-label="Main navigation">
      <ul className="nav-sidebar__list">
        {navItems.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="nav-sidebar__link"
              activeProps={{ className: 'nav-sidebar__link nav-sidebar__link--active' }}
            >
              <span className="nav-sidebar__icon">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Mobile bottom navigation bar (shown below 768px).
 */
function BottomBar() {
  return (
    <nav className="nav-bottom-bar" aria-label="Main navigation">
      <ul className="nav-bottom-bar__list">
        {navItems.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="nav-bottom-bar__link"
              activeProps={{ className: 'nav-bottom-bar__link nav-bottom-bar__link--active' }}
            >
              <span className="nav-bottom-bar__icon">{item.icon}</span>
              <span className="nav-bottom-bar__label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
