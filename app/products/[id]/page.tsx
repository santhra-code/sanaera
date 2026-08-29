import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import AddToCartForm from "./AddToCartForm";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <a href="/" className="text-2xl font-semibold tracking-wide text-gray-900">
          SANAÉRA
        </a>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="text-sm text-gray-500">{product.category.name}</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">
              {product.name}
            </h1>
            <p className="mt-4 text-xl font-semibold text-gray-900">
              ₹{product.price.toString()}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>

            <p className="mt-4 text-sm">
              {product.stock > 0 ? (
                <span className="text-green-700">
                  In stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-600">Out of stock</span>
              )}
            </p>

            <AddToCartForm productId={product.id} maxQuantity={product.stock} />
          </div>
        </div>
      </main>
    </div>
  );
}