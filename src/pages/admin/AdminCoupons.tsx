import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Coupon } from '../../types';
import { Tag, Plus, Check, X, Trash2 } from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('15');
  const [minimumOrder, setMinimumOrder] = useState('50');
  const [maxDiscount, setMaxDiscount] = useState('50');
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = () => {
    setLoading(true);
    const token = localStorage.getItem('comfort_auth_token');
    fetch('/api/admin/coupons', {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(res => res.json())
      .then(data => {
        if (data.coupons) setCoupons(data.coupons);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('comfort_auth_token');

    const payload = {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minimumOrder: Number(minimumOrder) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    };

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok) {
        showToast(`Coupon ${data.coupon.code} created!`, 'success');
        setIsModalOpen(false);
        setCode('');
        setDescription('');
        fetchCoupons();
      } else {
        showToast(data.error || 'Failed to create coupon', 'error');
      }
    } catch {
      setSubmitting(false);
      showToast('Network error saving coupon', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-[#272326]">
            Marketing & Discount Codes
          </h1>
          <p className="text-xs text-[#6F6769] mt-0.5">
            Configure percentage and fixed price promotional codes with spend thresholds.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Promo Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-[#E8DDDA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF5F1] text-[#7D4052] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Benefit</th>
                <th className="p-4">Min Spend</th>
                <th className="p-4">Redemptions</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF5F1] font-medium text-[#272326]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#6F6769]">Loading coupons...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#6F6769]">No promotional codes active.</td>
                </tr>
              ) : (
                coupons.map(c => (
                  <tr key={c.id} className="hover:bg-[#FAF5F1]/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-sm text-[#7D4052]">
                      {c.code}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                      </div>
                      <div className="text-[11px] text-[#6F6769]">{c.description}</div>
                    </td>
                    <td className="p-4">
                      ${c.minimumOrder}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-[#272326]">{c.usageCount}</span> redeemed
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateCoupon} className="w-full max-w-md bg-[#FFFDFC] rounded-3xl p-6 sm:p-8 border border-[#E8DDDA] shadow-2xl space-y-4 text-xs animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-[#E8DDDA]">
              <h3 className="font-editorial text-xl font-bold text-[#272326]">Create Promotional Coupon</h3>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-[#6F6769]" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#272326]">Promo Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. SUMMER25"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF5F1] border border-[#E8DDDA] rounded-xl font-mono uppercase text-sm font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#272326]">Description</label>
              <input
                type="text"
                placeholder="e.g. 25% discount on orders over $80"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF5F1] border border-[#E8DDDA] rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-[#272326]">Discount Type</label>
                <select
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#FAF5F1] border border-[#E8DDDA] rounded-xl"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Dollar ($)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#272326]">Value ({discountType === 'percentage' ? '%' : '$'})</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={discountValue}
                  onChange={e => setDiscountValue(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF5F1] border border-[#E8DDDA] rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-[#272326]">Min Order Spend ($)</label>
                <input
                  type="number"
                  value={minimumOrder}
                  onChange={e => setMinimumOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF5F1] border border-[#E8DDDA] rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#272326]">Max Discount Cap ($)</label>
                <input
                  type="number"
                  value={maxDiscount}
                  onChange={e => setMaxDiscount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF5F1] border border-[#E8DDDA] rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-[#7D4052] text-white font-semibold uppercase tracking-wider disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Activate Coupon'}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-3 rounded-xl border border-[#E8DDDA] text-[#6F6769]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
