"use client";

import { useState } from "react";

export default function AddToCartForm({
  productId,
  maxQuantity,
}: {
  productId: string;
  maxQuantity: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const outOfStock = maxQuantity <= 0;

  async function handleAddToCart() {
    setMessage("");
    setIsSubmitting(true);

    // The actual /api/cart endpoint is built in Phase 6.
    // This call is wired now so no further changes are needed later.
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Could not add to cart.");
        return;
      }

      setMessage("Added to cart.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6">
      {!outOfStock && (
        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="quantity" className="text-sm text-gray-700">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 1 && value <= maxQuantity) {
                setQuantity(value);
              }
            }}
            className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={outOfStock || isSubmitting}
        className="w-full rounded bg-gray-900 py-2 text-sm font-medium text-white disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {outOfStock
          ? "Out of stock"
          : isSubmitting
          ? "Adding..."
          : "Add to Cart"}
      </button>

      {message && (
        <p className="mt-2 text-sm text-gray-700" role="status">
          {message}
        </p>
      )}
    </div>
  );
}