import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { OrderTimelineEvent } from '../types';
import { 
  PackageCheck, Search, Truck, Clock, CheckCircle2, 
  MapPin, AlertCircle, ArrowRight, ShieldCheck, Box 
} from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const { queryParams } = useNavigation();
  const [orderNumberInput, setOrderNumberInput] = useState(queryParams.orderNumber || '');
  const [emailInput, setEmailInput] = useState(queryParams.email || '');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = (orderNum: string, email?: string) => {
    if (!orderNum.trim()) return;
    setLoading(true);
    setError('');
    const q = email ? `?email=${encodeURIComponent(email.trim())}` : '';
    fetch(`/api/orders/track/${encodeURIComponent(orderNum.trim())}${q}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.error) {
          setError(data.error);
          setOrderData(null);
        } else {
          setOrderData(data);
        }
      })
      .catch(err => {
        setLoading(false);
        setError('Network error searching for order');
      });
  };

  useEffect(() => {
    if (queryParams.orderNumber) {
      fetchTracking(queryParams.orderNumber, queryParams.email);
    }
  }, [queryParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderNumberInput, emailInput);
  };

  const steps = [
    'Pending',
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const currentStepIndex = orderData ? steps.indexOf(orderData.orderStatus) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[11px] font-semibold text-[#A65C70] uppercase tracking-widest flex items-center justify-center gap-1.5">
          <PackageCheck className="w-4 h-4 text-[#C7A26A]" />
          Real-Time Courier Tracking
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#272326]">
          Track Your Garments
        </h1>
        <p className="text-xs text-[#6F6769]">
          Enter your order reference number (e.g. COM-2026-000101) to trace dispatch, customs, and delivery timeline.
        </p>
      </div>

      {/* Tracking Search Card */}
      <form onSubmit={handleSearch} className="p-6 sm:p-8 bg-[#FAF5F1] rounded-3xl border border-[#E8DDDA] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#272326]">Order Reference Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. COM-2026-000101"
              value={orderNumberInput}
              onChange={e => setOrderNumberInput(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8DDDA] text-xs uppercase tracking-wider focus:outline-none focus:border-[#A65C70]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#272326]">Account Email (Optional)</label>
            <input
              type="email"
              placeholder="e.g. sairasaeed575@gmail.com"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8DDDA] text-xs focus:outline-none focus:border-[#A65C70]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-[#6F6769] flex items-center gap-1">
            <span>Try sample order:</span>
            <button
              type="button"
              onClick={() => {
                setOrderNumberInput('COM-2026-000101');
                setEmailInput('sairasaeed575@gmail.com');
                fetchTracking('COM-2026-000101', 'sairasaeed575@gmail.com');
              }}
              className="text-[#7D4052] font-semibold hover:underline"
            >
              COM-2026-000101
            </button>
            <span>or</span>
            <button
              type="button"
              onClick={() => {
                setOrderNumberInput('COM-2026-000102');
                fetchTracking('COM-2026-000102');
              }}
              className="text-[#7D4052] font-semibold hover:underline"
            >
              COM-2026-000102
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{loading ? 'Searching...' : 'Track Package'}</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Result View */}
      {orderData && (
        <div className="bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] p-6 sm:p-10 shadow-xs space-y-8 animate-fade-in">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DDDA]">
            <div>
              <span className="text-[10px] text-[#A65C70] uppercase font-bold tracking-widest">
                Active Consignment
              </span>
              <h2 className="font-editorial text-2xl font-bold text-[#272326]">
                {orderData.orderNumber}
              </h2>
              <p className="text-xs text-[#6F6769] mt-0.5">
                Destination: {orderData.shippingCity}, {orderData.shippingCountry}
              </p>
            </div>

            <div className="text-right sm:text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                orderData.orderStatus === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-[#FAF5F1] text-[#7D4052] border border-[#E8DDDA]'
              }`}>
                Current Status: {orderData.orderStatus}
              </span>
              {orderData.carrier && (
                <div className="text-xs text-[#6F6769] mt-1">
                  Carrier: <strong>{orderData.carrier}</strong>
                  {orderData.trackingNumber && ` (AWB: ${orderData.trackingNumber})`}
                </div>
              )}
            </div>
          </div>

          {/* Stepper Visualization */}
          <div className="py-4">
            <div className="relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-[#FAF5F1] -translate-y-1/2 z-0">
                <div
                  className="h-full bg-[#A65C70] transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 relative z-10">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step} className="flex flex-col items-center text-center space-y-2">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          isCurrent
                            ? 'bg-[#7D4052] text-white ring-4 ring-[#E9C8CC]'
                            : isCompleted
                            ? 'bg-[#A65C70] text-white'
                            : 'bg-white border border-[#E8DDDA] text-gray-300'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-[11px] font-medium leading-tight ${
                        isCurrent ? 'text-[#7D4052] font-bold' : isCompleted ? 'text-[#272326]' : 'text-gray-400'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Event History Logs */}
          <div className="space-y-4 pt-6 border-t border-[#E8DDDA]">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#272326]">
              Detailed Courier Timeline
            </h3>

            <div className="space-y-4">
              {orderData.statusHistory?.map((ev: OrderTimelineEvent, i: number) => (
                <div key={i} className="flex gap-4 items-start text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#A65C70] mt-1 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#272326] font-semibold">{ev.status}</strong>
                      <span className="text-[#6F6769] text-[11px]">
                        {new Date(ev.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[#6F6769]">{ev.note}</p>
                    {ev.location && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ev.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items in Package */}
          {orderData.items && orderData.items.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-[#E8DDDA]">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#272326]">
                Package Contents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {orderData.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF5F1]/50 border border-[#E8DDDA]">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-15 object-cover rounded-xl border border-[#E8DDDA]"
                    />
                    <div className="text-xs">
                      <h4 className="font-semibold text-[#272326]">{item.productName}</h4>
                      <p className="text-[11px] text-[#6F6769]">Size: {item.size} • Color: {item.color}</p>
                      <p className="text-[11px] text-[#7D4052] font-medium">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
