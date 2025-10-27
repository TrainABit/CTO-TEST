# Atlas Finance UI Starter

A Next.js 14 starter configured with TypeScript, Tailwind CSS, shadcn/ui, and a themed dashboard shell for rapid product iterations.

## Stack

- **Next.js 14 App Router** with TypeScript and the Geist font family
- **Tailwind CSS 3** with design tokens, dark/light themes, and shadcn/ui primitives
- **State & Visuals**: Zustand for lightweight state management, Recharts for data viz, Lucide icons
- **Tooling**: ESLint (Next.js + Tailwind rules), Prettier (with Tailwind plugin), Husky + lint-staged pre-commit hooks

## Getting Started

```bash
pnpm install
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start the development server.                |
| `pnpm build`        | Create an optimized production build.        |
| `pnpm start`        | Run the production build locally.            |
| `pnpm lint`         | Run Next.js linting.                         |
| `pnpm lint:eslint`  | Run ESLint directly with `--max-warnings=0`. |
| `pnpm format`       | Check formatting using Prettier.             |
| `pnpm format:write` | Format the codebase with Prettier.           |

On commit, Husky runs `pnpm lint-staged` to lint and format staged files automatically.

## Project Structure

```
src/
  app/            # App Router routes and layouts
  components/     # Reusable UI primitives and layout components
  lib/            # Utilities (e.g., className helpers)
  store/          # Zustand stores
public/           # Icons, manifest placeholders, and images
```

The default dashboard includes a responsive navigation bar with a theme toggle, summary cards, and a sample performance chart driven by Zustand range selection.

## Additional Notes

- Tailwind tokens are defined in `src/app/globals.css` and consumed through `tailwind.config.ts`.
- shadcn/ui components live under `src/components/ui`.
- Metadata (SEO, OpenGraph, icons) is configured in `src/app/layout.tsx` and uses placeholder assets located in `public/`.
