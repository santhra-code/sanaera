"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    stock: number;
  };
};

type Cart = {
  id: string;
  items: CartItem[];
};

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) throw new Error();
      const data = await response.json();
      setCart(data);
    } catch {
      setError("Could not load your cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function updateQuantity(itemId: string, quantity: number) {
    setBusyItemId(itemId);
    setError("");
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not update quantity.");
        return;
      }
      setCart(data);
    } finally {
      setBusyItemId(null);
    }
  }

  async function removeItem(itemId: string) {
    setBusyItemId(itemId);
    setError("");
    try {
      const response = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not remove item.");
        return;
      }
      setCart(data);
    } finally {
      setBusyItemId(null);
    }
  }

  const subtotal =
    cart?.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    ) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <Link href="/" className="text-2xl font-semibold tracking-wide text-gray-900">
          SANAÉRA
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">Your Cart</h1>

        {isLoading && <p className="text-sm text-gray-500">Loading cart...</p>}

        {error && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {!isLoading && cart && cart.items.length === 0 && (
          <p className="text-sm text-gray-500">
            Your cart is empty.{" "}
            <Link href="/" className="underline">
              Continue shopping
            </Link>
            .
          </p>
        )}

        {!isLoading && cart && cart.items.length > 0 && (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-gray-500">₹{item.product.price}</p>

                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-xs text-gray-500">Qty</label>
                    <input
                      type="number"
                      min={1}
                      max={item.product.stock}
                      value={item.quantity}
                      disabled={busyItemId === item.id}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 1 && value <= item.product.stock) {
                          updateQuantity(item.id, value);
                        }
                      }}
                      className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  disabled={busyItemId === item.id}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-900">Subtotal</p>
              <p className="text-lg font-semibold text-gray-900">
                ₹{subtotal.toFixed(2)}
              </p>
            </div>

            <Link
              href="/checkout"
              className="block w-full rounded bg-gray-900 py-3 text-center text-sm font-medium text-white"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}