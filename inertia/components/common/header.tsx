import { Link } from '@inertiajs/react'
import React from "react";

type ProbsHeader = {
  activeLink: string
  children?: React.ReactNode;
}

export default function Header(props: ProbsHeader) {
  const {activeLink, children} = props;

  const links = [
    { name: 'Configuration', href: '/configuration' },
    { name: 'Dashboard', href: '/'},
    { name: 'History', href: '/history' }
  ];

  return (
  <>
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <h1 className="app-title">
            <span className="app-icon">🐍</span>
            Python Script Launcher
          </h1>
          <nav className="nav">
            {links.map((link) => (
              <Link
                key={link.name}
                className={`nav-btn ${activeLink === link.name ? 'active' : ''}`}
                href={link.href}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>

  <main className="main-content">
    <div className="container">
      {children}
    </div>
  </main>
  </>
  )
}
