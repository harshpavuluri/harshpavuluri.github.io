# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio website for Harsha Pavuluri. React + Vite SPA with Tailwind CSS, Framer Motion animations, and tsParticles. Deployed to GitHub Pages via GitHub Actions.

## Commands

- `npm run dev` — Start local dev server
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally

## Deployment

Push to `main` branch triggers GitHub Actions (`.github/workflows/deploy.yml`) which builds and deploys to GitHub Pages. The source lives in `main`; the built output is deployed via Actions artifact (not a separate branch).

**Important**: In GitHub repo Settings > Pages, the source must be set to "GitHub Actions".

## Architecture

React SPA with all sections on one scrollable page. Content is separated from components:

- **`src/data/`** — All editable content (personalInfo, skills, projects, socialLinks). To update the portfolio, edit these files only.
- **`src/sections/`** — Page sections: Hero, About, Skills, Projects, Contact, Footer
- **`src/components/`** — Reusable pieces: Navbar, ScrollReveal (animation wrapper), ParticleBackground, SectionDivider
- **`public/images/`** — Project and background images

## Tech Stack

- React 19, Vite 7, Tailwind CSS v4 (`@tailwindcss/vite` plugin — no config file needed)
- Framer Motion — scroll-triggered reveals, parallax, hover effects
- @tsparticles/react + @tsparticles/slim — interactive particle background
- react-icons — brand icons for skills section (Simple Icons set)
- react-scroll — smooth scrolling nav with active state detection

## Theme

Custom theme defined in `src/index.css` via Tailwind `@theme`:
- Background: `#0a0a0f` (bg-dark), `#111118` (bg-card)
- Primary accent: `#00f0ff` (cyan glow)
- Secondary accent: `#7c3aed` (purple, used for tags)
- Font: Inter (Google Fonts)

## Common Changes

- **Update content**: Edit files in `src/data/` (personalInfo.js, projects.js, skills.js, socialLinks.js)
- **Add a project**: Add entry to `src/data/projects.js`, place image in `public/images/`
- **Add a skill**: Add entry to `src/data/skills.js`, import the icon in `src/sections/Skills.jsx`
- **Styling changes**: Edit `src/index.css` for theme variables, or Tailwind classes in components
