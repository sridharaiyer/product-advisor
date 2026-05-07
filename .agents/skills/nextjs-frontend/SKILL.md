---
name: nextjs-frontend
description: INVOKE THIS SKILL when building or modifying the Next.js frontend. Covers project structure, App Router, Tailwind CSS styling, dark mode, component patterns, Playwright E2E testing, and API integration.
---

<oneliner>
Build a Next.js 14 App Router frontend with React 18, Tailwind CSS 3.4, system-aware dark mode, TypeScript, and Playwright E2E tests. Uses `@/*` path aliases and standalone output for containerization.
</oneliner>

<project-structure>
## Frontend Project Structure

```
frontend/
  next.config.mjs        # Next.js config (standalone output)
  package.json            # Dependencies and scripts
  tsconfig.json           # TypeScript config with @/* path alias
  tailwind.config.ts      # Tailwind CSS config (darkMode: "media")
  postcss.config.mjs      # PostCSS with Tailwind + Autoprefixer
  playwright.config.ts    # Playwright E2E test config
  src/
    app/
      globals.css         # Tailwind directives + base layer styles
      layout.tsx          # Root layout (metadata, html/body)
      page.tsx            # Home page (renders main component)
    components/
      Advisor.tsx          # Multi-step questionnaire wizard
      ProductCard.tsx      # Product display card with expand/collapse
  tests/
    theme.spec.ts          # Playwright dark/light theme tests
```

### Key conventions
- **App Router** — all pages under `src/app/`, components under `src/components/`.
- **Path alias** — `@/*` maps to `./src/*` (configured in `tsconfig.json`).
- **Standalone output** — `next.config.mjs` sets `output: "standalone"` for Docker deployments.
- **No external UI library** — all styling done with Tailwind utility classes.
</project-structure>

<dependencies>
## Dependencies

### Runtime
| Package | Purpose | Version |
|---------|---------|---------|
| `next` | React framework (App Router) | ^14.2.0 |
| `react` | UI library | ^18.3.0 |
| `react-dom` | React DOM renderer | ^18.3.0 |

### Dev
| Package | Purpose | Version |
|---------|---------|---------|
| `typescript` | Type checking | ^5.0.0 |
| `@types/react` | React type defs | ^18.3.0 |
| `@types/react-dom` | React DOM type defs | ^18.3.0 |
| `@types/node` | Node.js type defs | ^20.0.0 |
| `tailwindcss` | Utility-first CSS | ^3.4.0 |
| `postcss` | CSS processing | ^8.4.0 |
| `autoprefixer` | Vendor prefixing | ^10.4.0 |
| `@playwright/test` | E2E testing | ^1.59.1 |

### Install
```bash
cd frontend && npm install
```
</dependencies>

<styling>
## Tailwind CSS Styling

### Configuration
- **Dark mode**: `"media"` — follows system preference via `prefers-color-scheme`.
- **Content paths**: `["./src/**/*.{js,ts,jsx,tsx,mdx}"]`.
- **No custom theme extensions** — uses default Tailwind palette.

### Base styles (`globals.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100;
  }
}
```

### Color palette conventions
| Element | Light | Dark |
|---------|-------|------|
| Page background | `bg-gray-50` | `dark:bg-gray-950` |
| Card background | `bg-white` | `dark:bg-gray-900` |
| Primary accent | `indigo-600` | `dark:indigo-400` |
| Text primary | `text-gray-900` | `dark:text-gray-100` |
| Text secondary | `text-gray-500` | `dark:text-gray-400` |
| Borders | `border-gray-200` | `dark:border-gray-700` |
| Hover states | `hover:border-indigo-400 hover:bg-indigo-50` | `dark:hover:bg-indigo-950` |
| Success/highlight | `emerald-50/800` | `dark:emerald-950/400` |

### Component patterns
- Cards: `rounded-xl border shadow-sm` with hover `hover:shadow-md transition-shadow`.
- Badges: `px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full`.
- Buttons: `p-4 rounded-xl border-2 hover:border-indigo-400 transition-all`.
- Step indicators: `px-3 py-1.5 rounded-full text-sm font-medium` with active/inactive states.
- Gradient text: `bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent`.
</styling>

<component-patterns>
## Component Patterns

### Multi-Step Wizard (Advisor.tsx)
The main UI pattern is a multi-step questionnaire with state machine navigation:

```typescript
type Step = "category" | "goal" | "format" | "freeform" | "loading" | "results";
```

**Pattern**:
- `useState` for each step's selected value + current step.
- Navigation helpers (`selectCategory`, `selectGoal`, `handleBack`, `reset`).
- Step indicator showing progress with completed/active/upcoming states.
- Conditional rendering per step inside a single component.
- API call on submit with loading state and error handling.

### Card Component (ProductCard.tsx)
Expandable card with:
- Header (brand, name, price).
- Benefits badges (split from comma-separated string).
- Highlighted section ("Why Choose" with emerald background).
- Expand/collapse toggle for detailed content.

### Conventions
- All interactive components are `"use client"` components.
- Inline types defined at top of component files (no separate `.d.ts`).
- Options/data arrays defined as constants in the component file.
- API URL from `process.env.NEXT_PUBLIC_API_URL` with `http://localhost:8000` fallback.
</component-patterns>

<api-integration>
## API Integration

### Environment variable
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Fetch pattern
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const res = await fetch(`${API_URL}/api/recommend`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    category: category || null,
    goal: goal || null,
    format_pref: formatPref || null,
    freeform: freeform.trim() || null,
  }),
});
const data = await res.json();
```

### Conventions
- Use native `fetch` — no axios or SWR.
- Convert empty strings to `null` before sending.
- Set loading state before fetch, error state on failure.
- Response typed inline matching the backend Pydantic schema.
</api-integration>

<layout>
## Layout

### Root Layout (`layout.tsx`)
```typescript
export const metadata: Metadata = {
  title: "App Name",
  description: "App description",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
```

### Page (`page.tsx`)
Simple wrapper importing the main component:
```typescript
export default function Home() {
  return (
    <main className="min-h-screen">
      <MainComponent />
    </main>
  );
}
```
</layout>

<running>
## Running the Frontend

```bash
cd frontend
npm install
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build
npm run start      # Serve production build
```
</running>
