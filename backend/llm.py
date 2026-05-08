import json
import logging
import os
from enum import Enum
from pathlib import Path

from dotenv import load_dotenv
from langchain_ollama import ChatOllama
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

_SYSTEM_PROMPT = """\
You are a product-recommendation assistant. Extract structured purchase intent
from the user message. Rules:
- Only extract what is explicitly stated or clearly implied.
- If the user mentions a price limit, extract it as a PriceConstraint with the
  correct operator and numeric value.
- Demographics should be a short label: "Kids", "Men", "Women", "Adults", etc.
- Needs should be concise wellness / product goals (e.g. "general health",
  "immunity", "energy").
"""


class PriceOperator(str, Enum):
    lt = "lt"
    lte = "lte"
    gt = "gt"
    gte = "gte"
    eq = "eq"


class PriceConstraint(BaseModel):
    """A single numeric price constraint extracted from user input."""

    operator: PriceOperator = Field(
        description=(
            "Comparison operator: lt (<), lte (<=), gt (>), gte (>=), eq (==)"
        )
    )
    value: float = Field(description="The numeric price threshold")


class UserIntent(BaseModel):
    """Structured intent extracted from a user message."""

    needs: list[str] = Field(description="List of product needs mentioned")
    demographics: str | None = Field(
        default=None, description="Demographic info if stated"
    )
    constraints: list[str] = Field(
        default_factory=list,
        description="Non-price constraints mentioned (e.g. organic, sugar-free)",
    )
    price_constraints: list[PriceConstraint] = Field(
        default_factory=list,
        description="Numeric price constraints extracted from the message",
    )


_llm: ChatOllama | None = None


def _get_llm() -> ChatOllama | None:
    global _llm
    if _llm is not None:
        return _llm
    api_key = os.getenv("OLLAMA_API_KEY")
    if not api_key:
        return None
    base_url = os.getenv("OLLAMA_BASE_URL", "https://api.ollama.com")
    _llm = ChatOllama(
        model=os.getenv("OLLAMA_MODEL", "gemma4:31b-cloud"),
        base_url=base_url,
        client_kwargs={"headers": {"Authorization": f"Bearer {api_key}"}},
        temperature=0,
    )
    return _llm


async def extract_intent(text: str) -> dict | None:
    llm = _get_llm()
    if llm is None:
        return None

    schema_prompt = (
        _SYSTEM_PROMPT
        + "\nRespond ONLY with a single JSON object (not an array) with these fields:\n"
        + json.dumps(UserIntent.model_json_schema(), indent=2)
    )

    try:
        structured_llm = llm.with_structured_output(UserIntent, method="json_schema")
        result = await structured_llm.ainvoke(
            [
                {"role": "system", "content": schema_prompt},
                {"role": "user", "content": text[:500]},
            ]
        )
        return result.model_dump()
    except Exception as exc:
        logger.warning("Structured output parsing failed: %s", exc)

    # Fallback: raw JSON invoke and manual parsing
    try:
        result = await llm.ainvoke(
            [
                {"role": "system", "content": schema_prompt},
                {"role": "user", "content": text[:500]},
            ]
        )
        raw = result.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)
        if isinstance(data, list):
            data = data[0] if data else {}
        intent = UserIntent.model_validate(data)
        return intent.model_dump()
    except Exception as exc:
        logger.error("LLM inference failed: %s", exc)
        return None
