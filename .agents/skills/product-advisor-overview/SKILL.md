---
name: product-advisor-overview
description: INVOKE THIS SKILL for an overview of the full-stack architecture. Covers how the FastAPI backend and Next.js frontend connect, the hybrid LLM + deterministic search pattern, and project conventions for replicating similar apps.
---

<oneliner>
Full-stack product recommendation app with a Python FastAPI backend (TF-IDF search + LangChain LLM intent extraction) and a Next.js 14 React frontend (Tailwind CSS, dark mode, multi-step wizard). Deployed via Docker on Render.com.
</oneliner>

<architecture>
## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Frontend (Next.js 14 / React 18 / Tailwind)    │
│  Port 3000                                      │
│  ┌─────────────┐  ┌──────────────┐              │
│  │  Advisor.tsx │  │ ProductCard  │              │
│  │  (Wizard)    │  │ (Results)    │              │
│  └──────┬──────┘  └──────────────┘              │
│         │ POST /api/recommend                    │
└─────────┼───────────────────────────────────────┘
          │
┌─────────┼───────────────────────────────────────┐
│  Backend (FastAPI / Python 3.12)                 │
│  Port 8000                                      │
│  ┌──────▼──────┐                                │
│  │  main.py    │ ← Routes + CORS                │
│  │  (FastAPI)  │                                 │
│  └──┬──────┬───┘                                │
│     │      │                                     │
│  ┌──▼──┐ ┌─▼────────┐                           │
│  │ llm │ │ search.py │                           │
│  │.py  │ │ (TF-IDF)  │                           │
│  └──┬──┘ └─────┬─────┘                          │
│     │          │                                 │
│  OpenAI    CSV Data                              │
│  (optional)                                      │
└─────────────────────────────────────────────────┘
```

### Hybrid Search Pattern
1. **User fills wizard** → frontend sends structured fields + optional freeform text.
2. **LLM intent extraction** (optional) → parses freeform text into structured intent via LangChain.
3. **Deterministic search** → TF-IDF + keyword filters over CSV product data.
4. **Results returned** → ranked products with competitor comparison data.

The LLM is optional — the app degrades gracefully to keyword-only search when `OPENAI_API_KEY` is not set.
</architecture>

<replication-checklist>
## Replication Checklist for Similar Apps

### Backend Setup
1. Create `pyproject.toml` with `fastapi`, `uvicorn`, `pandas`, `scikit-learn`, `langchain-openai`, `python-dotenv`.
2. Create `backend/` package with `__init__.py`, `main.py`, `models.py`, `search.py`, `llm.py`.
3. Place product data CSV at project root.
4. Configure `.env` with `OPENAI_API_KEY` and `ALLOWED_ORIGINS`.
5. Use Python 3.12+ for `X | None` syntax.

### Frontend Setup
1. `npx create-next-app@14 frontend` with TypeScript, Tailwind, App Router, `src/` directory.
2. Set `output: "standalone"` in `next.config.mjs`.
3. Set `darkMode: "media"` in `tailwind.config.ts`.
4. Create base styles in `globals.css` with dark mode body classes.
5. Build components under `src/components/`.
6. Use `NEXT_PUBLIC_API_URL` env var for backend URL.

### Testing Setup
1. Install `@playwright/test` as dev dependency.
2. Create `playwright.config.ts` with light/dark theme projects.
3. Create tests under `frontend/tests/` as `*.spec.ts`.

### Deployment Setup
1. Create `Dockerfile` using `python:3.12-slim` + `uv`.
2. Create `render.yaml` for Render.com IaC.
3. Set secrets (`OPENAI_API_KEY`, `ALLOWED_ORIGINS`) in Render dashboard.

### Virtual Environment
1. Always use `.venv/` at project root.
2. Activate before every shell command: `source .venv/bin/activate`.
3. Use `uv pip install` for fast installs.
</replication-checklist>

<folder-structure>
## Full Project Structure

```
project-root/
├── .agents/
│   └── skills/              # Copilot SKILL.md files
├── .env                     # Local env vars (gitignored)
├── .github/
│   └── copilot-instructions.md  # Copilot agent rules
├── backend/
│   ├── __init__.py
│   ├── llm.py               # LangChain LLM intent extraction
│   ├── main.py              # FastAPI app, routes, CORS
│   ├── models.py            # Pydantic schemas
│   └── search.py            # TF-IDF search engine
├── frontend/
│   ├── next.config.mjs
│   ├── package.json
│   ├── playwright.config.ts
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── components/
│   │       ├── Advisor.tsx    # Multi-step wizard
│   │       └── ProductCard.tsx
│   └── tests/
│       └── *.spec.ts         # Playwright E2E tests
├── Dockerfile                # Backend container
├── render.yaml               # Render.com deployment
├── pyproject.toml            # Python dependencies
└── *.csv                     # Product data
```
</folder-structure>

<tech-stack-summary>
## Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Language (backend)** | Python | >= 3.12 |
| **Framework (backend)** | FastAPI | >= 0.115 |
| **Server** | Uvicorn | >= 0.32 |
| **Data** | Pandas + CSV | >= 2.2 |
| **Search** | scikit-learn TF-IDF | >= 1.5 |
| **LLM** | LangChain + OpenAI | >= 1.2 |
| **Language (frontend)** | TypeScript | >= 5.0 |
| **Framework (frontend)** | Next.js (App Router) | 14.x |
| **UI** | React | 18.x |
| **Styling** | Tailwind CSS | 3.4.x |
| **Dark mode** | System-aware (`prefers-color-scheme`) | — |
| **E2E Tests** | Playwright | >= 1.59 |
| **Package mgmt (Python)** | uv + pyproject.toml | latest |
| **Package mgmt (JS)** | npm + package.json | — |
| **Container** | Docker (python:3.12-slim) | — |
| **Deployment** | Render.com (render.yaml) | — |
</tech-stack-summary>
