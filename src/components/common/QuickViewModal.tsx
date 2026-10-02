import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { X, Star, ShoppingBag, Check, ShieldCheck, ArrowRight, Minus, Plus } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  if (!product) return null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(() => {
    return product.variants.find(v => v.stock > 0) || product.variants[0];
  });
  const [activeImage, setActiveImage] = useState<string>(product.images[0]);
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = selectedVariant.stock <= 0;
  const isLowStock = !isOutOfStock && selectedVariant.stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, selectedVariant, quantity);
    if (res.success) {
      showToast(`Added ${quantity}x ${product.name} (Size: ${selectedVariant.size}) to your bag.`, 'success');
      onClose();
    } else {
      showToast(res.message || 'Error adding to cart', 'error');
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/product/${product.slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-3xl bg-[#FFFDFC] rounded-3xl shadow-2xl border border-[#E8DDDA] overflow-hidden animate-scale-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#6F6769] hover:text-[#272326] bg-white/80 rounded-full hover:bg-white shadow-xs"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Left */}
          <div className="p-6 bg-[#FAF5F1] flex flex-col justify-between">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-[#E8DDDA]">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === img ? 'border-[#A65C70]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Right */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#A65C70] uppercase tracking-widest font-semibold">
                <span>{product.categoryName}</span>
                <span className="text-gray-400 font-normal">SKU: {selectedVariant.sku}</span>
              </div>

              <h2 className="font-editorial text-2xl font-medium text-[#272326]">
                {product.name}
              </h2>

              {/* Rating */}
              {product.rating !== undefined && product.rating > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center text-[#C7A26A]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.round(product.rating || 0)
                            ? 'fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-[#272326]">{product.rating}</span>
                  <span className="text-[#6F6769]">({product.reviewCount} verified reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-1">
                {product.salePrice ? (
                  <>
                    <span className="text-2xl font-editorial font-semibold text-[#7D4052]">
                      ${product.salePrice}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ${product.price}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#A65C70] text-white text-[10px] font-bold">
                      SAVE {product.discountPercentage}%
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-editorial font-semibold text-[#272326]">
                    ${product.price}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#6F6769] leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Variant Selector: Size */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#272326]">Select Size:</span>
                  <span className="text-[11px] text-[#A65C70]">
                    {isOutOfStock ? (
                      <span className="text-red-500 font-medium">Out of Stock</span>
                    ) : isLowStock ? (
                      <span className="text-amber-600 font-medium">Only {selectedVariant.stock} items available</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">In Stock</span>
                    )}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      className={`min-w-[42px] px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selectedVariant.id === v.id
                          ? 'border-[#7D4052] bg-[#7D4052] text-white'
                          : v.stock > 0
                          ? 'border-[#E8DDDA] text-[#272326] hover:border-[#A65C70] bg-[#FAF5F1]/30'
                          : 'border-[#E8DDDA] text-gray-300 line-through opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color indicator */}
              <div className="text-xs text-[#6F6769]">
                Color: <strong className="text-[#272326]">{selectedVariant.color}</strong>
              </div>
            </div>

            {/* Actions & Quantity */}
            <div className="space-y-3 pt-3 border-t border-[#E8DDDA]">
              <div className="flex items-center gap-3">
                {/* Stepper */}
                <div className="flex items-center border border-[#E8DDDA] rounded-xl overflow-hidden bg-[#FAF5F1]/50">
                  <button
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2.5 hover:bg-[#FAF5F1] text-[#272326] disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-semibold px-4 min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= selectedVariant.stock || isOutOfStock}
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-2.5 hover:bg-[#FAF5F1] text-[#272326] disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-6 rounded-xl bg-[#7D4052] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#A65C70] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#7D4052]/20 disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                </button>
              </div>

              <button
                onClick={handleViewFullDetails}
                className="w-full text-center text-xs font-medium text-[#7D4052] hover:underline flex items-center justify-center gap-1 pt-1"
              >
                <span>View Full Garment Specifications & Size Guide</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
