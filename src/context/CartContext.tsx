import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types';

interface AppliedCoupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'comfort_cart_v1';
const FREE_SHIPPING_THRESHOLD = 50;
const STANDARD_SHIPPING_FEE = 10;
const TAX_RATE = 0.05;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    if (variant.stock <= 0) {
      return { success: false, message: 'This variant is currently out of stock.' };
    }

    const existingIndex = cart.findIndex(item => item.variantId === variant.id);
    const existingQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const targetQty = existingQty + quantity;

    if (targetQty > variant.stock) {
      return { 
        success: false, 
        message: `Only ${variant.stock} item(s) available in stock for ${variant.size} / ${variant.color}.` 
      };
    }

    const unitPrice = variant.salePrice || variant.price || product.salePrice || product.price;

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity = targetQty;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        id: `cart_${Date.now()}_${variant.id}`,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.images[0] || '',
        variantId: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        price: product.price,
        salePrice: unitPrice < product.price ? unitPrice : undefined,
        quantity,
      };
      setCart(prev => [newItem, ...prev]);
    }

    setIsCartOpen(true);
    return { success: true };
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const subtotal = cart.reduce((sum, item) => {
    const p = item.salePrice || item.price;
    return sum + p * item.quantity;
  }, 0);

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number((taxableAmount * TAX_RATE).toFixed(2));
  const grandTotal = Number((taxableAmount + shippingFee + taxAmount).toFixed(2));

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid coupon code' };
      }
      setAppliedCoupon(data.coupon);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error validating coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        itemCount,
        subtotal: Number(subtotal.toFixed(2)),
        shippingFee,
        taxAmount,
        discountAmount: Number(discountAmount.toFixed(2)),
        grandTotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountToFreeShipping: Number(amountToFreeShipping.toFixed(2)),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
