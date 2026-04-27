"use client";

import { useState } from "react";

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

export default function ProductCard({ product }: { product: Product }) {
  const [expanded, setExpanded] = useState(false);

  const benefits = product.key_benefits
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              {product.brand}
            </span>
            <h3 className="text-lg font-semibold text-gray-900 mt-1 leading-snug">
              {product.name}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Benefits badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {benefits.map((b) => (
            <span
              key={b}
              className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Why Choose Amway */}
      <div className="px-6 py-4 bg-emerald-50 border-t border-b border-emerald-100">
        <h4 className="text-sm font-semibold text-emerald-800 mb-1.5 flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Why Choose Amway
        </h4>
        <p className="text-sm text-emerald-700 leading-relaxed">
          {product.why_choose_amway}
        </p>
      </div>

      {/* Expandable details */}
      <div className="px-6 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
        >
          {expanded
            ? "Show less"
            : "Compare with competitor & see details"}
          <svg
            className={`w-4 h-4 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 pb-2">
            {/* Product details */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">
                Product Details
              </h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.details}
              </p>
            </div>

            {/* Competitor comparison */}
            {product.competitor.brand && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  vs. {product.competitor.brand} —{" "}
                  {product.competitor.product}
                </h5>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {product.competitor.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  {product.competitor.price && (
                    <span className="text-gray-500">
                      Competitor price:{" "}
                      <span className="font-medium text-gray-700">
                        ${product.competitor.price}
                      </span>
                    </span>
                  )}
                  {product.competitor.url && (
                    <a
                      href={product.competitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-700 underline"
                    >
                      View competitor
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
