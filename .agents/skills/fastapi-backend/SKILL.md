---
name: fastapi-backend
description: INVOKE THIS SKILL when building or modifying the Python FastAPI backend. Covers project structure, FastAPI app setup, Pydantic models, CSV-backed search with TF-IDF, LLM intent extraction via LangChain, and CORS configuration.
---

<oneliner>
Build a FastAPI backend with a CSV-backed TF-IDF search engine, LangChain-powered LLM intent extraction, and Pydantic request/response models. Uses `uv` for dependency management with `pyproject.toml`.
</oneliner>

<project-structure>
## Backend Project Structure

```
backend/
  __init__.py          # Package marker (empty)
  main.py              # FastAPI app, lifespan, routes, CORS
  models.py            # Pydantic request/response schemas
  search.py            # TF-IDF search engine over CSV product data
  llm.py               # LangChain OpenAI structured output for intent extraction
pyproject.toml         # Dependencies and project metadata
*.csv                  # Product data CSV at project root
.env                   # Environment variables (OPENAI_API_KEY, etc.)
```

### Key conventions
- Python >= 3.12 required (uses `X | None` union syntax).
- All backend code lives under the `backend/` package.
- `pyproject.toml` is the single dependency manifest — no `requirements.txt`.
- Use `uv` for fast dependency installation: `uv pip install --system --no-cache -r pyproject.toml`.
- Environment variables loaded via `python-dotenv` from `.env` at project root.
</project-structure>

<dependencies>
## Dependencies

### Core
| Package | Purpose | Min Version |
|---------|---------|-------------|
| `fastapi` | Web framework | >= 0.115.0 |
| `uvicorn[standard]` | ASGI server | >= 0.32.0 |
| `pandas` | CSV loading & DataFrame operations | >= 2.2.0 |
| `scikit-learn` | TF-IDF vectorization & cosine similarity | >= 1.5.0 |
| `httpx` | Async HTTP client (FastAPI test client) | >= 0.27.0 |
| `python-dotenv` | Load `.env` files | >= 1.0.0 |
| `langchain` | LLM orchestration | >= 1.2.15 |
| `langchain-core` | Core LangChain primitives | >= 1.3.2 |
| `langchain-openai` | OpenAI ChatModel integration | >= 1.2.1 |

### Install
```bash
source .venv/bin/activate
uv pip install --no-cache -r pyproject.toml
```
</dependencies>

<fastapi-app>
## FastAPI App Setup

### Lifespan pattern
Use `@asynccontextmanager` for startup/shutdown logic. Load the search engine at startup:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

engine: ProductSearchEngine | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global engine
    engine = ProductSearchEngine(str(CSV_PATH))
    yield

app = FastAPI(title="App Name", lifespan=lifespan)
```

### CORS
Configure CORS from an environment variable (comma-separated origins), defaulting to `http://localhost:3000`:

```python
import os
from fastapi.middleware.cors import CORSMiddleware

_allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Route conventions
- API routes under `/api/` prefix.
- POST `/api/recommend` — main recommendation endpoint.
- GET `/api/health` — health check returning `{"status": "ok"}`.
- Use `response_model=` on route decorators for automatic serialization.
</fastapi-app>

<pydantic-models>
## Pydantic Models

Define request and response schemas in `models.py`:

```python
from pydantic import BaseModel

class RecommendRequest(BaseModel):
    category: str | None = None
    goal: str | None = None
    format_pref: str | None = None
    freeform: str | None = None

class ProductResult(BaseModel):
    sku: str
    name: str
    brand: str
    details: str
    price: float
    tags: str
    target_needs: str
    key_benefits: str
    why_choose_amway: str
    competitor: CompetitorInfo
    relevance_score: float

class RecommendResponse(BaseModel):
    products: list[ProductResult]
    parsed_intent: dict | None = None
```

### Conventions
- Use `str | None = None` for optional fields (Python 3.12+).
- Nested models for structured sub-objects (e.g., `CompetitorInfo`).
- Response model used in `@app.post(..., response_model=RecommendResponse)`.
</pydantic-models>

<search-engine>
## CSV-Backed TF-IDF Search Engine

The search engine in `search.py` loads a CSV into a Pandas DataFrame, builds a TF-IDF matrix from concatenated text columns, and uses cosine similarity for relevance ranking.

### Architecture
1. **Load CSV** → `pd.read_csv()`, fill NaN with `""`.
2. **Build search text** → concatenate lowercase text from multiple columns into `_search_text`.
3. **TF-IDF Vectorization** → `TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1, 2))`.
4. **Search flow**:
   - Apply boolean filters (category, goal keywords, format, demographics, price).
   - Rank filtered results using cosine similarity against a query vector.
   - Deduplicate by a base product identifier.
   - Return top-K results.

### Keyword dictionaries
Define `GOAL_KEYWORDS` and `FORMAT_KEYWORDS` as `dict[str, list[str]]` for mapping user-facing goal names to search terms.

### Price filtering
Use `operator` module comparators mapped from string operators (`lt`, `lte`, `gt`, `gte`, `eq`). Apply price filters gracefully — only narrow results if matches remain.

### Fallback strategy
If filters produce zero results, relax to category-only filtering. If still empty, search the entire dataset.
</search-engine>

<llm-intent>
## LLM Intent Extraction

The `llm.py` module uses LangChain's `ChatOpenAI` with `.with_structured_output()` to extract structured intent from freeform user text.

### Pattern
```python
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

class UserIntent(BaseModel):
    needs: list[str] = Field(description="List of product needs mentioned")
    demographics: str | None = Field(default=None)
    constraints: list[str] = Field(default_factory=list)
    price_constraints: list[PriceConstraint] = Field(default_factory=list)

llm = ChatOpenAI(model="gpt-5-nano", temperature=0, max_tokens=150)
structured_llm = llm.with_structured_output(UserIntent)
result = await structured_llm.ainvoke([
    {"role": "system", "content": SYSTEM_PROMPT},
    {"role": "user", "content": text[:500]},
])
```

### Conventions
- Lazy-initialize the LLM singleton — only create if `OPENAI_API_KEY` is set.
- Truncate user input to 500 chars before sending to LLM.
- Return `None` on any exception (graceful degradation — app works without LLM).
- Use enums for constrained fields (e.g., `PriceOperator`).
- Model name configurable via `OPENAI_MODEL_NAME` env var.
</llm-intent>

<env-vars>
## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `OPENAI_API_KEY` | OpenAI API key for LLM | (none — LLM disabled if absent) |
| `OPENAI_MODEL_NAME` | Model to use for intent extraction | `gpt-5-nano` |
| `LLM_PROVIDER` | LLM provider label | `openai` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000` |
</env-vars>

<running>
## Running the Backend

```bash
source .venv/bin/activate
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: `curl http://localhost:8000/api/health`
</running>
