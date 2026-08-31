"use client";

import ProductCard from "./ProductCard";

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

type ProductGridProps = {
  products: Product[];
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  onResetFilters: () => void;
};

export default function ProductGrid({
  products,
  isLoading,
  error,
  onRetry,
  onResetFilters,
}: ProductGridProps) {
  // Skeleton Loading Cards (renders 8 placeholder blocks)
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col justify-between rounded-lg border border-cream/20 bg-white p-3 shadow-[0_2px_8px_-3px_rgba(26,9,5,0.02)] animate-pulse"
          >
            <div>
              {/* Aspect Ratio portrait block */}
              <div className="aspect-[3/4] w-full rounded bg-[#FAF9F6]" />
              
              {/* Category skeleton */}
              <div className="mt-3 h-2.5 w-16 rounded bg-[#F1EFE9]" />
              
              {/* Name skeleton */}
              <div className="mt-2 h-3.5 w-3/4 rounded bg-[#F1EFE9]" />
              
              {/* Short description skeleton lines */}
              <div className="mt-2 h-2.5 w-full rounded bg-[#FAF9F6]" />
              <div className="mt-1 h-2.5 w-5/6 rounded bg-[#FAF9F6]" />
            </div>
            
            {/* Price & action footer skeleton */}
            <div className="mt-4 flex items-center justify-between border-t border-cream/5 pt-2">
              <div className="h-4 w-12 rounded bg-[#F1EFE9]" />
              <div className="h-6 w-20 rounded bg-[#F1EFE9]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error State Alert Component
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-lg border border-red-100 max-w-lg mx-auto shadow-xs">
        {/* Error icon */}
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-burgundy mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </span>
        <h3 className="font-serif text-lg font-semibold text-espresso mb-2">
          Unable to Load Collection
        </h3>
        <p className="text-sm text-espresso/60 mb-6 font-sans">
          {error}
        </p>
        <button
          onClick={onRetry}
          className="rounded-md bg-espresso px-6 py-2 text-xs font-semibold tracking-widest uppercase text-white hover:bg-burgundy transition-all duration-300 font-sans cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty State Component (No search results / category empty)
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-lg border border-cream/20 max-w-lg mx-auto shadow-[0_2px_8px_-3px_rgba(26,9,5,0.02)]">
        {/* Empty status motif */}
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF9F6] text-espresso/40 mb-4 border border-cream/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 18 3H6a2.25 2.25 0 0 0-2.25 2.25v6a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </span>
        <h3 className="font-serif text-lg font-semibold text-espresso mb-1">
          No Products Found
        </h3>
        <p className="text-sm text-espresso/60 mb-6 font-sans">
          Try changing your search keywords or choosing a different category filter.
        </p>
        <button
          onClick={onResetFilters}
          className="rounded-md bg-espresso px-6 py-2 text-xs font-semibold tracking-widest uppercase text-white hover:bg-burgundy transition-all duration-300 font-sans cursor-pointer"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  // Normal Grid list render
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
