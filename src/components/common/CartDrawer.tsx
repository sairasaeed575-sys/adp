import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { 
  X, ShoppingBag, Plus, Minus, Trash2, Tag, 
  ArrowRight, ShieldCheck, Check, Sparkles 
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    shippingFee, 
    discountAmount, 
    grandTotal, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon,
    amountToFreeShipping,
    freeShippingThreshold
  } = useCart();

  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const res = await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    if (res.success) {
      showToast(`Coupon code "${couponCode.toUpperCase()}" applied successfully!`, 'success');
      setCouponCode('');
    } else {
      showToast(res.error || 'Failed to apply coupon', 'error');
    }
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const freeShippingProgress = Math.min(100, ((freeShippingThreshold - amountToFreeShipping) / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#FFFDFC] h-full shadow-2xl flex flex-col border-l border-[#E8DDDA] animate-slide-left relative"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E8DDDA] flex items-center justify-between bg-[#FAF5F1]/50">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#A65C70]" />
            <h2 className="font-editorial text-xl font-semibold text-[#272326]">Your Shopping Bag</h2>
            <span className="text-xs bg-[#E9C8CC]/60 text-[#7D4052] font-semibold px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-[#6F6769] hover:text-[#272326] rounded-full hover:bg-white transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-6 py-3 bg-[#FAF5F1] border-b border-[#E8DDDA]">
          {amountToFreeShipping > 0 ? (
            <div className="space-y-1.5">
              <div className="text-xs text-[#6F6769] flex items-center justify-between">
                <span>Add <strong className="text-[#A65C70]">${amountToFreeShipping.toFixed(2)}</strong> for Free Shipping</span>
                <span className="text-[10px] text-[#A65C70] font-semibold">{Math.round(freeShippingProgress)}%</span>
              </div>
              <div className="w-full bg-[#E8DDDA] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#A65C70] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#7D4052]">
              <Sparkles className="w-4 h-4 text-[#C7A26A]" />
              <span>You have unlocked Complimentary Express Shipping!</span>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-[#FAF5F1]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF5F1] flex items-center justify-center text-[#A65C70]">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-medium text-[#272326]">Your bag is currently empty</h3>
                <p className="text-xs text-[#6F6769] max-w-xs mt-1">
                  Discover refined artisanal lawn suits, embroidered ensembles, and luxury daywear.
                </p>
              </div>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/shop');
                }}
                className="px-6 py-2.5 rounded-xl bg-[#7D4052] text-white text-xs font-medium tracking-wider uppercase hover:bg-[#A65C70] transition-colors"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-20 h-24 object-cover rounded-xl border border-[#E8DDDA] shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 
                        onClick={() => {
                          closeCart();
                          navigate(`/product/${item.productSlug}`);
                        }}
                        className="text-xs font-semibold text-[#272326] truncate hover:text-[#A65C70] cursor-pointer"
                      >
                        {item.productName}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-[#6F6769] mt-0.5">
                      Size: <span className="font-medium text-[#272326]">{item.size}</span> • Color: <span className="font-medium text-[#272326]">{item.color}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-[#E8DDDA] rounded-lg overflow-hidden bg-[#FAF5F1]/40">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-[#FAF5F1] text-[#272326] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold px-3 py-1 min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-[#FAF5F1] text-[#272326] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      {item.salePrice ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#7D4052]">
                            ${(item.salePrice * item.quantity).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-gray-400 line-through">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-[#272326]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-[#E8DDDA] bg-[#FAF5F1]/30 space-y-4">
            {/* Coupon Code Section */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-[#E9C8CC]/30 border border-[#A65C70]/30 px-3 py-2 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 text-[#7D4052]">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-${discountAmount.toFixed(2)})</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promotional code (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-white rounded-xl border border-[#E8DDDA] focus:outline-none focus:border-[#A65C70] uppercase tracking-wider"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2 bg-[#272326] text-white rounded-xl text-xs font-medium hover:bg-[#7D4052] transition-colors disabled:opacity-50"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </form>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-[#6F6769] pt-2 border-t border-[#E8DDDA]/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#272326] font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#7D4052]">
                  <span>Promotional Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-[#272326] font-medium">
                  {shippingFee === 0 ? <strong className="text-[#7D4052]">FREE</strong> : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (5%)</span>
                <span className="text-[#272326] font-medium">${((Math.max(0, subtotal - discountAmount) * 0.05)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#272326] pt-2 border-t border-[#E8DDDA]">
                <span>Total</span>
                <span className="text-[#7D4052] text-base font-editorial">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 px-6 rounded-xl bg-[#7D4052] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#A65C70] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#7D4052]/20"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#6F6769] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C7A26A]" />
                <span>100% Encrypted & Authenticated Checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
