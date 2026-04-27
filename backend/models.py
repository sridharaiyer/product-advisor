from pydantic import BaseModel


class RecommendRequest(BaseModel):
    category: str | None = None
    goal: str | None = None
    format_pref: str | None = None
    freeform: str | None = None


class CompetitorInfo(BaseModel):
    brand: str
    product: str
    description: str
    url: str | None = None
    price: str | None = None


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
