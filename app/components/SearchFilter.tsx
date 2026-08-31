"use client";

import { ChangeEvent } from "react";

type Category = {
  id: string;
  name: string;
};

type SearchFilterProps = {
  search: string;
  setSearch: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: Category[];
  resultCount: number;
};

export default function SearchFilter({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  categories,
  resultCount,
}: SearchFilterProps) {
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
  };

  return (
    <div className="w-full space-y-4">
      {/* Controls Container */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-cream/20 pb-4">
        
        {/* Search Input Input Box */}
        <div className="relative w-full sm:max-w-md">
          {/* Magnifying Glass SVG Icon */}
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-espresso/45">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z"
              />
            </svg>
          </span>

          <input
            type="text"
            placeholder="Search our collection..."
            value={search}
            onChange={handleSearchChange}
            className="w-full rounded-md border border-cream/50 bg-white py-2 pl-9 pr-10 text-sm font-sans tracking-wide text-espresso placeholder:text-espresso/40 focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso transition-all duration-300"
          />

          {/* Clear Search Button */}
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-espresso/45 hover:text-espresso"
              aria-label="Clear search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Dropdown & Clear Filters Action */}
        <div className="flex flex-col gap-3 xs:flex-row xs:items-center w-full sm:w-auto">
          {/* Category Dropdown Select */}
          <div className="relative w-full xs:w-48">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full cursor-pointer rounded-md border border-cream/50 bg-white py-2 px-3 pr-8 text-sm font-sans tracking-wide text-espresso focus:border-espresso focus:outline-none focus:ring-1 focus:ring-espresso transition-all duration-300 appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            {/* Custom arrow decoration */}
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-espresso/45">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>

          {/* Reset Filters Option */}
          {(search || selectedCategory) && (
            <button
              onClick={handleClearFilters}
              className="text-xs uppercase tracking-widest text-burgundy hover:text-espresso font-medium py-2 px-1 transition-colors duration-350 cursor-pointer self-start xs:self-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

      </div>

      {/* Results details info */}
      <div className="flex items-center justify-between text-xs tracking-wider text-espresso/60 font-sans">
        <p>
          Showing {resultCount} {resultCount === 1 ? "product" : "products"}
        </p>
        
        {(search || selectedCategory) && (
          <p className="italic">
            Filtered view
            {selectedCategory && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
            {search && ` for "${search}"`}
          </p>
        )}
      </div>
    </div>
  );
}
