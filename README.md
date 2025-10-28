# Atlas Finance UI Starter

[![CI](https://github.com/TrainABit/CTO-TEST/actions/workflows/ci.yml/badge.svg)](https://github.com/TrainABit/CTO-TEST/actions/workflows/ci.yml)

A Next.js 14 starter configured with TypeScript, Tailwind CSS, shadcn/ui, and a themed dashboard shell for rapid product iterations.

## Production Deployment

- **Production**: https://cto-test.vercel.app
- **Preview environments**: Every pull request automatically receives a Vercel preview (`https://cto-test-git-<branch>-trainabit.vercel.app`).

## Stack

- **Next.js 14 App Router** with TypeScript, automatic static optimization, and the Geist font family
- **Tailwind CSS 3** with design tokens, dark/light themes, and shadcn/ui primitives
- **State & Visuals**: Zustand for lightweight state management, Recharts for data viz, Lucide icons for UI affordances
- **Tooling**: ESLint (Next.js + Tailwind rules), Prettier (with Tailwind plugin), Husky + lint-staged pre-commit hooks

## Getting Started

### Requirements

- Node.js 18+
- npm 9+

### Installation & Development

```bash
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Quality Gates

Run the same steps that the CI workflow enforces:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

## Available Scripts

| Script                  | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `npm run dev`           | Start the development server.                   |
| `npm run build`         | Create an optimized production build.           |
| `npm run start`         | Run the production build locally.               |
| `npm run lint`          | Execute Next.js linting (ESLint).               |
| `npm run lint:eslint`   | Run ESLint directly with `--max-warnings=0`.    |
| `npm run typecheck`     | Type-check the project with `tsc --noEmit`.     |
| `npm run test`          | Run the Vitest test suite once.                 |
| `npm run test:watch`    | Run Vitest in watch mode.                       |
| `npm run format`        | Check formatting using Prettier.                |
| `npm run format:write`  | Format the codebase with Prettier.              |
| `npm run export:static` | Build and generate a static export into `out/`. |

On commit, Husky runs `lint-staged` to lint and format staged files automatically.

## Project Structure

```
src/
  app/            # App Router routes and layouts
  components/     # Reusable UI primitives and layout components
  content/        # Structured strategic planning content & scoring helpers
  data/           # Compatibility re-exports for shared data modules
  hooks/          # Client-side hooks (e.g., localStorage helpers)
  lib/            # Utilities (formatters, helpers)
  store/          # Zustand stores for persisted UI state
  utils/          # Shared domain utilities & calculations
public/           # Icons, manifest placeholders, and images
docs/             # Documentation assets and diagrams
```

The default dashboard includes a responsive navigation bar with a theme toggle, summary cards, plan comparison tooling, and detailed capital deployment tracking pages. Each strategic plan now exposes a dedicated detail route (`/plans/[id]`) with persistent checklists, KPI tracking, and exit-readiness workflows.

## Deployment Notes

- CI runs via GitHub Actions (`.github/workflows/ci.yml`) and mirrors the local quality gates.
- Vercel automatically deploys the `main` branch to production and generates preview URLs for pull requests.
- No environment variables are required for the current feature set; the app renders statically by default.
