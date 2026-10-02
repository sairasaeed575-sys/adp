import React, { useState } from 'react';
import { Product } from '../../types';
import { useNavigation } from '../../context/NavigationContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { navigate } = useNavigation();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [isHovered, setIsHovered] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  // Compute total inventory across variants
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = totalStock <= 0;
  const isLowStock = !isOutOfStock && totalStock <= 5;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    showToast(
      added 
        ? `Added "${product.name}" to your wishlist.` 
        : `Removed "${product.name}" from your wishlist.`,
      added ? 'success' : 'info'
    );
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Pick the first available variant
    const availableVariant = product.variants.find(v => v.stock > 0) || product.variants[0];
    if (!availableVariant || isOutOfStock) {
      showToast('This product is currently out of stock.', 'error');
      return;
    }

    const res = addToCart(product, availableVariant, 1);
    if (res.success) {
      showToast(`Added ${product.name} (Size: ${availableVariant.size}) to your bag.`, 'success');
    } else {
      showToast(res.message || 'Could not add to cart', 'error');
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col bg-[#FFFDFC] rounded-2xl border border-[#E8DDDA] overflow-hidden hover:shadow-xl hover:border-[#A65C70]/40 transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-[#FAF5F1] overflow-hidden">
        {/* Main & Hover Image */}
        <img
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="px-2.5 py-1 rounded-full bg-[#7D4052] text-[#FFFDFC] text-[10px] font-semibold tracking-wider uppercase shadow-xs">
              New
            </span>
          )}
          {product.salePrice && product.discountPercentage && (
            <span className="px-2.5 py-1 rounded-full bg-[#A65C70] text-white text-[10px] font-semibold tracking-wider shadow-xs">
              {product.discountPercentage}% OFF
            </span>
          )}
          {isLowStock && (
            <span className="px-2 py-0.5 rounded-full bg-amber-600 text-white text-[9px] font-semibold tracking-wide">
              Only {totalStock} Left
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-full bg-gray-700 text-white text-[9px] font-semibold tracking-wide">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button Right */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 z-10 shadow-xs ${
            isWishlisted
              ? 'bg-[#A65C70] text-white'
              : 'bg-white/80 text-[#272326] hover:bg-white hover:text-[#A65C70]'
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Quick Actions Bar */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/95 text-[#272326] text-xs font-semibold tracking-wide hover:bg-[#FAF5F1] transition-colors shadow-md flex items-center justify-center gap-1.5 backdrop-blur-xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#A65C70]" />
            <span>Quick View</span>
          </button>

          {!isOutOfStock && (
            <button
              onClick={handleQuickAdd}
              className="p-2.5 rounded-xl bg-[#7D4052] text-white hover:bg-[#A65C70] transition-colors shadow-md"
              title="Quick Add"
              aria-label="Quick Add to Bag"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#A65C70] uppercase tracking-widest font-semibold mb-1">
            <span>{product.categoryName}</span>
            {product.rating !== undefined && product.rating > 0 && (
              <div className="flex items-center gap-1 text-[#C7A26A] font-semibold text-[11px]">
                <Star className="w-3 h-3 fill-current" />
                <span>{product.rating}</span>
                <span className="text-[#6F6769] font-normal">({product.reviewCount})</span>
              </div>
            )}
          </div>

          <h3 className="font-editorial text-base sm:text-lg font-medium text-[#272326] line-clamp-1 group-hover:text-[#A65C70] transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-[#6F6769] line-clamp-1 mt-0.5">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Variant Sizes */}
        <div className="pt-3 mt-2 border-t border-[#FAF5F1] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {product.salePrice ? (
              <>
                <span className="text-base font-semibold text-[#7D4052]">
                  ${product.salePrice}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ${product.price}
                </span>
              </>
            ) : (
              <span className="text-base font-semibold text-[#272326]">
                ${product.price}
              </span>
            )}
          </div>

          {/* Sizes available */}
          <div className="flex items-center gap-1">
            {product.variants.slice(0, 4).map(v => (
              <span 
                key={v.id} 
                className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                  v.stock > 0 
                    ? 'border-[#E8DDDA] text-[#6F6769] bg-[#FAF5F1]' 
                    : 'border-transparent text-gray-300 line-through'
                }`}
              >
                {v.size}
              </span>
            ))}
            {product.variants.length > 4 && (
              <span className="text-[9px] text-[#6F6769]">+{product.variants.length - 4}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
