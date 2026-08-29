"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    name: string;
    price: string;
  };
};

type Cart = {
  items: CartItem[];
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [shippingName, setShippingName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then(setCart)
      .finally(() => setIsLoading(false));
  }, []);

  const subtotal =
    cart?.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    ) ?? 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingName,
          shippingAddress,
          shippingCity,
          shippingState,
          shippingPincode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Checkout failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/orders/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading checkout...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2">
        <p className="text-sm text-gray-500">Your cart is empty.</p>
        <Link href="/" className="text-sm underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <Link href="/" className="text-2xl font-semibold tracking-wide text-gray-900">
          SANAÉRA
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-sm font-medium text-gray-900">
              Shipping details
            </h2>

            <div>
              <label className="block text-sm text-gray-700">Full name</label>
              <input
                required
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700">Address</label>
              <input
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700">City</label>
                <input
                  required
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">State</label>
                <input
                  required
                  value={shippingState}
                  onChange={(e) => setShippingState(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700">PIN code</label>
              <input
                required
                pattern="\d{6}"
                title="Enter a 6-digit PIN code"
                value={shippingPincode}
                onChange={(e) => setShippingPincode(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded bg-gray-900 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSubmitting
                ? "Processing payment..."
                : `Pay ₹${subtotal.toFixed(2)}`}
            </button>

            <p className="text-xs text-gray-400">
              This is a simulated payment for demo purposes. No real payment
              is processed.
            </p>
          </form>

          <div className="h-fit rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-medium text-gray-900">
              Order summary
            </h2>
            <div className="space-y-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="text-gray-900">
                    ₹{(Number(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t pt-4 text-sm font-semibold text-gray-900">
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}