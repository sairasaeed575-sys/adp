import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ShieldCheck, ArrowRight, Lock, CreditCard, 
  Truck, Check, AlertCircle, ShoppingBag, Banknote, Building2 
} from 'lucide-react';
import { Address, PaymentMethod } from '../types';

export const CheckoutPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { cart, subtotal, shippingFee, taxAmount, discountAmount, grandTotal, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  const [addressLine, setAddressLine] = useState(user?.addresses?.[0]?.addressLine || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || '');
  const [state, setState] = useState(user?.addresses?.[0]?.state || '');
  const [postalCode, setPostalCode] = useState(user?.addresses?.[0]?.postalCode || '');
  const [country, setCountry] = useState(user?.addresses?.[0]?.country || 'United States');
  const [notes, setNotes] = useState('');

  const [deliveryMethod, setDeliveryMethod] = useState<'Standard Delivery' | 'Express Delivery (2-3 Business Days)'>('Standard Delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Online Payment');

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FAF5F1] flex items-center justify-center text-[#A65C70] mx-auto">
          <ShoppingBag className="w-8 h-8 opacity-60" />
        </div>
        <h2 className="font-editorial text-2xl font-medium text-[#272326]">Your shopping bag is empty</h2>
        <p className="text-xs text-[#6F6769]">Add your desired garments before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  const handleSelectSavedAddress = (addr: Address) => {
    setAddressLine(addr.addressLine);
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName || !customerEmail || !addressLine || !city || !state || !postalCode) {
      setErrorMessage('Please complete all required shipping address fields.');
      return;
    }

    setLoading(true);

    const payload = {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress: {
        id: `addr_${Date.now()}`,
        fullName: customerName,
        phone: customerPhone,
        addressLine,
        city,
        state,
        postalCode,
        country,
      },
      deliveryMethod,
      paymentMethod,
      couponCode: appliedCoupon?.code,
      notes,
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    try {
      const token = localStorage.getItem('comfort_auth_token');
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to place order.');
        showToast(data.error || 'Checkout failed', 'error');
        return;
      }

      showToast(`Order ${data.order.orderNumber} placed successfully!`, 'success');
      clearCart();
      navigate(`/order-success?orderNumber=${data.order.orderNumber}`);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Network error occurred during checkout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <span className="text-[11px] font-semibold text-[#A65C70] uppercase tracking-widest flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#C7A26A]" />
          Encrypted & Authenticated Checkout
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#272326]">
          Finalize Your Order
        </h1>
      </div>

      {errorMessage && (
        <div className="max-w-4xl mx-auto mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Contact, Shipping, Delivery, Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Contact Information */}
          <div className="p-6 sm:p-8 bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#272326] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#7D4052] text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Contact Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-[#272326]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Saira Saeed"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#272326]">Email Address *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="for order tracking & receipts"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#272326]">Phone Number (Courier SMS)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="p-6 sm:p-8 bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#272326] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#7D4052] text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Shipping Destination</span>
              </h2>

              {user?.addresses && user.addresses.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-[#A65C70]">
                  <span>Saved:</span>
                  <select
                    onChange={e => {
                      const addr = user.addresses.find(a => a.id === e.target.value);
                      if (addr) handleSelectSavedAddress(addr);
                    }}
                    className="text-xs py-1 px-2 border border-[#E8DDDA] rounded-lg bg-white"
                  >
                    <option value="">Select Address</option>
                    {user.addresses.map(a => (
                      <option key={a.id} value={a.id}>{a.city}, {a.addressLine}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#272326]">Street Address / Suite / Apartment *</label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={e => setAddressLine(e.target.value)}
                  placeholder="e.g. 742 Rosewood Crescent, Apt 4B"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#272326]">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Beverly Hills"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#272326]">State / Province *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={e => setState(e.target.value)}
                    placeholder="e.g. CA"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
                  />
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-[#272326]">Postal / Zip Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    placeholder="e.g. 90210"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#272326]">Country</label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#272326]">Delivery Instructions / Gift Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional delivery guidance (e.g. leave with concierge or ring bell)"
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
                />
              </div>
            </div>
          </div>

          {/* 3. Delivery Method */}
          <div className="p-6 sm:p-8 bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#272326] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#7D4052] text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Delivery Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setDeliveryMethod('Standard Delivery')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  deliveryMethod === 'Standard Delivery'
                    ? 'border-[#7D4052] bg-[#FAF5F1] shadow-xs'
                    : 'border-[#E8DDDA] hover:border-[#A65C70]'
                }`}
              >
                <Truck className="w-4 h-4 text-[#A65C70] mt-0.5 shrink-0" />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-[#272326]">Standard Delivery</div>
                  <div className="text-[11px] text-[#6F6769] mt-0.5">3-5 Business Days</div>
                  <div className="text-xs font-semibold text-[#7D4052] mt-1">
                    {subtotal >= 50 ? 'FREE (Orders > $50)' : '$10.00'}
                  </div>
                </div>
              </label>

              <label
                onClick={() => setDeliveryMethod('Express Delivery (2-3 Business Days)')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                  deliveryMethod === 'Express Delivery (2-3 Business Days)'
                    ? 'border-[#7D4052] bg-[#FAF5F1] shadow-xs'
                    : 'border-[#E8DDDA] hover:border-[#A65C70]'
                }`}
              >
                <Truck className="w-4 h-4 text-[#A65C70] mt-0.5 shrink-0" />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-[#272326]">Express Priority</div>
                  <div className="text-[11px] text-[#6F6769] mt-0.5">2-3 Business Days (Air Express)</div>
                  <div className="text-xs font-semibold text-[#7D4052] mt-1">$20.00</div>
                </div>
              </label>
            </div>
          </div>

          {/* 4. Payment Method */}
          <div className="p-6 sm:p-8 bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#272326] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#7D4052] text-white text-xs flex items-center justify-center font-bold">4</span>
              <span>Payment Selection</span>
            </h2>

            <div className="space-y-3">
              {/* Online Payment */}
              <label
                onClick={() => setPaymentMethod('Online Payment')}
                className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                  paymentMethod === 'Online Payment'
                    ? 'border-[#7D4052] bg-[#FAF5F1]'
                    : 'border-[#E8DDDA] hover:border-[#A65C70]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-[#A65C70]" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-[#272326]">Credit / Debit Card (Stripe Gateway)</span>
                    <span className="text-[11px] text-[#6F6769] block">Encrypted 256-bit SSL transaction</span>
                  </div>
                </div>
                {paymentMethod === 'Online Payment' && (
                  <div className="mt-3 pt-3 border-t border-[#E8DDDA] text-xs text-[#6F6769] space-y-2">
                    <div className="p-3 rounded-xl bg-white border border-[#E8DDDA] flex items-center justify-between text-[11px]">
                      <span>Card ending in <strong>•••• 4242</strong> (Test Mode Active)</span>
                      <span className="text-emerald-600 font-semibold">Ready</span>
                    </div>
                  </div>
                )}
              </label>

              {/* Cash on Delivery */}
              <label
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-[#7D4052] bg-[#FAF5F1]'
                    : 'border-[#E8DDDA] hover:border-[#A65C70]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="w-4 h-4 text-[#A65C70]" />
                  <div>
                    <span className="text-xs font-semibold text-[#272326]">Cash on Delivery (COD)</span>
                    <span className="text-[11px] text-[#6F6769] block">Pay cash to courier upon packet inspection at doorstep</span>
                  </div>
                </div>
              </label>

              {/* Bank Transfer */}
              <label
                onClick={() => setPaymentMethod('Bank Transfer')}
                className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                  paymentMethod === 'Bank Transfer'
                    ? 'border-[#7D4052] bg-[#FAF5F1]'
                    : 'border-[#E8DDDA] hover:border-[#A65C70]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-[#A65C70]" />
                  <div>
                    <span className="text-xs font-semibold text-[#272326]">Direct Bank Wire</span>
                    <span className="text-[11px] text-[#6F6769] block">Transfer directly to COMFORT Corporate Account</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 bg-[#FAF5F1] rounded-3xl border border-[#E8DDDA] shadow-xs space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DDDA]">
              <h3 className="font-editorial text-xl font-semibold text-[#272326]">Order Summary</h3>
              <span className="text-xs text-[#6F6769] font-medium">{cart.length} unique items</span>
            </div>

            {/* Items scroll */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1 divide-y divide-[#E8DDDA]/50">
              {cart.map(item => (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-16 h-20 object-cover rounded-xl border border-[#E8DDDA] shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-[#272326] truncate">{item.productName}</h4>
                      <p className="text-[11px] text-[#6F6769] mt-0.5">
                        Size: {item.size} • Color: {item.color}
                      </p>
                    </div>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-[#6F6769]">Qty: {item.quantity}</span>
                      <span className="font-semibold text-[#272326]">
                        ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon indicator */}
            {appliedCoupon && (
              <div className="p-3 rounded-xl bg-[#E9C8CC]/40 border border-[#A65C70]/30 text-xs flex justify-between items-center text-[#7D4052]">
                <span>Promotional Code ({appliedCoupon.code})</span>
                <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-2 text-xs text-[#6F6769] pt-4 border-t border-[#E8DDDA]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#272326] font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#7D4052]">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-[#272326] font-semibold">
                  {deliveryMethod === 'Express Delivery (2-3 Business Days)' ? '$20.00' : shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (5%)</span>
                <span className="text-[#272326] font-semibold">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#272326] pt-3 border-t border-[#E8DDDA]">
                <span>Total Due</span>
                <span className="text-[#7D4052] font-editorial text-2xl">
                  ${(
                    subtotal - discountAmount + 
                    (deliveryMethod === 'Express Delivery (2-3 Business Days)' ? 20 : shippingFee) + 
                    taxAmount
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#7D4052] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#A65C70] transition-colors flex items-center justify-center gap-2 shadow-xl shadow-[#7D4052]/25 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Validating Order & Allocating Stock...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-[#6F6769] text-center space-y-1">
              <p>By placing this order you agree to our 14-day return and exchange policy.</p>
              <p className="text-[10px] text-gray-400">Server automatically allocates real variant inventory.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
