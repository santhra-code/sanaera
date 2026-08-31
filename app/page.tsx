"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SearchFilter from "./components/SearchFilter";
import ProductGrid from "./components/ProductGrid";
import Footer from "./components/Footer";

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

  useEffect(() => {
    fetch("/api/categories")
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();

        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => {
        // Non-critical — the page still works without the filter dropdown.
      });
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const params = new URLSearchParams();

    if (search) {
      params.set("search", search);
    }

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    try {
      const response = await fetch(
        `/api/products?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error();
      }

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
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      {/* Responsive Navigation Header */}
      <Header />

      {/* Brand Editorial Hero intro */}
      <Hero />

      {/* Main product marketplace layout */}
      <main id="shop" className="mx-auto w-full max-w-7xl px-6 py-12 flex-1 flex flex-col gap-8">
        
        {/* Search controls + Category filters */}
        <SearchFilter
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          resultCount={products.length}
        />

        {/* Product listing grid with Loading, Empty & Error states */}
        <ProductGrid
          products={products}
          isLoading={isLoading}
          error={error}
          onRetry={loadProducts}
          onResetFilters={() => {
            setSearch("");
            setSelectedCategory("");
          }}
        />
      </main>

      {/* Premium Minimal brand Footer */}
      <Footer />
    </div>
  );
}