# AGENTS.md

Project conventions for AI agents and humans editing this codebase.

## Original request
create a todo app to add or remove tasks with authentication

## Goal
Build a minimal-editorial Todo SaaS app with authentication (login/signup) and a protected dashboard where users can add, toggle, and delete personal tasks.

## Project type
saas-app

## Design system — match this exactly
- Color tokens: `--background: #f1f5f9`, `--foreground: #1e293b`, `--card: #ffffff`, `--border: #e2e8f0`, `--muted-foreground: #64748b`, `--primary: #6366f1`, `--primary-foreground: #ffffff`, `--accent: #e0e7ff`
- Fonts: Inter

## Existing components — reuse these, don't create near-duplicates
- Footer (components/Footer.tsx)
- LanguageToggle (components/LanguageToggle.tsx)
- LocaleProvider (components/LocaleProvider.tsx)
- Navbar (components/Navbar.tsx)

## Existing i18n namespaces
Every translation key must be namespaced (`hero.title`, never a bare `title`) so two components never collide on the same catalog slot. Reuse one of these, or pick a new, distinct name:
`dashboardPage`, `hero`, `login`, `loginPage`, `nav`, `signUpRegister`, `signup`, `signupPage`

When editing or adding pages: preserve the design system above, reuse existing components and the shared nav data file, and keep the established structure and tone.
