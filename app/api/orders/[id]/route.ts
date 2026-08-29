import { NextResponse } from "next/server";
import { getAuthorizedSession } from "@/lib/authorize";
import { getOrderById, OrderError } from "@/lib/orders";
import { z } from "zod";
import { updateOrderStatus } from "@/lib/orders";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthorizedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await getOrderById(
      id,
      session.user.id,
      session.user.role === "ADMIN"
    );

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

const updateStatusSchema = z.object({
  status: z.enum([
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthorizedSession(["ADMIN"]);
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(id, parsed.data.status);

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}