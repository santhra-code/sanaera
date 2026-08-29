"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Order = {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: { id: string; productName: string; quantity: number }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/orders")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Could not load orders.");
        setOrders(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <Link href="/" className="text-2xl font-semibold tracking-wide text-gray-900">
          SANAÉRA
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">Your Orders</h1>

        {isLoading && <p className="text-sm text-gray-500">Loading orders...</p>}

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <p className="text-sm text-gray-500">
            You haven&apos;t placed any orders yet.{" "}
            <Link href="/" className="underline">
              Start shopping
            </Link>
            .
          </p>
        )}

        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Order {order.id.slice(0, 12)}...
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                    {order.items.length} item(s)
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {order.status}
                  </span>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    ₹{order.totalAmount}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}