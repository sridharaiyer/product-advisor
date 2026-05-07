---
name: deployment-docker-render
description: INVOKE THIS SKILL when containerizing or deploying the application. Covers Dockerfile with uv, Render.com deployment via render.yaml, environment variables, and production configuration.
---

<oneliner>
Containerize a Python FastAPI backend with Docker using `uv` for fast installs, and deploy to Render.com via `render.yaml` infrastructure-as-code. Frontend deployed separately or as standalone Next.js.
</oneliner>

<dockerfile>
## Dockerfile (Backend)

The backend uses a multi-stage-friendly slim Python image with `uv` for fast dependency resolution:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install uv for fast dependency resolution
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files first for caching
COPY pyproject.toml ./

# Install dependencies
RUN uv pip install --system --no-cache -r pyproject.toml

# Copy application code and data
COPY backend/ backend/
COPY *.csv .

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Key patterns
- **`uv` from multi-stage copy**: `COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv` — no pip needed.
- **Layer caching**: Copy `pyproject.toml` first, install deps, then copy source code.
- **`--system` flag**: Install into the system Python (no venv needed inside container).
- **`--no-cache`**: Keep image size small.
- **Slim base**: `python:3.12-slim` for minimal image size.
</dockerfile>

<render-yaml>
## Render.com Deployment

### `render.yaml` (Infrastructure as Code)

```yaml
services:
  - type: web
    name: product-advisor-api
    runtime: docker
    plan: free
    envVars:
      - key: OPENAI_API_KEY
        sync: false           # Set manually in Render dashboard
      - key: LLM_PROVIDER
        value: openai
      - key: OPENAI_MODEL_NAME
        value: gpt-5.4-nano
      - key: ALLOWED_ORIGINS
        sync: false           # Set manually — frontend URL
```

### Conventions
- `runtime: docker` — uses the project's `Dockerfile`.
- `sync: false` — secret values entered manually via Render dashboard (not committed).
- `plan: free` — use free tier for development/staging.
- Set `ALLOWED_ORIGINS` to the deployed frontend URL for CORS.
</render-yaml>

<frontend-deployment>
## Frontend Deployment (Next.js Standalone)

The frontend uses `output: "standalone"` in `next.config.mjs` for optimized container builds:

```mjs
const nextConfig = {
  output: "standalone",
};
```

### Dockerfile pattern for Next.js (if containerized)
```dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
ENV NEXT_PUBLIC_API_URL=https://your-api.onrender.com
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static .next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Environment variables
| Variable | Purpose | Where to set |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Build-time env var |
</frontend-deployment>

<local-dev>
## Local Development

```bash
# Terminal 1 — Backend
source .venv/bin/activate
uvicorn backend.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend runs at `http://localhost:3000`, backend at `http://localhost:8000`.
CORS is pre-configured to allow `http://localhost:3000` by default.
</local-dev>
