import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .llm import extract_intent
from .models import RecommendRequest, RecommendResponse
from .search import ProductSearchEngine

CSV_PATH = Path(__file__).resolve().parent.parent / "amway_intelligence_recommender.csv"

engine: ProductSearchEngine | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global engine
    engine = ProductSearchEngine(str(CSV_PATH))
    yield


app = FastAPI(title="Amway Product Advisor", lifespan=lifespan)

_allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest):
    parsed_intent = None
    freeform_needs = None
    price_constraints = None
    demographics = None

    if req.freeform and req.freeform.strip():
        parsed_intent = await extract_intent(req.freeform.strip())
        if parsed_intent:
            if parsed_intent.get("needs"):
                freeform_needs = " ".join(parsed_intent["needs"])
            if parsed_intent.get("price_constraints"):
                price_constraints = parsed_intent["price_constraints"]
            if parsed_intent.get("demographics"):
                demographics = parsed_intent["demographics"]

    products = engine.search(
        category=req.category,
        goal=req.goal,
        format_pref=req.format_pref,
        freeform_needs=freeform_needs,
        price_constraints=price_constraints,
        demographics=demographics,
    )

    return RecommendResponse(products=products, parsed_intent=parsed_intent)


@app.get("/api/health")
async def health():
    return {"status": "ok", "products_loaded": len(engine.df)}
