import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { ProductCard } from '../components/common/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { Product, Category } from '../types';
import { 
  Filter, X, ChevronDown, SlidersHorizontal, 
  RotateCcw, Sparkles, Search as SearchIcon 
} from 'lucide-react';

interface ShopPageProps {
  initialFilter?: 'new-arrivals' | 'sale';
  categorySlug?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialFilter, categorySlug }) => {
  const { queryParams, navigate } = useNavigation();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters state
  const [search, setSearch] = useState(queryParams.search || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlug || queryParams.category || 'all');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(400);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [specialFilter, setSpecialFilter] = useState<string>(initialFilter || queryParams.filter || '');

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (categorySlug) setSelectedCategory(categorySlug);
    if (initialFilter) setSpecialFilter(initialFilter);
    if (queryParams.search) setSearch(queryParams.search);
  }, [categorySlug, initialFilter, queryParams]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
    if (selectedSize) params.append('size', selectedSize);
    if (selectedColor) params.append('color', selectedColor);
    if (priceRange < 400) params.append('maxPrice', String(priceRange));
    if (sortBy) params.append('sort', sortBy);
    if (specialFilter) params.append('filter', specialFilter);

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        let prods: Product[] = data.products || [];
        if (inStockOnly) {
          prods = prods.filter(p => p.variants.some(v => v.stock > 0));
        }
        setProducts(prods);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, selectedCategory, selectedSize, selectedColor, priceRange, inStockOnly, sortBy, specialFilter]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedSize('');
    setSelectedColor('');
    setPriceRange(400);
    setInStockOnly(false);
    setSpecialFilter('');
    setSortBy('featured');
    navigate('/shop');
  };

  const hasActiveFilters = Boolean(
    search || (selectedCategory && selectedCategory !== 'all') || selectedSize || selectedColor || priceRange < 400 || inStockOnly || specialFilter
  );

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Rose', 'Mauve', 'Ivory', 'Black', 'Emerald', 'Champagne'];

  const currentCategoryObj = categories.find(c => c.slug === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#FAF5F1] border border-[#E8DDDA] p-8 sm:p-12 text-center space-y-3 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] uppercase tracking-widest font-semibold text-[#A65C70]">
            {specialFilter === 'new-arrivals' 
              ? 'New In This Season' 
              : specialFilter === 'sale' 
              ? 'Private Sale Privileges' 
              : currentCategoryObj ? currentCategoryObj.name : 'The Complete Collection'}
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium text-[#272326]">
            {currentCategoryObj ? currentCategoryObj.name : 'Luxury Ladies Garments'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6769] font-light leading-relaxed">
            {currentCategoryObj?.description || 'From botanical lawn ensembles to hand-pleated gowns, explore garments crafted for confidence and comfort.'}
          </p>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 border-y border-[#E8DDDA]">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 rounded-xl bg-[#FAF5F1] text-[#272326] text-xs font-semibold flex items-center gap-2 border border-[#E8DDDA]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#A65C70]" />
            <span>Filters ({products.length})</span>
          </button>

          <span className="text-xs text-[#6F6769] font-medium hidden sm:inline">
            Showing <strong className="text-[#272326]">{products.length}</strong> styles
          </span>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#A65C70] hover:underline flex items-center gap-1 font-medium ml-2"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Sorting */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-[#6F6769] font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-xs py-2 px-3 bg-white border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70] text-[#272326] font-medium"
          >
            <option value="featured">Featured Curations</option>
            <option value="newest">Newest Arrivals</option>
            <option value="bestseller">Best Selling</option>
            <option value="rating">Highest Customer Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 p-6 rounded-2xl bg-[#FFFDFC] border border-[#E8DDDA]">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8DDDA]">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#272326] flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#A65C70]" />
              <span>Refine Catalog</span>
            </h3>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="text-[11px] text-[#A65C70] hover:underline">
                Clear All
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#272326]">Search Keyword</label>
            <div className="relative">
              <SearchIcon className="w-3.5 h-3.5 text-[#6F6769] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Suit, linen, black..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2.5 pt-4 border-t border-[#FAF5F1]">
            <label className="text-xs font-semibold text-[#272326]">Category</label>
            <div className="space-y-1.5 text-xs text-[#6F6769]">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`block w-full text-left py-1 px-2 rounded-lg transition-colors ${
                  selectedCategory === 'all' ? 'bg-[#FAF5F1] text-[#7D4052] font-semibold' : 'hover:text-[#A65C70]'
                }`}
              >
                All Garments
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`block w-full text-left py-1 px-2 rounded-lg transition-colors ${
                    selectedCategory === c.slug ? 'bg-[#FAF5F1] text-[#7D4052] font-semibold' : 'hover:text-[#A65C70]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2.5 pt-4 border-t border-[#FAF5F1]">
            <label className="text-xs font-semibold text-[#272326]">Available Size</label>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map(sz => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedSize === sz
                      ? 'border-[#7D4052] bg-[#7D4052] text-white'
                      : 'border-[#E8DDDA] bg-[#FAF5F1]/40 text-[#272326] hover:border-[#A65C70]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="space-y-2.5 pt-4 border-t border-[#FAF5F1]">
            <label className="text-xs font-semibold text-[#272326]">Color Family</label>
            <div className="flex flex-wrap gap-1.5">
              {colors.map(col => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(selectedColor === col ? '' : col)}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                    selectedColor === col
                      ? 'border-[#A65C70] bg-[#FAF5F1] text-[#7D4052] font-semibold'
                      : 'border-[#E8DDDA] text-[#6F6769] hover:border-[#A65C70]'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 pt-4 border-t border-[#FAF5F1]">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#272326]">Max Price:</span>
              <span className="font-semibold text-[#7D4052]">${priceRange}</span>
            </div>
            <input
              type="range"
              min="50"
              max="400"
              step="10"
              value={priceRange}
              onChange={e => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#7D4052] cursor-pointer"
            />
          </div>

          {/* In Stock Only Switch */}
          <div className="pt-4 border-t border-[#FAF5F1]">
            <label className="flex items-center gap-2.5 text-xs text-[#272326] cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#7D4052] accent-[#7D4052]"
              />
              <span className="font-medium">In Stock Items Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area (3 cols) */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#A65C70] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#6F6769]">Gathering garments...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center bg-[#FAF5F1]/50 rounded-3xl border border-[#E8DDDA] p-8 space-y-4">
              <p className="font-editorial text-2xl text-[#272326]">No garments matched your criteria</p>
              <p className="text-xs text-[#6F6769] max-w-md mx-auto leading-relaxed">
                Try widening your price range, choosing another color or size, or resetting your active filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-4/5 max-w-sm bg-[#FFFDFC] h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DDDA]">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#272326]">
                  Filter Garments
                </h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1">
                  <X className="w-5 h-5 text-[#6F6769]" />
                </button>
              </div>

              {/* Mobile Category Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#272326]">Category</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`block w-full text-left py-1 text-xs ${selectedCategory === 'all' ? 'font-bold text-[#A65C70]' : ''}`}
                  >
                    All Categories
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`block w-full text-left py-1 text-xs ${selectedCategory === c.slug ? 'font-bold text-[#A65C70]' : ''}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#272326]">Size</label>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                      className={`px-3 py-1 text-xs rounded-lg border ${
                        selectedSize === sz ? 'bg-[#7D4052] text-white border-[#7D4052]' : 'border-[#E8DDDA]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8DDDA] space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider"
              >
                Apply Filters ({products.length})
              </button>
              <button
                onClick={clearAllFilters}
                className="w-full py-2 text-center text-xs text-[#6F6769]"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
