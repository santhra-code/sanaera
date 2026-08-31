import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-cream/30 mt-auto py-12 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Brand Philosophy */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-serif text-xl font-bold tracking-widest text-[#1A0905]">
              SANAÉRA
            </h3>
            <p className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#4C050C] font-sans">
              Fashion, rooted in tradition.
            </p>
            <p className="text-xs text-[#1A0905]/65 max-w-xs leading-relaxed font-light font-sans">
              Thoughtfully curated silhouettes bringing traditional Indian weaving and block-print styles to the modern wardrobe.
            </p>
          </div>
          
          {/* Quick Shop Links */}
          <div className="flex flex-col space-y-3 font-sans">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A0905]">
              Collections
            </h4>
            <div className="flex flex-col space-y-2 text-xs text-[#1A0905]/75">
              <Link href="/#shop" className="hover:text-[#4C050C] transition">Sarees</Link>
              <Link href="/#shop" className="hover:text-[#4C050C] transition">Kurtas</Link>
              <Link href="/#shop" className="hover:text-[#4C050C] transition">Festive Wear</Link>
            </div>
          </div>

          {/* Customer Care Links */}
          <div className="flex flex-col space-y-3 font-sans">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1A0905]">
              Help & Info
            </h4>
            <div className="flex flex-col space-y-2 text-xs text-[#1A0905]/75">
              <Link href="/cart" className="hover:text-[#4C050C] transition">My Cart</Link>
              <Link href="/orders" className="hover:text-[#4C050C] transition">Order Tracking</Link>
              <Link href="/login" className="hover:text-[#4C050C] transition">My Account</Link>
            </div>
          </div>

        </div>

        {/* Bottom divider and copyright */}
        <div className="border-t border-[#E3DFCE]/20 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-sans tracking-wide text-[#1A0905]/50">
          <p>© {new Date().getFullYear()} SANAÉRA. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span className="cursor-default">Technical Assessment Project</span>
            <span>·</span>
            <span className="cursor-default">Cruvels MVP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
