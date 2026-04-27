import operator as op

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

GOAL_KEYWORDS: dict[str, list[str]] = {
    # Wellness goals
    "digestive": [
        "digestive", "probiotic", "fiber", "enzyme", "gut",
        "bloating", "regularity", "prebiotic", "postbiotic",
    ],
    "daily_nutrition": [
        "multivitamin", "superfood", "fruits", "vegetables",
        "daily nutrition", "foundational", "greens", "phytonutrient",
    ],
    "energy_focus": [
        "energy", "focus", "caffeine", "mental", "b-vitamin",
        "nootropic", "ultra focus", "metabolism",
    ],
    "sleep_stress": [
        "sleep", "stress", "relaxation", "calming", "ashwagandha",
        "melatonin", "valerian", "chamomile", "adaptogen",
    ],
    "immunity": [
        "immune", "immunity", "cold", "flu", "seasonal",
        "echinacea", "vitamin c", "zinc", "elderberry",
    ],
    "joint_bone": [
        "joint", "bone", "glucosamine", "calcium", "msm",
        "turmeric", "mobility", "chondroitin",
    ],
    "heart": [
        "heart", "cardiovascular", "omega", "coq10", "cholesterol",
        "blood pressure", "garlic", "plant sterol",
    ],
    "brain_eye": [
        "memory", "brain", "cognitive", "eye", "vision", "lutein",
        "ginkgo", "lion", "bacopa", "dha", "phosphatidylserine",
    ],
    "weight": [
        "weight", "fat", "metabolism", "carb", "slimmetry",
        "thermogenic", "blocker", "ignite",
    ],
    "fitness": [
        "protein", "pre-workout", "post-workout", "recovery",
        "muscle", "bcaa", "hmb", "workout", "whey", "eaa",
    ],
    "women": [
        "women", "pms", "menopause", "cycle", "prenatal",
        "iron", "folate", "female",
    ],
    "men": [
        "men", "prostate", "male vitality", "testosterone", "male",
    ],
    "kids": [
        "kids", "children", "toddler", "kid", "child",
    ],
    "beauty_within": [
        "collagen", "biotin", "hair", "skin", "nail", "beauty", "glow",
    ],
    "hydration": [
        "hydration", "electrolyte", "coconut water", "sports",
    ],
    # Beauty goals
    "oily_skin": [
        "balancing", "oily", "matte", "oil control", "pore", "shine",
    ],
    "dry_skin": [
        "hydrating", "moisture", "dry", "hydration", "mousse", "gel cream",
    ],
    "anti_aging": [
        "renewing", "firming", "anti-aging", "wrinkle", "lifting",
        "peptide", "retinol", "reactivation", "bakuchiol",
    ],
    "brightening": [
        "brightening", "vitamin c", "serum", "glow", "radiance",
    ],
    "sun_protection": [
        "spf", "sun", "uv", "sunscreen", "protect",
    ],
}

FORMAT_KEYWORDS: dict[str, list[str]] = {
    "tablet": ["tablet", "capsule"],
    "gummy": ["gummy", "gummies"],
    "powder": ["powder"],
    "bar": ["bar", "bars"],
    "drink": [
        "drink", "rtd", "ready-to-drink", "tea", "water",
        "juice", "shake", "shot",
    ],
}


class ProductSearchEngine:
    _PRICE_OPS = {
        "lt": op.lt,
        "lte": op.le,
        "gt": op.gt,
        "gte": op.ge,
        "eq": op.eq,
    }

    def __init__(self, csv_path: str) -> None:
        self.df = pd.read_csv(csv_path)
        self.df.fillna("", inplace=True)

        # Coerce Price to numeric; non-numeric rows get NaN → 0.0
        self.df["_price_num"] = pd.to_numeric(self.df["Price"], errors="coerce").fillna(0.0)

        self.df["_search_text"] = (
            self.df["Tags"].str.lower() + " " +
            self.df["Target_Needs"].str.lower() + " " +
            self.df["Key_Benefits"].str.lower() + " " +
            self.df["Product_Details"].str.lower() + " " +
            self.df["Product_Name"].str.lower() + " " +
            self.df["Category"].str.lower()
        )

        self.vectorizer = TfidfVectorizer(
            stop_words="english", max_features=5000, ngram_range=(1, 2),
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df["_search_text"])

    def search(
        self,
        category: str | None = None,
        goal: str | None = None,
        format_pref: str | None = None,
        freeform_needs: str | None = None,
        price_constraints: list[dict] | None = None,
        demographics: str | None = None,
        top_k: int = 5,
    ) -> list[dict]:
        mask = pd.Series(True, index=self.df.index)

        # 1. Filter by category
        if category:
            mask &= self.df["Category"].str.lower() == category.lower()

        # 2. Filter by goal keywords
        if goal and goal in GOAL_KEYWORDS:
            keywords = GOAL_KEYWORDS[goal]
            mask &= self.df["_search_text"].apply(
                lambda x: any(kw in x for kw in keywords)
            )

        # 3. Filter by format
        if format_pref and format_pref != "no_preference" and format_pref in FORMAT_KEYWORDS:
            fmt_kws = FORMAT_KEYWORDS[format_pref]
            fmt_mask = self.df["_search_text"].apply(
                lambda x: any(kw in x for kw in fmt_kws)
            )
            # Only apply if it doesn't wipe out all results
            if (mask & fmt_mask).any():
                mask &= fmt_mask

        # 4. Filter by demographics (e.g. "Kids", "Men", "Women")
        if demographics:
            demo_lower = demographics.lower()
            if demo_lower in GOAL_KEYWORDS:
                demo_kws = GOAL_KEYWORDS[demo_lower]
                demo_mask = self.df["_search_text"].apply(
                    lambda x: any(kw in x for kw in demo_kws)
                )
                if (mask & demo_mask).any():
                    mask &= demo_mask

        # 5. Filter by price constraints
        if price_constraints:
            for pc in price_constraints:
                cmp_fn = self._PRICE_OPS.get(pc["operator"])
                if cmp_fn is not None:
                    price_mask = cmp_fn(self.df["_price_num"], pc["value"])
                    # Only apply if it doesn't wipe out all results
                    if (mask & price_mask).any():
                        mask &= price_mask

        filtered_indices = mask[mask].index.tolist()

        # Fallback: if no results, relax to category only
        if not filtered_indices:
            if category:
                cat_mask = self.df["Category"].str.lower() == category.lower()
                filtered_indices = cat_mask[cat_mask].index.tolist()
            else:
                filtered_indices = self.df.index.tolist()

        # 4. Build query for TF-IDF ranking
        query_parts: list[str] = []
        if goal and goal in GOAL_KEYWORDS:
            query_parts.extend(GOAL_KEYWORDS[goal])
        if freeform_needs:
            query_parts.append(freeform_needs)

        if query_parts:
            query_text = " ".join(query_parts)
            query_vec = self.vectorizer.transform([query_text])
            filtered_tfidf = self.tfidf_matrix[filtered_indices]
            sims = cosine_similarity(query_vec, filtered_tfidf).flatten()
            ranked = sorted(
                zip(filtered_indices, sims), key=lambda x: x[1], reverse=True,
            )
        else:
            ranked = [(idx, 0.0) for idx in filtered_indices]

        # 5. Deduplicate by Base_Product and return top_k
        results: list[dict] = []
        seen_base: set[str] = set()

        for idx, score in ranked:
            row = self.df.loc[idx]
            base = row["Base_Product"]
            if base in seen_base:
                continue
            seen_base.add(base)

            price_val = float(row["_price_num"])

            comp_url = row["Competing_Product_URL"]
            comp_price = str(row["Competing_Product_Price"])

            results.append({
                "sku": str(row["SKU"]),
                "name": row["Product_Name"],
                "brand": row["Brand"],
                "details": row["Product_Details"],
                "price": price_val,
                "tags": row["Tags"],
                "target_needs": row["Target_Needs"],
                "key_benefits": row["Key_Benefits"],
                "why_choose_amway": row["Why_Choose_Amway"],
                "competitor": {
                    "brand": row["Competing_Brand_Name"],
                    "product": row["Competing_Product_Name"],
                    "description": row["Competing_Product_Description"],
                    "url": comp_url if comp_url not in ("N/A", "") else None,
                    "price": comp_price if comp_price not in ("N/A", "") else None,
                },
                "relevance_score": round(float(score), 4),
            })

            if len(results) >= top_k:
                break

        return results
