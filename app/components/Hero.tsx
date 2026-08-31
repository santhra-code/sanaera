export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#FAF9F6] py-12 md:py-16 border-b border-cream/35">
      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Subtle top divider accent */}
        <div className="mx-auto mb-4 h-[1px] w-12 bg-burgundy/60" />
        
        {/* Overline Category/Collection Badge */}
        <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-burgundy mb-2">
          Discover the Collection
        </p>
        
        {/* Headline */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-wide text-espresso mb-4 leading-tight">
          Timeless Indian fashion, <br className="hidden sm:inline" />
          thoughtfully curated.
        </h1>
        
        {/* Supporting Narrative */}
        <p className="mx-auto max-w-xl text-xs sm:text-sm leading-relaxed text-espresso/70 font-light font-sans tracking-wide">
          SANAÉRA marries heritage craftsmanship with modern silhouettes. Each piece is handpicked to celebrate traditional weaves, intricate block prints, and elegant embroideries.
        </p>

        {/* Subtle bottom accent line */}
        <div className="mx-auto mt-6 h-[1px] w-6 bg-cream" />
      </div>
    </section>
  );
}
