import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthorizedSession } from "@/lib/authorize";
import { createOrderFromCart, getUserOrders, OrderError } from "@/lib/orders";

const checkoutSchema = z.object({
  shippingName: z.string().min(2, "Enter the recipient's name."),
  shippingAddress: z.string().min(5, "Enter a valid address."),
  shippingCity: z.string().min(2, "Enter a valid city."),
  shippingState: z.string().min(2, "Enter a valid state."),
  shippingPincode: z
    .string()
    .regex(/^\d{6}$/, "Enter a valid 6-digit PIN code."),
});

export async function GET() {
  try {
    const session = await getAuthorizedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await getUserOrders(session.user.id);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthorizedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const order = await createOrderFromCart(session.user.id, parsed.data);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Checkout failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}