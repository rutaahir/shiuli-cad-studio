import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { PageId, Product } from '../types';
import { CATEGORIES, PRODUCTS, TESTIMONIALS, GALLERY_ITEMS } from '../data/mockData';
import { useCatalog, toProductShape } from '../hooks/useCatalog';
import { BrandLogo } from '../components/BrandLogo';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  Layers, 
  ShieldCheck, 
  Clock, 
  Repeat, 
  Eye, 
  ShoppingBag, 
  Heart, 
  Star, 
  Check, 
  FileCheck2, 
  Zap,
  Gem,
  Award
} from 'lucide-react';
import { RevealOnScroll } from '../components/motion/RevealOnScroll';
import { StaggerGrid, StaggerItem } from '../components/motion/StaggerGrid';
import { LazyImage } from '../components/motion/LazyImage';

interface HomePageProps {
  onNavigate: (page: PageId, extraId?: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, license: 'standard' | 'commercial') => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
}) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  // Parallax Scroll for Hero
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(heroScrollProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.8], [1, 0]);

  const { products: liveProducts, categories, isLoading } = useCatalog();

  // Filter products for section 6
  // A product matches if:
  //   - its category_slug equals the filter (direct sub-cat match), OR
  //   - its parent_slug equals the filter (sub-cat product shown under parent tab)
  const filteredProducts: Product[] = (() => {
    const source = liveProducts.length > 0 ? liveProducts.map(toProductShape) : PRODUCTS;
    if (selectedFilter === 'all') return source;
    if (liveProducts.length > 0) {
      return liveProducts
        .filter((p) => {
          const cs = (p as any).category_slug || '';
          const ps = (p as any).parent_slug || '';
          return cs === selectedFilter || ps === selectedFilter;
        })
        .map(toProductShape);
    }
    return source.filter((p) => p.category.toLowerCase() === selectedFilter.toLowerCase());
  })();

  return (
    <div className="min-h-screen bg-[#060B1E] text-[#F5F1E8] overflow-hidden relative">

      {/* SECTION 1: HERO (UNTOUCHED HERO LAYOUT WITH PARALLAX ON-SCROLL) */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: '#09112B' }}>
        {/* BACKGROUND VIDEO */}
        <video
          className="hero-video-bg absolute inset-0 w-full h-full object-cover"
          src="/assets/hero.mp4"
          poster="/assets/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />

        {/* DARK SCRIM */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(9,17,43,0.55) 0%, rgba(9,17,43,0.70) 40%, rgba(9,17,43,0.85) 100%)',
            zIndex: 1,
          }}
        />

        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-[700px] h-[700px] rounded-full bg-[#FFD700]/12 blur-[140px] pointer-events-none" style={{ zIndex: 2 }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#2563EB]/15 blur-[130px] pointer-events-none" style={{ zIndex: 2 }} />

        {/* HERO CONTENT WITH PARALLAX SCROLL MOTION */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, zIndex: 10, maxWidth: '880px' }}
          className="relative flex flex-col items-start pt-36 pb-28 px-6 sm:px-12 lg:px-20 xl:px-28"
        >
          {/* Vertical gold rule */}
          <div className="hero-vert-rule absolute left-0 top-36 bottom-28 w-[2px]"
               style={{ background: 'linear-gradient(to bottom, transparent, #FFD700 25%, #FFD700 75%, transparent)' }} />

          {/* ROYAL CROWN ORNAMENT */}
          <div className="hero-anim-1 flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#FFD700]" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#FFD700] shadow-[0_0_6px_#FFD700]" />
              <div className="h-px w-16 bg-gradient-to-r from-[#FFD700] to-[#FFD700]/30" />
            </div>
            <svg width="30" height="24" viewBox="0 0 28 22" fill="none" className="hero-crown-glow flex-shrink-0 filter drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
              <path d="M2 20L5 8L10 14L14 2L18 14L23 8L26 20H2Z" fill="none" stroke="#FFD700" strokeWidth="1.8" strokeLinejoin="round"/>
              <circle cx="2" cy="8" r="1.8" fill="#FFD700" />
              <circle cx="14" cy="2" r="2" fill="#FFFFFF" />
              <circle cx="26" cy="8" r="1.8" fill="#FFD700" />
              <line x1="2" y1="21" x2="26" y2="21" stroke="#FFD700" strokeWidth="1.2" />
            </svg>
            <div className="flex items-center gap-2">
              <div className="h-px w-16 bg-gradient-to-l from-[#FFD700] to-[#FFD700]/30" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#FFD700] shadow-[0_0_6px_#FFD700]" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#FFD700]" />
            </div>
          </div>

          {/* BADGE */}
          <div className="hero-anim-1 relative mb-8">
            <div className="hero-badge-ring absolute -inset-[3px] rounded-full border border-[#FFD700]/60 shadow-[0_0_15px_rgba(255,215,0,0.3)]" />
            <div className="relative inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-[#FFD700]/70 bg-[#060E22]/90 backdrop-blur-xl shadow-[0_0_20px_rgba(255,215,0,0.25)]">
              <span className="hero-badge-dot w-2.5 h-2.5 rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700] flex-shrink-0" />
              <span className="text-[11px] uppercase tracking-[0.3em] font-extrabold text-[#FFE57F] drop-shadow-[0_0_8px_rgba(255,229,127,0.5)]">Official Luxury CAD Atelier</span>
              <span className="w-px h-3.5 bg-[#FFD700]/50" />
              <Gem className="w-4 h-4 text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] flex-shrink-0" />
            </div>
          </div>

          {/* HEADLINE */}
          <div className="mb-4 overflow-hidden">
            <h1 className="font-serif leading-[1.1] tracking-tight">
              <span className="hero-line-reveal-1 block whitespace-nowrap text-[2.6rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4.2rem] text-white font-normal drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
                Where{' '}
                <em className="not-italic font-bold hero-italic-word text-[#FFE57F] drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">Imagination</em>
              </span>
              <span className="hero-line-reveal-2 block whitespace-nowrap text-[2.6rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4.2rem] font-extrabold">
                <span className="hero-gold-title">Becomes Jewellery</span>
              </span>
            </h1>
          </div>

          {/* ORNATE DIVIDER */}
          <div className="hero-anim-3 flex items-center gap-2.5 mb-8">
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-[#FFD700] to-[#FFD700]/60" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rotate-45 bg-[#FFD700] shadow-[0_0_6px_#FFD700]" />
              <div className="w-2 h-2 rotate-45 bg-[#FFFFFF] shadow-[0_0_8px_#FFFFFF]" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#FFD700] shadow-[0_0_6px_#FFD700]" />
            </div>
            <div className="h-px w-40 bg-gradient-to-r from-[#FFD700]/60 to-transparent" />
          </div>

          {/* SUBHEADLINE */}
          <p className="hero-anim-4 font-sans text-base sm:text-[17px] text-slate-100 font-medium leading-[1.85] max-w-[540px] mb-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Premium Rhino{' '}
            <span className="text-[#FFE57F] font-bold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">.3DM</span> files &amp; watertight{' '}
            <span className="text-[#60A5FA] font-bold drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">STL</span> meshes —
            engineered to{' '}
            <span className="text-white font-bold underline decoration-[#FFD700] underline-offset-4 decoration-2">±0.02 mm tolerance</span>{' '}
            for the world's finest jewellers.
          </p>

          {/* CTA BUTTONS */}
          <div className="hero-anim-5 flex flex-wrap gap-4 mb-12">
            <button
              onClick={() => onNavigate('collections')}
              className="hero-btn-primary group relative overflow-hidden flex items-center gap-3 px-9 py-4 rounded-xl font-black tracking-[0.15em] uppercase text-xs shadow-2xl"
            >
              <span className="hero-btn-shimmer" />
              <span className="hero-corner-tl" />
              <span className="hero-corner-br" />
              <Sparkles className="w-4 h-4 text-[#050B1E] relative z-10 flex-shrink-0" />
              <span className="relative z-10 text-[#050B1E]">Explore CAD Files</span>
              <ArrowRight className="w-4 h-4 text-[#050B1E] relative z-10 flex-shrink-0 group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>

            <button
              onClick={() => onNavigate('custom-design')}
              className="hero-btn-secondary group relative overflow-hidden flex items-center gap-3 px-9 py-4 rounded-xl font-bold tracking-[0.15em] uppercase text-xs text-white"
            >
              <span className="hero-corner-tl hero-corner-tl--gold" />
              <span className="hero-corner-br hero-corner-br--gold" />
              <Gem className="w-4 h-4 text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-white font-bold">Start Custom Order</span>
              <ChevronRight className="w-4 h-4 text-[#FFD700] flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* TRUST STRIP */}
          <div className="hero-anim-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            {[
              { icon: <FileCheck2 className="w-4 h-4 text-[#FFD700] drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]" />, label: 'Native .3DM' },
              { icon: <Check className="w-4 h-4 text-[#60A5FA] drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]" />, label: 'Watertight STL' },
              { icon: <ShieldCheck className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" />, label: 'Castable Ready' },
              { icon: <Award className="w-4 h-4 text-[#FFE57F] drop-shadow-[0_0_6px_rgba(255,229,127,0.8)]" />, label: '±0.02 mm' },
            ].map(({ icon, label }, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-100 font-semibold tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] hover:text-white transition-colors">
                  {icon}
                  <span>{label}</span>
                </div>
                {i < 3 && <div className="w-px h-3.5 bg-[#FFD700]/40 hidden sm:block" />}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hero-anim-7" style={{ zIndex: 10 }}>
          <span className="text-[9px] tracking-[0.4em] uppercase text-white/30">Scroll to Explore</span>
          <div className="hero-scroll-line" />
        </div>
      </section>

      {/* SECTION 2: TRUST STRIP (ANIMATED METRICS REVEAL) */}
      <section className="relative py-10 bg-[#080E24] border-y border-[#D4AF37]/20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
          <StaggerGrid className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#D4AF37]/15">
            {[
              { number: '500+', label: 'Designs Delivered' },
              { number: '120+', label: 'Happy Jewellers & Ateliers' },
              { number: '15+', label: 'Countries Served' },
              { number: '48-Hour', label: 'Avg. Custom Turnaround' },
            ].map((metric, i) => (
              <StaggerItem key={i} className="space-y-1 py-2 sm:py-0">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.2 }}
                  className="font-serif text-3xl sm:text-4xl text-[#F5E7A3] font-semibold tracking-tight cursor-default"
                >
                  {metric.number}
                </motion.div>
                <div className="text-xs text-[#C9C2A6] uppercase tracking-wider font-light">
                  {metric.label}
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* SECTION 3: FEATURED COLLECTIONS (Category Showcase) */}
      <section className="py-24 bg-[#060B1E] relative">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
          <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold mb-2">
                <Gem className="w-3.5 h-3.5" />
                Signature Archives
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#FAF8F3]">
                Explore Our Ready CAD Collections
              </h2>
            </div>
            <motion.button
              whileHover={{ x: 5 }}
              onClick={() => onNavigate('collections')}
              className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-[#F5E7A3] hover:text-[#FAF8F3] transition-colors"
            >
              <span>View All Categories</span>
              <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
            </motion.button>
          </RevealOnScroll>

          {/* Category Cards Grid — 100% live from backend */}
          <StaggerGrid className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {(categories.length > 0 ? categories : CATEGORIES).map((cat: any, idx: number) => {
              // Fallback jewellery images for categories without a real photo
              const fallbackImages = [
                'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
              ];
              const image = cat.image || fallbackImages[idx % fallbackImages.length];
              const count = cat.product_count ?? cat.count ?? 0;
              const tagline = cat.tagline || (cat.subcategories?.length
                ? cat.subcategories.map((s: any) => s.name).join(', ')
                : `Browse ${cat.name} CAD designs`);
              return (
                <StaggerItem key={cat.id}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => onNavigate('collections', cat.slug)}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#0E183D] border border-[#D4AF37]/25 cursor-pointer shadow-xl transition-all hover:border-[#D4AF37]"
                  >
                    <LazyImage
                      src={image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1330] via-[#0B1330]/40 to-transparent z-10" />

                    <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 space-y-1 z-20">
                      <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">
                        {count} Files Available
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl text-[#FAF8F3] font-medium group-hover:text-[#F5E7A3] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-[#C9C2A6] line-clamp-1 font-light opacity-80">
                        {tagline}
                      </p>
                      <div className="pt-2 flex items-center gap-1 text-[11px] text-[#F5E7A3] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>View Designs</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* SECTION 4: WHY SHIULI CAD STUDIO (The 4 Pillars) */}
      <section className="py-24 bg-[#070D22] border-y border-[#D4AF37]/20 relative">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
          <RevealOnScroll className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              <Award className="w-3.5 h-3.5" />
              The Shiuli Standard
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#FAF8F3]">
              Engineered for Casting. Perfected for Fine Jewellery.
            </h2>
            <p className="text-sm text-[#C9C2A6] font-light">
              Unlike generic 3D asset marketplaces, every Shiuli file is sculpted by certified bench jewellers and MatrixGold engineers with real casting foundry experience.
            </p>
          </RevealOnScroll>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Precision CAD Modelling',
                desc: 'Native Rhino .3DM files with structured layers for prongs, cutters, collets, and metal bodies. Clean NURBS geometry without messy trims.',
                icon: Layers,
                color: 'text-[#D4AF37] bg-[#D4AF37]/15 border-[#D4AF37]/40',
              },
              {
                title: 'High-Res STL for Casting',
                desc: 'Watertight solids verified with zero non-manifold edges. Pre-compensated for 1.25% gold & platinum shrinkage on 3D wax printers.',
                icon: FileCheck2,
                color: 'text-[#7EACFC] bg-[#1E4FA3]/25 border-[#1E4FA3]/50',
              },
              {
                title: '48-Hour Fast Turnaround',
                desc: 'From pencil sketch to 4K client renders and ready-to-cast CAD in under 48 hours. Express 24-hour delivery available on bespoke bridal orders.',
                icon: Clock,
                color: 'text-emerald-400 bg-[#2E7D5B]/20 border-[#2E7D5B]/40',
              },
              {
                title: 'Design Revisions Included',
                desc: 'Up to 2 complimentary revision rounds on custom orders. We adjust ring sizes, prong heights, or stone arrangements until your client approves.',
                icon: Repeat,
                color: 'text-[#F5E7A3] bg-[#D4AF37]/15 border-[#D4AF37]/40',
              },
            ].map((pillar, i) => {
              const IconComp = pillar.icon;
              return (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 rounded-2xl bg-[#091029] border border-[#D4AF37]/25 shadow-xl space-y-4 hover:border-[#D4AF37] transition-all backdrop-blur-md cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${pillar.color}`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-xl text-[#FAF8F3]">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-[#C9C2A6] leading-relaxed font-light">
                      {pillar.desc}
                    </p>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS (Process Preview Timeline) */}
      <section className="py-24 bg-[#060B1E] relative">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
          <RevealOnScroll className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              Simple 4-Step Process
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#FAF8F3]">
              How To Acquire Your Studio CAD Files
            </h2>
            <p className="text-xs text-[#C9C2A6] font-light">
              Whether choosing instant download from our catalog or requesting a bespoke file.
            </p>
          </RevealOnScroll>

          {/* Timeline with connecting gold line */}
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Scroll Animated Connecting Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="hidden md:block absolute top-8 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-[#D4AF37] via-[#5B8DEF] to-[#D4AF37] z-0 origin-left"
            />

            {[
              { num: '01', title: 'Browse or Request', desc: 'Pick a ready design from our collection or upload your customer’s pencil sketch for a custom quote.' },
              { num: '02', title: 'Confirm Specifications', desc: 'Choose your license, metal karat, stone dimensions, and desired casting shrinkage parameters.' },
              { num: '03', title: 'Master CAD Crafting', desc: 'Our Rhino 3D modeler builds the geometry with calibrated seat angles and verifies watertight mesh.' },
              { num: '04', title: 'Instant CAD Download', desc: 'Receive your .3DM, production .STL, and 4K photorealistic studio renders straight to your dashboard.' },
            ].map((step, i) => (
              <RevealOnScroll key={step.num} delay={i * 0.1} className="relative z-10 text-center space-y-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 mx-auto rounded-full bg-[#060B1E] border-2 border-[#D4AF37] flex items-center justify-center text-lg font-serif font-bold text-[#F5E7A3] shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer"
                >
                  {step.num}
                </motion.div>
                <h4 className="font-serif text-lg text-[#FAF8F3]">
                  {step.title}
                </h4>
                <p className="text-xs text-[#C9C2A6] leading-relaxed font-light">
                  {step.desc}
                </p>
              </RevealOnScroll>
            ))}
          </div>

          <div className="pt-4 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => onNavigate('how-it-works')}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#D4AF37] hover:text-[#F5E7A3] font-semibold"
            >
              <span>Learn About Full 7-Stage Quality Control</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* SECTION 6: FEATURED / BESTSELLING DESIGNS */}
      <section className="py-24 bg-[#080E24] border-t border-[#D4AF37]/20 relative">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
          <RevealOnScroll className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              Ready-To-Cast CAD Files
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#FAF8F3]">
              Bestselling Jewellery CAD Files
            </h2>
            <p className="text-xs text-[#C9C2A6] font-light">
              Instant download includes native Rhino .3DM, castable .STL, and 4K render pack.
            </p>

            {/* Filter Chips — dynamically built from live backend categories */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {[
                { id: 'all', label: 'All Designs' },
                ...(categories.length > 0
                  ? categories.slice(0, 7).map((c) => ({ id: c.slug, label: c.name }))
                  : [
                      { id: 'rings', label: 'Rings' },
                      { id: 'pendants', label: 'Pendants' },
                      { id: 'earrings', label: 'Earrings' },
                      { id: 'necklaces', label: 'Necklaces' },
                      { id: 'bangles', label: 'Bangles' },
                    ]),
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                    selectedFilter === filter.id
                      ? 'bg-[#D4AF37] text-[#0B1330] font-semibold shadow-md'
                      : 'bg-[#121F4D]/50 text-[#C9C2A6] hover:text-white border border-[#D4AF37]/20'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </RevealOnScroll>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl bg-[#091029] border border-[#D4AF37]/20 p-12 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#121F4D] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#FAF8F3]">
                No Designs Found in This Category
              </h3>
              <p className="text-xs text-[#C9C2A6] leading-relaxed">
                We haven't listed ready CAD files under this filter yet. You can browse all designs or request a bespoke model.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className="btn-gold-luxury px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider"
                >
                  View All Designs
                </button>
                <button
                  onClick={() => onNavigate('custom-design')}
                  className="px-5 py-2 rounded-full border border-[#D4AF37]/30 text-xs text-[#FAF8F3] hover:bg-white/5 transition-colors"
                >
                  Request Custom CAD
                </button>
              </div>
            </div>
          ) : (
            <StaggerGrid key={selectedFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const isWishlisted = wishlistIds.includes(product.id);
                return (
                  <StaggerItem key={product.id}>
                    <motion.div
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => onNavigate('product-detail', product.id)}
                      className="group rounded-2xl bg-[#0B1330] border border-[#D4AF37]/20 overflow-hidden shadow-xl hover:border-[#D4AF37]/60 transition-all flex flex-col justify-between cursor-pointer"
                    >
                      {/* Image Frame */}
                      <div className="relative aspect-square overflow-hidden bg-[#070D22]">
                        <LazyImage
                          src={product.primaryImage}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                          {product.isBestseller && (
                            <span className="px-2 py-0.5 rounded-md bg-[#D4AF37] text-[#0B1330] text-[10px] font-bold tracking-wider uppercase shadow-md">
                              Bestseller
                            </span>
                          )}
                          {product.isNew && (
                            <span className="px-2 py-0.5 rounded-md bg-[#1E4FA3] text-white text-[10px] font-bold tracking-wider uppercase shadow-md">
                              New
                            </span>
                          )}
                        </div>

                        {/* Quick View and Wishlist overlay */}
                        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
                            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                              isWishlisted
                                ? 'bg-[#D4AF37] text-[#0B1330]'
                                : 'bg-[#0B1330]/70 text-[#FAF8F3] hover:text-[#D4AF37]'
                            }`}
                            title="Wishlist"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
                          className="absolute inset-x-3 bottom-3 z-10 py-2 rounded-xl bg-[#0B1330]/90 backdrop-blur border border-[#D4AF37]/30 text-xs text-[#FAF8F3] flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Quick View Specs</span>
                        </button>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-3">
                        <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-medium">
                          {product.category} • {product.specs.diamondCount} Stones
                        </div>

                        <h3 className="font-serif text-lg text-[#FAF8F3] group-hover:text-[#F5E7A3] line-clamp-1 transition-colors">
                          {product.title}
                        </h3>

                        <div className="flex items-center justify-between text-xs text-[#C9C2A6] pt-1 border-t border-white/5 font-light">
                          <span>18K: {product.specs.metalWeight18k}</span>
                          <span className="font-mono text-emerald-400">STL Verified</span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <span className="text-xl font-serif font-bold text-[#F5E7A3]">
                              ${product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-[#C9C2A6] line-through ml-1.5">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); onAddToCart(product, 'standard'); }}
                            className="btn-gold-luxury px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3 text-[#0B1330]" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          )}

          <div className="pt-4 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => onNavigate('collections')}
              className="px-8 py-3.5 rounded-full border border-[#D4AF37]/40 text-[#FAF8F3] hover:border-[#D4AF37] hover:bg-[#121F4D]/40 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Browse Complete Catalog (200+ CAD Files)
            </motion.button>
          </div>
        </div>
      </section>

      {/* SECTION 7: CUSTOM DESIGN SPOTLIGHT (Split Banner with Before/After Slider) */}
      <section className="py-24 bg-[#060B1E] relative">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Text Column */}
            <RevealOnScroll className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                <Zap className="w-3.5 h-3.5" />
                Bespoke CAD Service
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#FAF8F3] leading-tight">
                Have a Design in Mind? Let’s Build It Together.
              </h2>

              <p className="text-sm sm:text-base text-[#C9C2A6] font-light leading-relaxed">
                Send us a hand-drawn pencil sketch, gouache illustration, or client moodboard. Our master MatrixGold modelers will engineer a ready-to-cast 3D NURBS assembly with stone seats and 4K photorealistic renders in 48 hours.
              </p>

              {/* Feature Checklist */}
              <div className="space-y-2.5 text-xs text-[#FAF8F3]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span>Zero stone setting rocking guarantee with pre-notched 42° seats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span>Exact finger sizes calibrated across US, EU, and Indian ring standards</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span>Includes 4K ray-traced turntable render video for instant client sign-off</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => onNavigate('custom-design')}
                  className="btn-gold-luxury px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-xl"
                >
                  <span>Start Custom Request</span>
                  <ArrowRight className="w-4 h-4 text-[#0B1330]" />
                </motion.button>

                <a
                  href="https://wa.me/919662159084"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 rounded-full border border-[#D4AF37]/30 text-xs text-[#FAF8F3] hover:border-[#D4AF37] hover:bg-white/5 transition-colors"
                >
                  Chat on WhatsApp (+91 9662159084)
                </a>
              </div>
            </RevealOnScroll>

            {/* Right Column: Interactive Before/After Slider */}
            <RevealOnScroll className="lg:col-span-6" delay={0.2}>
              <BeforeAfterSlider
                beforeImage="/unsplash-img/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80"
                afterImage="/unsplash-img/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80"
                beforeLabel="Client Concept Sketch"
                afterLabel="Shiuli 4K 3D CAD Render"
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* SECTION 8: TESTIMONIALS WITH SMOOTH TRANSITION */}
      <section className="py-24 bg-[#070D22] border-y border-[#D4AF37]/20 relative">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
          <RevealOnScroll className="text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
              Client Testimonials
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#FAF8F3]">
              Trusted By Master Jewellers Globally
            </h2>
          </RevealOnScroll>

          {/* Carousel Card */}
          <RevealOnScroll className="max-w-4xl mx-auto relative rounded-3xl bg-[#091029] border border-[#D4AF37]/30 p-8 sm:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="text-4xl font-serif text-[#D4AF37] mb-4">“</div>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={activeTestimonialIdx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="font-serif text-lg sm:text-2xl text-[#FAF8F3] leading-relaxed italic mb-8"
              >
                {TESTIMONIALS[activeTestimonialIdx].quote}
              </motion.p>
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#D4AF37]/15 pt-6">
              <div className="flex items-center gap-4">
                <img
                  src={TESTIMONIALS[activeTestimonialIdx].avatar}
                  alt={TESTIMONIALS[activeTestimonialIdx].name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37] shadow-md"
                />
                <div>
                  <h4 className="font-serif text-lg text-[#FAF8F3] font-semibold">
                    {TESTIMONIALS[activeTestimonialIdx].name}
                  </h4>
                  <p className="text-xs text-[#C9C2A6] font-light">
                    {TESTIMONIALS[activeTestimonialIdx].role} • {TESTIMONIALS[activeTestimonialIdx].company}
                  </p>
                  <p className="text-[11px] text-[#D4AF37] font-mono">
                    {TESTIMONIALS[activeTestimonialIdx].location}
                  </p>
                </div>
              </div>

              {/* Rating and Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="flex text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      setActiveTestimonialIdx((prev) =>
                        prev === 0 ? TESTIMONIALS.length - 1 : prev - 1
                      )
                    }
                    className="p-2.5 rounded-full border border-[#D4AF37]/30 text-[#C9C2A6] hover:text-[#FAF8F3] hover:border-[#D4AF37] transition-colors"
                    title="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      setActiveTestimonialIdx((prev) =>
                        (prev + 1) % TESTIMONIALS.length
                      )
                    }
                    className="p-2.5 rounded-full border border-[#D4AF37]/30 text-[#C9C2A6] hover:text-[#FAF8F3] hover:border-[#D4AF37] transition-colors"
                    title="Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* SECTION 9: PORTFOLIO / GALLERY STRIP */}
      <section className="py-24 bg-[#060B1E] relative">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 space-y-10">
          <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Visual Proof of Craftsmanship
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#FAF8F3]">
                The Shiuli Lookbook
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => onNavigate('gallery')}
              className="btn-gold-luxury px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>View Full Studio Gallery</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0B1330]" />
            </motion.button>
          </RevealOnScroll>

          {/* Grid with Stagger */}
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GALLERY_ITEMS.slice(0, 3).map((item) => (
              <StaggerItem key={item.id}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => onNavigate('gallery')}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#0E183D] border border-[#D4AF37]/25 cursor-pointer shadow-xl hover:border-[#D4AF37]"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1330] via-[#0B1330]/30 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-5 space-y-1">
                    <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">
                      {item.category} • {item.specs.weight}
                    </span>
                    <h3 className="font-serif text-xl text-[#FAF8F3] group-hover:text-[#F5E7A3] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#C9C2A6] line-clamp-1 font-light">{item.description}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* SECTION 11: FINAL CTA BANNER */}
      <section className="relative py-28 text-center bg-gradient-to-b from-[#060B1E] via-[#0E183D] to-[#040816] border-t border-[#D4AF37]/20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <RevealOnScroll className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="max-w-3xl mx-auto space-y-6">
            <BrandLogo variant="mark-only" size="lg" className="mx-auto" />

            <h2 className="font-serif text-3xl sm:text-5xl text-[#FAF8F3] leading-tight">
              Ready to Bring Your Jewellery Designs to Life?
            </h2>

            <p className="text-sm sm:text-base text-[#C9C2A6] font-light max-w-xl mx-auto">
              Experience CAD files engineered with 0.02mm tolerance, zero-gap stone seats, and guaranteed castability.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('collections')}
                className="btn-gold-luxury px-9 py-4 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-2xl"
              >
                <span>Explore Ready CAD Files</span>
                <ArrowRight className="w-4 h-4 text-[#0B1330]" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('contact')}
                className="px-9 py-4 rounded-full border border-[#D4AF37]/40 text-[#FAF8F3] hover:border-[#D4AF37] hover:bg-white/5 text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Contact Atelier Team
              </motion.button>
            </div>
          </div>
        </RevealOnScroll>
      </section>

    </div>
  );
};
