import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ProductCard } from '../components/common/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { Product, Category, HomepageCMS } from '../types';
import { 
  ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw, 
  HeartHandshake, Star, Quote, ChevronRight 
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate } = useNavigation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cms, setCms] = useState<HomepageCMS | null>(null);
  const [activeTab, setActiveTab] = useState<'featured' | 'new-arrivals' | 'best-sellers'>('featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/cms/homepage').then(r => r.json()),
    ])
      .then(([prodData, catData, cmsData]) => {
        if (prodData.products) setProducts(prodData.products);
        if (catData.categories) setCategories(catData.categories);
        if (cmsData.cms) setCms(cmsData.cms);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed loading homepage data:', err);
        setLoading(false);
      });
  }, []);

  const hero = cms?.hero || {
    badge: 'SPRING / SUMMER 2026',
    title: 'Elegance in Every Stitch',
    description: 'Discover timeless women’s wear designed for comfort, confidence, and every radiant moment of your life.',
    primaryCtaText: 'Shop Now',
    primaryCtaLink: '/shop',
    secondaryCtaText: 'Explore Collection',
    secondaryCtaLink: '/shop?collection=spring-summer',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1400&q=85',
    secondaryBannerImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=85',
    secondaryBadge: 'NEW COLLECTION',
    secondaryTitle: 'Fresh Styles • Soft Fabrics',
    secondarySubtitle: 'Everyday Elegance Tailored For You',
  };

  const displayedProducts = products.filter(p => {
    if (activeTab === 'new-arrivals') return p.isNewArrival;
    if (activeTab === 'best-sellers') return p.isBestSeller;
    return p.isFeatured;
  });

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Hero Banner Left (8 cols) */}
          <div className="lg:col-span-8 relative rounded-3xl overflow-hidden bg-[#FAF5F1] min-h-[520px] sm:min-h-[620px] flex flex-col justify-end p-8 sm:p-14 shadow-xs border border-[#E8DDDA] group">
            <img
              src={hero.image}
              alt="Comfort Ladies Fashion"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Subtle Gradient Veil for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#272326]/85 via-[#272326]/40 to-transparent" />

            <div className="relative z-10 max-w-xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[#FAF5F1] text-[11px] font-semibold tracking-widest uppercase border border-white/30">
                <Sparkles className="w-3.5 h-3.5 text-[#C7A26A]" />
                <span>{hero.badge}</span>
              </div>

              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-white font-medium leading-[1.1] tracking-tight">
                {hero.title}
              </h1>

              <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-lg font-light">
                {hero.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => navigate(hero.primaryCtaLink)}
                  className="px-8 py-3.5 rounded-xl bg-[#A65C70] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#7D4052] transition-colors shadow-lg shadow-[#7D4052]/30 flex items-center gap-2"
                >
                  <span>{hero.primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate(hero.secondaryCtaLink)}
                  className="px-8 py-3.5 rounded-xl bg-white/90 backdrop-blur-md text-[#272326] text-xs font-semibold tracking-widest uppercase hover:bg-white transition-colors"
                >
                  {hero.secondaryCtaText}
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Hero Editorial Card Right (4 cols) */}
          <div className="lg:col-span-4 relative rounded-3xl overflow-hidden bg-[#FAF5F1] min-h-[400px] flex flex-col justify-between p-8 border border-[#E8DDDA] shadow-xs group">
            <img
              src={hero.secondaryBannerImage}
              alt="Comfort Seasonal Showcase"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#272326]/90 via-[#272326]/30 to-transparent" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-3 py-1 rounded-full bg-[#FAF5F1]/90 backdrop-blur-md text-[#7D4052] text-[10px] font-bold tracking-widest uppercase">
                {hero.secondaryBadge}
              </span>
            </div>

            <div className="relative z-10 space-y-2 text-white">
              <div className="text-[11px] text-[#C7A26A] font-semibold uppercase tracking-widest">
                {hero.secondaryTitle}
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-medium leading-tight">
                {hero.secondarySubtitle}
              </h2>
              <button
                onClick={() => navigate('/shop/new-arrivals')}
                className="pt-2 text-xs font-semibold text-white hover:text-[#C7A26A] flex items-center gap-1.5 transition-colors underline underline-offset-4"
              >
                <span>Discover New Arrivals</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / SERVICE BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 sm:p-8 bg-[#FAF5F1]/70 rounded-3xl border border-[#E8DDDA]">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white text-[#A65C70] shadow-xs border border-[#E8DDDA] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#272326]">Fast & Free Shipping</h4>
              <p className="text-[11px] sm:text-xs text-[#6F6769] mt-0.5">Complimentary on orders over $50</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white text-[#A65C70] shadow-xs border border-[#E8DDDA] shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#272326]">Easy 14-Day Returns</h4>
              <p className="text-[11px] sm:text-xs text-[#6F6769] mt-0.5">Hassle-free exchange policy</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white text-[#A65C70] shadow-xs border border-[#E8DDDA] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#272326]">100% Secure Checkout</h4>
              <p className="text-[11px] sm:text-xs text-[#6F6769] mt-0.5">Card, Wire & Cash on Delivery</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white text-[#A65C70] shadow-xs border border-[#E8DDDA] shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#272326]">Bespoke Support</h4>
              <p className="text-[11px] sm:text-xs text-[#6F6769] mt-0.5">Sizing and styling assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY (Circular Luxury Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8DDDA] pb-4">
          <div>
            <span className="text-xs font-semibold text-[#A65C70] uppercase tracking-widest">
              Curated Wardrobe
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#272326] font-medium mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-semibold text-[#7D4052] hover:text-[#A65C70] flex items-center gap-1 transition-colors uppercase tracking-wider"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => navigate(`/shop/category/${cat.slug}`)}
              className="flex flex-col items-center group cursor-pointer text-center space-y-3"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-[#E8DDDA] group-hover:border-[#A65C70] group-hover:shadow-xl transition-all duration-300 p-1 bg-white">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#272326] group-hover:text-[#A65C70] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-[#6F6769] font-light">
                  {cat.subcategories?.[0] || 'Explore'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED COLLECTION & TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#A65C70] uppercase tracking-widest">
              Signature Ensembles
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#272326] font-medium mt-1">
              Featured Collection
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#FAF5F1] border border-[#E8DDDA]">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
                activeTab === 'featured'
                  ? 'bg-[#7D4052] text-white shadow-xs'
                  : 'text-[#6F6769] hover:text-[#272326]'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab('new-arrivals')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
                activeTab === 'new-arrivals'
                  ? 'bg-[#7D4052] text-white shadow-xs'
                  : 'text-[#6F6769] hover:text-[#272326]'
              }`}
            >
              New In
            </button>
            <button
              onClick={() => setActiveTab('best-sellers')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
                activeTab === 'best-sellers'
                  ? 'bg-[#7D4052] text-white shadow-xs'
                  : 'text-[#6F6769] hover:text-[#272326]'
              }`}
            >
              Best Sellers
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/shop')}
            className="px-8 py-3.5 rounded-xl border border-[#7D4052] text-[#7D4052] text-xs font-semibold tracking-widest uppercase hover:bg-[#7D4052] hover:text-white transition-all shadow-xs"
          >
            Explore Complete Catalog
          </button>
        </div>
      </section>

      {/* 5. ATELIER BRAND STORY / EDITORIAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#FAF5F1] border border-[#E8DDDA] overflow-hidden p-8 sm:p-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#A65C70] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C7A26A]" />
              The Art of Comfort
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium text-[#272326] leading-tight">
              Grace in every stitch, peace in every fold.
            </h2>
            <p className="text-xs sm:text-sm text-[#6F6769] leading-relaxed">
              We believe a woman should never have to choose between elegance and physical ease. Every COMFORT garment is born from 80s yarn lawn, pure European flax linen, or double-georgette silk—treated with breathable dyes and finished with hand-embroidered scallops.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-2">
              <div>
                <div className="font-editorial text-2xl sm:text-3xl text-[#7D4052] font-semibold">100%</div>
                <div className="text-xs text-[#6F6769] mt-0.5">Breathable Natural Fibers</div>
              </div>
              <div>
                <div className="font-editorial text-2xl sm:text-3xl text-[#7D4052] font-semibold">14-Day</div>
                <div className="text-xs text-[#6F6769] mt-0.5">Complimentary Returns</div>
              </div>
            </div>
            <button
              onClick={() => navigate('/about')}
              className="px-6 py-3 rounded-xl bg-[#272326] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#7D4052] transition-colors"
            >
              Learn About Our Atelier
            </button>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-[#E8DDDA]">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=85"
              alt="Comfort Atelier Craftsmanship"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6. REAL VERIFIED REVIEWS TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-[#A65C70] uppercase tracking-widest">
            Customer Praise
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#272326] font-medium">
            Loved for Fabric & Fit
          </h2>
          <p className="text-xs text-[#6F6769]">
            Genuine testimonials from verified patrons who wear COMFORT daily.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDFC] border border-[#E8DDDA] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-[#C7A26A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <h3 className="font-editorial text-lg font-semibold text-[#272326]">
                "The lawn fabric is like second skin"
              </h3>
              <p className="text-xs text-[#6F6769] leading-relaxed">
                The Rose Embroidered Suit exceeded my expectations. Even in 90-degree summer weather, the lawn breathed beautifully, and the scallop borders stayed crisp after washing.
              </p>
            </div>
            <div className="pt-4 border-t border-[#FAF5F1] flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-[#272326]">Saira Saeed</div>
                <div className="text-[10px] text-emerald-600 font-medium">Verified Purchase</div>
              </div>
              <span className="text-[10px] text-gray-400">California, USA</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDFC] border border-[#E8DDDA] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-[#C7A26A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <h3 className="font-editorial text-lg font-semibold text-[#272326]">
                "True European linen tailoring"
              </h3>
              <p className="text-xs text-[#6F6769] leading-relaxed">
                I ordered the Mauve Co-Ord Set for a flight and weekend brunch. The cut is so flattering, and mother-of-pearl buttons are a sublime luxury touch.
              </p>
            </div>
            <div className="pt-4 border-t border-[#FAF5F1] flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-[#272326]">Amira Khan</div>
                <div className="text-[10px] text-emerald-600 font-medium">Verified Purchase</div>
              </div>
              <span className="text-[10px] text-gray-400">London, UK</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFDFC] border border-[#E8DDDA] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-[#C7A26A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <h3 className="font-editorial text-lg font-semibold text-[#272326]">
                "Impeccable abaya drape & modesty"
              </h3>
              <p className="text-xs text-[#6F6769] leading-relaxed">
                Korean Nida silk is hard to find in this high grade. Opaque, flowy, and zero static cling. I will definitely be ordering other colors.
              </p>
            </div>
            <div className="pt-4 border-t border-[#FAF5F1] flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-[#272326]">Fatima Al-Zahra</div>
                <div className="text-[10px] text-emerald-600 font-medium">Verified Purchase</div>
              </div>
              <span className="text-[10px] text-gray-400">Dubai, UAE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
