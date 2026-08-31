"use client";

import { useState } from "react";
import Link from "next/link";
import ProductImage from "./ProductImage";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  stock: number;
  category: Category;
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [statusText, setStatusText] = useState("");
  const isOutOfStock = product.stock <= 0;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault(); // Stop navigation to detail page
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    setStatusText("");

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusText(data.error ?? "Error");
        setTimeout(() => setStatusText(""), 2000);
        return;
      }

      setStatusText("Added");
      // Trigger cart count update event in Header
      window.dispatchEvent(new Event("cart-updated"));
      
      setTimeout(() => setStatusText(""), 2000);
    } catch {
      setStatusText("Error");
      setTimeout(() => setStatusText(""), 2000);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col justify-between rounded-lg border border-cream/20 bg-white p-3 shadow-[0_2px_8px_-3px_rgba(26,9,5,0.05)] transition-all duration-300 hover:border-cream/80 hover:shadow-[0_8px_20px_-6px_rgba(26,9,5,0.08)]"
    >
      <div>
        {/* Product Image Wrapper with hover effects */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded bg-[#FAF9F6]">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            categoryName={product.category.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          
          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
              <span className="rounded bg-espresso px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase text-white shadow-sm font-sans">
                Sold Out
              </span>
            </div>
          )}

          {/* Low Stock Indicator */}
          {!isOutOfStock && product.stock <= 5 && (
            <div className="absolute top-2 left-2">
              <span className="rounded-sm bg-burgundy/10 px-2 py-0.5 text-[9px] font-medium tracking-wide uppercase text-burgundy">
                Only {product.stock} left
              </span>
            </div>
          )}
        </div>

        {/* Category */}
        <p className="mt-3 text-[10px] font-semibold tracking-widest uppercase text-burgundy">
          {product.category.name}
        </p>

        {/* Product Name */}
        <h2 className="mt-1 text-sm font-medium tracking-wide text-espresso line-clamp-1 group-hover:text-burgundy transition-colors duration-300">
          {product.name}
        </h2>
        
        {/* Short description */}
        <p className="mt-1 text-xs text-espresso/60 line-clamp-2 font-light font-sans">
          {product.description}
        </p>
      </div>

      <div className="mt-4">
        {/* Price & Add to Cart button Row */}
        <div className="flex items-center justify-between pt-2 border-t border-cream/10">
          <p className="text-sm font-semibold text-espresso">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </p>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`rounded-md px-3 py-1.5 text-[10px] font-medium tracking-widest uppercase transition-all duration-300 font-sans cursor-pointer ${
              isOutOfStock
                ? "bg-[#E3DFCE]/30 text-espresso/40 cursor-not-allowed"
                : isAdding
                ? "bg-[#1A0905] text-white opacity-85"
                : statusText === "Added"
                ? "bg-green-800 text-white"
                : statusText === "Error"
                ? "bg-red-800 text-white"
                : "border border-espresso text-espresso hover:bg-espresso hover:text-white"
            }`}
          >
            {isAdding ? "Adding..." : statusText || "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}
