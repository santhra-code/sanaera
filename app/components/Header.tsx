"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

type User = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          setUser(data.user);
          fetchCartCount();
        } else {
          setUser(null);
          setCartCount(0);
        }
      }
    } catch {
      setUser(null);
    } finally {
      setIsSessionLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const cart = await res.json();
        if (cart && Array.isArray(cart.items)) {
          const count = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
          setCartCount(count);
        }
      }
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchSession();

    // Listen for cart update events
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cream/40 bg-white/90 backdrop-blur-md px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand/Logo */}
        <div className="flex flex-col">
          <Link href="/" className="font-serif text-2xl font-bold tracking-widest text-[#1A0905] transition hover:text-[#4C050C]">
            SANAÉRA
          </Link>
          <span className="hidden sm:block text-[10px] tracking-[0.2em] uppercase font-light text-[#4C050C]/70 -mt-1 font-sans">
            Fashion, rooted in tradition.
          </span>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center gap-8 font-sans text-sm tracking-widest text-[#1A0905]/80 uppercase">
          <Link href="/" className="transition hover:text-[#4C050C] hover:font-medium">
            Home
          </Link>
          <Link href="/#shop" className="transition hover:text-[#4C050C] hover:font-medium">
            Shop
          </Link>
          <Link href="/#about" className="transition hover:text-[#4C050C] hover:font-medium">
            About
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="text-burgundy font-medium tracking-widest hover:underline">
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Right side actions (Cart, Login/Account) */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Cart Icon */}
          <Link
            href="/cart"
            className="group relative flex items-center p-2 text-[#1A0905] transition hover:text-[#4C050C]"
            aria-label="View Cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#4C050C] text-[10px] font-medium text-white ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Account / Session actions */}
          {!isSessionLoading && (
            <div className="hidden sm:flex items-center gap-4 text-sm font-sans tracking-wider">
              {user ? (
                <>
                  <Link href="/orders" className="text-[#1A0905]/80 hover:text-[#4C050C] transition uppercase text-xs tracking-widest">
                    My Orders
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="rounded border border-[#1A0905]/30 bg-transparent px-3 py-1.5 text-xs uppercase tracking-widest text-[#1A0905] transition hover:bg-[#1A0905] hover:text-white"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded bg-[#1A0905] px-4 py-1.5 text-xs uppercase tracking-widest text-white transition hover:bg-[#4C050C]"
                >
                  Sign In
                </Link>
              )}
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center p-2 text-[#1A0905] md:hidden focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 border-t border-[#E3DFCE]/30 py-4 space-y-3 font-sans text-xs tracking-widest uppercase text-[#1A0905]">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 hover:text-[#4C050C] transition"
          >
            Home
          </Link>
          <Link
            href="/#shop"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 hover:text-[#4C050C] transition"
          >
            Shop
          </Link>
          <Link
            href="/#about"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 hover:text-[#4C050C] transition"
          >
            About
          </Link>
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-[#4C050C] font-semibold transition"
            >
              Admin Portal
            </Link>
          )}
          <hr className="border-[#E3DFCE]/30 my-2" />
          {user ? (
            <div className="space-y-3 pt-1">
              <Link
                href="/orders"
                onClick={() => setIsMenuOpen(false)}
                className="block py-1 hover:text-[#4C050C] transition"
              >
                My Orders
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left py-1 text-red-700 hover:text-red-950 font-medium transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block text-center rounded bg-[#1A0905] py-2 text-white transition hover:bg-[#4C050C]"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
