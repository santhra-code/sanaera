import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthorizedSession } from "@/lib/authorize";
import { updateCartItemQuantity, removeCartItem, CartError } from "@/lib/cart";

const updateQuantitySchema = z.object({
  quantity: z.number().int().positive(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await getAuthorizedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;
    const body = await request.json();
    const parsed = updateQuantitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const cart = await updateCartItemQuantity(
      session.user.id,
      itemId,
      parsed.data.quantity
    );

    return NextResponse.json(cart);
  } catch (error) {
    if (error instanceof CartError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to update cart item:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const session = await getAuthorizedSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;
    const cart = await removeCartItem(session.user.id, itemId);

    return NextResponse.json(cart);
  } catch (error) {
    if (error instanceof CartError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to remove cart item:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}