import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { navigate } = useNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/products?search=${encodeURIComponent(query.trim())}`)
        .then(res => res.json())
        .then(data => {
          if (data.products) setResults(data.products.slice(0, 6));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectProduct = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleFullSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate('/shop', { search: query.trim() });
  };

  const popularTags = ['Lawn Suit', 'Linen Co-Ord', 'Silk Abaya', 'Pearl Maxi', 'Velvet', 'Organza'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 md:p-20 animate-fade-in">
      <div className="w-full max-w-2xl bg-[#FFFDFC] rounded-3xl shadow-2xl border border-[#E8DDDA] overflow-hidden animate-scale-up">
        {/* Search Input Bar */}
        <form onSubmit={handleFullSearch} className="p-6 border-b border-[#E8DDDA] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#A65C70] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search ladies garments by name, fabric, style, or SKU..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 text-sm sm:text-base bg-transparent focus:outline-none placeholder:text-[#6F6769]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[#6F6769] hover:text-[#272326] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6F6769] hover:text-[#272326] rounded-full hover:bg-[#FAF5F1]"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Popular Tags */}
        <div className="px-6 py-3 bg-[#FAF5F1]/60 border-b border-[#E8DDDA] flex items-center gap-2 overflow-x-auto text-xs text-[#6F6769]">
          <span className="shrink-0 flex items-center gap-1 font-semibold text-[#7D4052]">
            <Sparkles className="w-3 h-3 text-[#C7A26A]" />
            Trending:
          </span>
          {popularTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag)}
              className="px-2.5 py-1 rounded-full bg-white border border-[#E8DDDA] hover:border-[#A65C70] hover:text-[#A65C70] transition-colors shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Live Results Preview */}
        <div className="max-h-96 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-8 text-xs text-[#6F6769]">Searching catalog...</div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#A65C70] mb-2">
                Matching Garments ({results.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod.slug)}
                    className="flex gap-3 p-3 rounded-2xl border border-[#E8DDDA] hover:border-[#A65C70] hover:bg-[#FAF5F1]/50 cursor-pointer transition-all"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-16 h-20 object-cover rounded-xl shrink-0"
                    />
                    <div className="min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] text-[#A65C70] uppercase tracking-wider">{prod.categoryName}</div>
                        <h4 className="text-xs font-semibold text-[#272326] truncate">{prod.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-[#7D4052]">
                          ${prod.salePrice || prod.price}
                        </span>
                        {prod.salePrice && (
                          <span className="text-[11px] text-gray-400 line-through">
                            ${prod.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleFullSearch}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#FAF5F1] text-[#7D4052] text-xs font-medium hover:bg-[#E9C8CC]/40 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View all search results for "{query}"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <p className="font-editorial text-lg text-[#272326]">No garments found</p>
              <p className="text-xs text-[#6F6769]">
                We couldn’t find any styles matching "{query}". Try checking your spelling or searching for another keyword.
              </p>
            </div>
          )}

          {!query.trim() && (
            <div className="text-center py-8 text-xs text-[#6F6769]">
              Type in the box above to search our latest seasonal collections and luxury unstitched fabrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
