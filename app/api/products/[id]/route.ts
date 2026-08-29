import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAuthorizedSession } from "@/lib/authorize";

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
  return NextResponse.json({ error: "Product not found." }, { status: 404 });
}

if (!product.isActive) {
  const session = await getAuthorizedSession(["ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
}

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

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
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const existingProduct = await db.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}