import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { Order } from '../types';
import { 
  CheckCircle2, PackageCheck, Printer, ArrowRight, 
  MapPin, CreditCard, Sparkles 
} from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { queryParams, navigate } = useNavigation();
  const orderNumber = queryParams.orderNumber;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${orderNumber}`)
      .then(res => res.json())
      .then(data => {
        if (data.order) setOrder(data.order);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#A65C70] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#6F6769]">Retrieving your invoice...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-editorial text-3xl font-medium text-[#272326]">Order Confirmation</h2>
        <p className="text-xs text-[#6F6769]">Thank you for your purchase. Please check your email for the order confirmation and tracking link.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 print:p-0">
      {/* Success Badge & Header */}
      <div className="text-center space-y-3 print:hidden">
        <div className="w-16 h-16 rounded-full bg-[#FAF5F1] text-[#7D4052] flex items-center justify-center mx-auto shadow-inner border border-[#E8DDDA]">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-semibold text-[#A65C70] uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#C7A26A]" />
          Order Placed & Confirmed
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl text-[#272326] font-medium">
          Thank you for choosing COMFORT
        </h1>
        <p className="text-xs text-[#6F6769] max-w-md mx-auto">
          We have received your order and allocated your handcrafted garments. A confirmation copy has been sent to <strong>{order.customerEmail}</strong>.
        </p>
      </div>

      {/* Invoice Card */}
      <div className="bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] p-6 sm:p-10 shadow-xs space-y-8">
        {/* Top Invoice Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DDDA]">
          <div>
            <div className="text-xs text-[#6F6769] uppercase tracking-wider">Order Reference</div>
            <div className="font-editorial text-2xl font-bold text-[#7D4052] tracking-wider mt-0.5">
              {order.orderNumber}
            </div>
            <div className="text-[11px] text-[#6F6769] mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl border border-[#E8DDDA] text-xs font-semibold text-[#272326] hover:bg-[#FAF5F1] transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-[#6F6769]" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={() => navigate(`/track-order`, { orderNumber: order.orderNumber, email: order.customerEmail })}
              className="px-4 py-2 rounded-xl bg-[#7D4052] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#A65C70] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Live Order Tracking</span>
            </button>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-[#FAF5F1]/60 border border-[#E8DDDA] space-y-1.5">
            <div className="font-semibold text-[#7D4052] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Shipping Address</span>
            </div>
            <div className="font-medium text-[#272326]">{order.shippingAddress.fullName}</div>
            <div className="text-[#6F6769]">{order.shippingAddress.addressLine}</div>
            <div className="text-[#6F6769]">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </div>
            <div className="text-[#6F6769]">{order.shippingAddress.country}</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF5F1]/60 border border-[#E8DDDA] space-y-1.5">
            <div className="font-semibold text-[#7D4052] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment & Dispatch</span>
            </div>
            <div className="text-[#272326]">
              Payment Method: <strong>{order.paymentMethod}</strong>
            </div>
            <div className="text-[#272326]">
              Payment Status:{' '}
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {order.paymentStatus}
              </span>
            </div>
            <div className="text-[#6F6769]">
              Delivery Tier: {order.deliveryMethod}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[#272326]">
            Items In This Order
          </h3>
          <div className="divide-y divide-[#FAF5F1] border-t border-b border-[#E8DDDA]">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-14 h-18 object-cover rounded-xl border border-[#E8DDDA]"
                  />
                  <div>
                    <h4 className="font-semibold text-[#272326]">{item.productName}</h4>
                    <p className="text-[11px] text-[#6F6769] mt-0.5">
                      Size: {item.size} • Color: {item.color} • SKU: {item.sku}
                    </p>
                    <p className="text-[11px] text-[#6F6769]">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="font-semibold text-[#272326]">
                  ${item.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="max-w-xs ml-auto space-y-2 text-xs text-[#6F6769]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-[#272326]">${order.subtotal.toFixed(2)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-[#7D4052]">
              <span>Coupon Discount ({order.couponCode})</span>
              <span>-${order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-medium text-[#272326]">
              {order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax (5%)</span>
            <span className="font-medium text-[#272326]">${order.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-[#272326] pt-3 border-t border-[#E8DDDA]">
            <span>Total Paid</span>
            <span className="text-[#7D4052] font-editorial text-2xl font-semibold">
              ${order.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="text-center print:hidden">
        <button
          onClick={() => navigate('/shop')}
          className="text-xs font-semibold text-[#7D4052] hover:underline flex items-center justify-center gap-1 mx-auto"
        >
          <span>Continue Shopping More Garments</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
