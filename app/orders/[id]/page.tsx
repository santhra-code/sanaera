"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type OrderItem = {
  id: string;
  productName: string;
  priceAtOrder: string;
  quantity: number;
};

type Order = {
  id: string;
  status: string;
  totalAmount: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  createdAt: string;
  items: OrderItem[];
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Order not found.");
        setOrder(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2">
        <p className="text-sm text-red-600">{error || "Order not found."}</p>
        <Link href="/orders" className="text-sm underline">
          Back to your orders
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

      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Order placed successfully.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Order</p>
              <p className="text-sm font-medium text-gray-900">{order.id}</p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {order.status}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>

          <div className="mt-4 space-y-2 border-t pt-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.productName} × {item.quantity}
                </span>
                <span className="text-gray-900">
                  ₹{(Number(item.priceAtOrder) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between border-t pt-4 text-sm font-semibold text-gray-900">
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </div>

          <div className="mt-6 border-t pt-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900">Shipping to</p>
            <p>{order.shippingName}</p>
            <p>{order.shippingAddress}</p>
            <p>
              {order.shippingCity}, {order.shippingState} -{" "}
              {order.shippingPincode}
            </p>
          </div>
        </div>

        <Link
          href="/orders"
          className="mt-4 block text-center text-sm text-gray-600 underline"
        >
          View all orders
        </Link>
      </main>
    </div>
  );
}