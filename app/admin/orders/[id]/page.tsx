"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  user: { name: string; email: string };
};

const STATUS_OPTIONS = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setSelectedStatus(data.status);
      })
      .finally(() => setIsLoading(false));
  }, [orderId]);

  async function handleUpdateStatus() {
    setError("");
    setMessage("");
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not update status.");
        setIsUpdating(false);
        return;
      }

      setOrder(data);
      setMessage("Status updated.");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading order...</p>;
  }

  if (!order) {
    return <p className="text-sm text-red-600">Order not found.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/orders" className="text-sm text-gray-600 underline">
        Back to Orders
      </Link>

      <h1 className="mb-6 mt-2 text-xl font-semibold text-gray-900">
        Order {order.id}
      </h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="text-sm font-medium text-gray-900">
              {order.user.name}
            </p>
            <p className="text-xs text-gray-500">{order.user.email}</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {order.status}
          </span>
        </div>

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

        <div className="mt-6 border-t pt-4">
          <label className="block text-sm font-medium text-gray-900">
            Update status
          </label>
          <div className="mt-2 flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={isUpdating || selectedStatus === order.status}
              className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-2 text-sm text-green-700" role="status">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}