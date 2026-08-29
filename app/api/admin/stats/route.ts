import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthorizedSession } from "@/lib/authorize";

export async function GET() {
  try {
    const session = await getAuthorizedSession(["ADMIN"]);
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    return NextResponse.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: revenueResult._sum.totalAmount ?? 0,
    });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}