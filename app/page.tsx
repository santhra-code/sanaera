"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load categories once, on first render.
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => {
        // Non-critical — the page still works without the filter dropdown.
      });
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);

    try {
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setProducts(data);
    } catch {
      setError("Could not load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory]);

  // Reload products whenever search or category filter changes.
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold tracking-wide text-gray-900">
          SANAÉRA
        </h1>
        <p className="text-sm text-gray-500">Fashion, rooted in tradition.</p>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm sm:max-w-xs"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm sm:max-w-xs"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading && (
          <p className="text-sm text-gray-500">Loading products...</p>
        )}

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && products.length === 0 && (
          <p className="text-sm text-gray-500">
            No products found. Try a different search or filter.
          </p>
        )}

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group rounded-lg border border-gray-200 bg-white p-3 transition hover:shadow-md"
            >
              <div className="aspect-[3/4] w-full overflow-hidden rounded bg-gray-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <h2 className="mt-3 text-sm font-medium text-gray-900">
                {product.name}
              </h2>
              <p className="text-xs text-gray-500">{product.category.name}</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                ₹{product.price}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}