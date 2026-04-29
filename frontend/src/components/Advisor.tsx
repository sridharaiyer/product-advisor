"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Step = "category" | "goal" | "format" | "freeform" | "loading" | "results";

interface Product {
  sku: string;
  name: string;
  brand: string;
  details: string;
  price: number;
  tags: string;
  target_needs: string;
  key_benefits: string;
  why_choose_amway: string;
  competitor: {
    brand: string;
    product: string;
    description: string;
    url: string | null;
    price: string | null;
  };
  relevance_score: number;
}

interface Option {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

/* ------------------------------------------------------------------ */
/*  Questionnaire data                                                 */
/* ------------------------------------------------------------------ */

const WELLNESS_GOALS: Option[] = [
  { value: "digestive", label: "Digestive Health", description: "Probiotics, fiber, enzymes", icon: "\u{1F33F}" },
  { value: "daily_nutrition", label: "Daily Nutrition", description: "Multivitamins, superfoods", icon: "\u{1F48A}" },
  { value: "energy_focus", label: "Energy & Focus", description: "Natural energy, mental clarity", icon: "\u26A1" },
  { value: "sleep_stress", label: "Sleep & Stress", description: "Better sleep, stress relief", icon: "\u{1F634}" },
  { value: "immunity", label: "Immunity", description: "Immune defense, seasonal support", icon: "\u{1F6E1}\uFE0F" },
  { value: "joint_bone", label: "Joint & Bone", description: "Joint comfort, bone density", icon: "\u{1F9B4}" },
  { value: "heart", label: "Heart Health", description: "Cardiovascular, cholesterol, omega", icon: "\u2764\uFE0F" },
  { value: "brain_eye", label: "Brain & Eye", description: "Memory, vision, cognitive", icon: "\u{1F9E0}" },
  { value: "weight", label: "Weight Management", description: "Metabolism, fat burning", icon: "\u2696\uFE0F" },
  { value: "fitness", label: "Fitness & Muscle", description: "Protein, workout, recovery", icon: "\u{1F4AA}" },
  { value: "women", label: "Women\u2019s Health", description: "Hormonal balance, prenatal, iron", icon: "\u{1F469}" },
  { value: "men", label: "Men\u2019s Health", description: "Prostate, vitality", icon: "\u{1F468}" },
  { value: "kids", label: "Kids\u2019 Health", description: "Children\u2019s nutrition & immunity", icon: "\u{1F476}" },
  { value: "beauty_within", label: "Beauty from Within", description: "Collagen, hair, skin, nails", icon: "\u2728" },
  { value: "hydration", label: "Hydration", description: "Electrolytes, recovery drinks", icon: "\u{1F4A7}" },
];

const BEAUTY_GOALS: Option[] = [
  { value: "oily_skin", label: "Oily / Combination Skin", description: "Oil control, pore care, matte finish", icon: "\u{1F9F4}" },
  { value: "dry_skin", label: "Dry / Normal Skin", description: "Deep hydration, moisture lock", icon: "\u{1F4A6}" },
  { value: "anti_aging", label: "Anti-Aging", description: "Wrinkle reduction, firming, lifting", icon: "\u{1F31F}" },
  { value: "brightening", label: "Brightening", description: "Even tone, radiance, glow", icon: "\u2600\uFE0F" },
  { value: "sun_protection", label: "Sun Protection", description: "SPF, UV & blue light defense", icon: "\u{1F9E2}" },
];

const FORMAT_OPTIONS: Option[] = [
  { value: "tablet", label: "Tablets / Capsules", icon: "\u{1F48A}" },
  { value: "gummy", label: "Gummies", icon: "\u{1F36C}" },
  { value: "powder", label: "Powder", icon: "\u{1F964}" },
  { value: "bar", label: "Bars", icon: "\u{1F36B}" },
  { value: "drink", label: "Drinks / RTD", icon: "\u{1F96B}" },
  { value: "no_preference", label: "No Preference", icon: "\u2705" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Advisor() {
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState("");
  const [goal, setGoal] = useState("");
  const [formatPref, setFormatPref] = useState("");
  const [freeform, setFreeform] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  /* ---- navigation helpers ---- */

  const selectCategory = (v: string) => {
    setCategory(v);
    setGoal("");
    setFormatPref("");
    setStep("goal");
  };

  const selectGoal = (v: string) => {
    setGoal(v);
    setFormatPref("");
    setStep(category === "Beauty" ? "freeform" : "format");
  };

  const selectFormat = (v: string) => {
    setFormatPref(v);
    setStep("freeform");
  };

  const handleBack = () => {
    switch (step) {
      case "goal":
        setStep("category");
        break;
      case "format":
        setStep("goal");
        break;
      case "freeform":
        setStep(category === "Beauty" ? "goal" : "format");
        break;
      case "results":
        setStep("freeform");
        break;
    }
  };

  const submit = async () => {
    setStep("loading");
    setError("");
    try {
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
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      const data = await res.json();
      setProducts(data.products);
      setStep("results");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
      setStep("freeform");
    }
  };

  const reset = () => {
    setStep("category");
    setCategory("");
    setGoal("");
    setFormatPref("");
    setFreeform("");
    setProducts([]);
    setError("");
  };

  /* ---- derived values ---- */

  const goalOptions = category === "Beauty" ? BEAUTY_GOALS : WELLNESS_GOALS;
  const allGoals = [...WELLNESS_GOALS, ...BEAUTY_GOALS];
  const selectedGoalLabel = allGoals.find((g) => g.value === goal)?.label;

  const stepLabels =
    category === "Beauty"
      ? ["Category", "Concern", "Details"]
      : ["Category", "Goal", "Format", "Details"];

  const stepIndex =
    step === "category"
      ? 0
      : step === "goal"
        ? 1
        : step === "format"
          ? 2
          : step === "freeform"
            ? category === "Beauty"
              ? 2
              : 3
            : -1;

  /* ---- render ---- */

  return (
    <div className="max-w-4xl mx-auto px-5 pt-10 pb-8 sm:pt-14 sm:pb-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent tracking-tight">
          Amway Product Advisor
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Answer a few questions and we&apos;ll find the perfect products for you
        </p>
      </div>

      {/* Step Indicator */}
      {stepIndex >= 0 && (
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-1 sm:gap-2">
              <div
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  i < stepIndex
                    ? "bg-indigo-100 text-indigo-700"
                    : i === stepIndex
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center text-xs">
                  {i < stepIndex ? "\u2713" : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < stepLabels.length - 1 && (
                <div
                  className={`w-4 sm:w-8 h-0.5 ${
                    i < stepIndex ? "bg-indigo-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        {/* ===== CATEGORY ===== */}
        {step === "category" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              What area are you looking to improve?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  value: "Wellness",
                  label: "Wellness & Nutrition",
                  desc: "Supplements, vitamins, protein, energy",
                  icon: "\u{1F331}",
                },
                {
                  value: "Beauty",
                  label: "Skincare & Beauty",
                  desc: "Cleansers, moisturizers, serums, SPF",
                  icon: "\u2728",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectCategory(opt.value)}
                  className="group p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <h3 className="text-lg font-semibold mt-3 text-gray-900 group-hover:text-indigo-700">
                    {opt.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== GOAL ===== */}
        {step === "goal" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {category === "Beauty"
                ? "What\u2019s your primary skin concern?"
                : "What\u2019s your primary health goal?"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Select the area that matters most to you right now
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {goalOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectGoal(opt.value)}
                  className="group p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{opt.icon}</span>
                    <h3 className="font-medium text-gray-900 group-hover:text-indigo-700">
                      {opt.label}
                    </h3>
                  </div>
                  {opt.description && (
                    <p className="text-xs text-gray-500 mt-1 ml-8">
                      {opt.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
            <BackButton onClick={handleBack} />
          </div>
        )}

        {/* ===== FORMAT ===== */}
        {step === "format" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Preferred product format?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              How do you like to take your supplements?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => selectFormat(opt.value)}
                  className="group p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <h3 className="font-medium text-gray-900 group-hover:text-indigo-700 mt-2 text-sm">
                    {opt.label}
                  </h3>
                </button>
              ))}
            </div>
            <BackButton onClick={handleBack} />
          </div>
        )}

        {/* ===== FREEFORM ===== */}
        {step === "freeform" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Anything else we should know?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Tell us about your lifestyle, specific concerns, or preferences.
              This helps us personalize your recommendations.
            </p>

            {/* Selection summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600 flex flex-wrap gap-2">
              <SelectionBadge label={category} />
              {selectedGoalLabel && <SelectionBadge label={selectedGoalLabel} />}
              {formatPref && formatPref !== "no_preference" && (
                <SelectionBadge
                  label={
                    FORMAT_OPTIONS.find((f) => f.value === formatPref)?.label ??
                    formatPref
                  }
                />
              )}
            </div>

            <textarea
              value={freeform}
              onChange={(e) => setFreeform(e.target.value)}
              placeholder="e.g., I'm a 35-year-old runner looking for joint support and something easy to take on the go..."
              className="w-full h-28 px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-sm"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {freeform.length}/500
            </p>

            {error && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
              <BackButton onClick={handleBack} noMargin />
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setFreeform("");
                    submit();
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
                >
                  Skip
                </button>
                <button
                  onClick={submit}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  Get Recommendations
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== LOADING ===== */}
        {step === "loading" && (
          <div className="text-center py-12">
            <div className="inline-block w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-500 mt-4">
              Finding the best products for you...
            </p>
          </div>
        )}

        {/* ===== RESULTS ===== */}
        {step === "results" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Recommendations
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  We found {products.length} product
                  {products.length !== 1 ? "s" : ""} matching your needs
                </p>
              </div>
              <button
                onClick={reset}
                className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Start Over
              </button>
            </div>

            {/* Selection summary */}
            <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm text-gray-600 flex flex-wrap gap-2">
              <SelectionBadge label={category} />
              {selectedGoalLabel && <SelectionBadge label={selectedGoalLabel} />}
              {formatPref && formatPref !== "no_preference" && (
                <SelectionBadge
                  label={
                    FORMAT_OPTIONS.find((f) => f.value === formatPref)?.label ??
                    formatPref
                  }
                />
              )}
              {freeform && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-medium italic">
                  &quot;{freeform.slice(0, 60)}
                  {freeform.length > 60 ? "..." : ""}&quot;
                </span>
              )}
            </div>

            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No products found matching your criteria. Try broadening your
                  search.
                </p>
                <button
                  onClick={reset}
                  className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Start Over
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductCard key={product.sku} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 mt-8">
        Powered by Nutrilite &mdash; from seed to supplement
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */

function BackButton({ onClick, noMargin }: { onClick: () => void; noMargin?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`${noMargin ? '' : 'mt-6'} text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1`}
    >
      &larr; Back
    </button>
  );
}

function SelectionBadge({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
      {label}
    </span>
  );
}
