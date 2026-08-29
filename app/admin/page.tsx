import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function AdminDashboardPage() {
  const [totalProducts, totalOrders, pendingOrders, revenueResult] =
    await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.order.count({
        where: { status: { notIn: ["DELIVERED", "CANCELLED"] } },
      }),
      db.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { totalAmount: true },
      }),
    ]);

  const totalRevenue = revenueResult._sum.totalAmount ?? 0;

  const stats = [
    { label: "Total Products", value: totalProducts },
    { label: "Total Orders", value: totalOrders },
    { label: "Pending Orders", value: pendingOrders },
    { label: "Total Revenue", value: `₹${totalRevenue}` },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}