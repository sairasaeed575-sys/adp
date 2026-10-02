import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { InventoryMovement } from '../../types';
import { 
  Layers, Search, Plus, Minus, Download, 
  RotateCcw, History, AlertTriangle, CheckCircle2, X 
} from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState<any[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Adjustment Modal
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState('5');
  const [changeType, setChangeType] = useState<InventoryMovement['changeType']>('stock_in');
  const [adjustReason, setAdjustReason] = useState('New Production Batch Received');
  const [adjustReference, setAdjustReference] = useState('PO-2026-003');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = () => {
    setLoading(true);
    const token = localStorage.getItem('comfort_auth_token');
    fetch('/api/admin/inventory', {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(res => res.json())
      .then(data => {
        if (data.inventory) setInventory(data.inventory);
        if (data.movements) setMovements(data.movements);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    let qty = Number(adjustQuantity);
    if (isNaN(qty) || qty <= 0) {
      showToast('Please enter a positive quantity', 'error');
      return;
    }

    if (changeType === 'stock_out' || changeType === 'damage') {
      qty = -qty;
    }

    setSubmitting(true);
    const token = localStorage.getItem('comfort_auth_token');
    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          variantId: selectedVariant.variantId,
          change: qty,
          reason: adjustReason,
          changeType,
          reference: adjustReference,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok) {
        showToast(`Stock updated: ${selectedVariant.sku} is now ${data.newStock}`, 'success');
        setSelectedVariant(null);
        fetchInventory();
      } else {
        showToast(data.error || 'Adjustment failed', 'error');
      }
    } catch {
      setSubmitting(false);
      showToast('Network error during inventory adjustment', 'error');
    }
  };

  const filtered = inventory.filter(item => 
    item.productName.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.color.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-[#272326]">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-[#6F6769] mt-0.5">
            Manage variant stock levels, inward batches, and inspect complete audit trail logs.
          </p>
        </div>

        <button
          onClick={() => window.location.href = '/api/admin/export/inventory'}
          className="px-3.5 py-2 rounded-xl bg-white border border-[#E8DDDA] text-xs font-semibold text-[#272326] hover:bg-[#FAF5F1] transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-[#6F6769]" />
          <span>Export Stock CSV</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-2xl border border-[#E8DDDA] flex items-center gap-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6F6769] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, product name, or color..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
          />
        </div>
      </div>

      {/* Variant Inventory Table */}
      <div className="bg-white rounded-3xl border border-[#E8DDDA] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#FAF5F1] flex justify-between items-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#272326]">
            SKU Variant Inventory Matrix ({filtered.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF5F1] text-[#7D4052] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">SKU Code</th>
                <th className="p-4">Garment</th>
                <th className="p-4">Size</th>
                <th className="p-4">Color</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock on Hand</th>
                <th className="p-4 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF5F1] font-medium text-[#272326]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#6F6769]">Loading inventory...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#6F6769]">No variants found.</td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF5F1]/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#7D4052]">
                      {item.sku}
                    </td>
                    <td className="p-4 font-semibold">
                      {item.productName}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF5F1] border border-[#E8DDDA] font-bold">
                        {item.size}
                      </span>
                    </td>
                    <td className="p-4 text-[#6F6769]">
                      {item.color}
                    </td>
                    <td className="p-4">
                      ${item.salePrice || item.price}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.stock === 0
                          ? 'bg-red-100 text-red-800'
                          : item.stock <= 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.stock} Available
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedVariant(item);
                          setAdjustQuantity('5');
                          setChangeType('stock_in');
                          setAdjustReason('Production Batch Inward');
                          setAdjustReference('PO-2026-002');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#7D4052] text-white text-xs font-semibold hover:bg-[#A65C70] transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement History Trail */}
      <div className="bg-white rounded-3xl border border-[#E8DDDA] p-6 space-y-4 shadow-xs">
        <h3 className="font-editorial text-xl font-medium text-[#272326] flex items-center gap-2">
          <History className="w-5 h-5 text-[#A65C70]" />
          <span>Inventory Movement Audit Trail (Last 50 Events)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF5F1] text-[#7D4052] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Type</th>
                <th className="p-3">Change</th>
                <th className="p-3">Balance</th>
                <th className="p-3">Reason & Reference</th>
                <th className="p-3">Staff / Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF5F1] font-medium text-[#272326]">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-[#FAF5F1]/30">
                  <td className="p-3 text-[#6F6769]">
                    {new Date(m.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-mono font-bold text-[#7D4052]">
                    {m.sku}
                  </td>
                  <td className="p-3 capitalize font-semibold">
                    {m.changeType.replace('_', ' ')}
                  </td>
                  <td className="p-3">
                    <span className={m.quantityChange > 0 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                      {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                    </span>
                  </td>
                  <td className="p-3 text-[#6F6769]">
                    {m.previousQuantity} → <strong className="text-[#272326]">{m.newQuantity}</strong>
                  </td>
                  <td className="p-3">
                    <div>{m.reason}</div>
                    {m.reference && <div className="text-[10px] text-gray-400 font-mono">Ref: {m.reference}</div>}
                  </td>
                  <td className="p-3 text-[#6F6769]">
                    {m.user}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAdjustStock}
            className="w-full max-w-md bg-[#FFFDFC] rounded-3xl p-6 sm:p-8 border border-[#E8DDDA] shadow-2xl space-y-4 animate-scale-up text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#E8DDDA]">
              <div>
                <span className="text-[10px] font-bold text-[#A65C70] uppercase">Stock Inward / Outward</span>
                <h3 className="font-editorial text-xl font-bold text-[#272326]">
                  {selectedVariant.sku}
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedVariant(null)}>
                <X className="w-5 h-5 text-[#6F6769]" />
              </button>
            </div>

            <p className="text-[#6F6769]">
              Product: <strong>{selectedVariant.productName}</strong> (Size {selectedVariant.size} • {selectedVariant.color})<br />
              Current Available Stock: <strong>{selectedVariant.stock} units</strong>
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-[#272326]">Adjustment Type</label>
              <select
                value={changeType}
                onChange={e => setChangeType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAF5F1] border border-[#E8DDDA] rounded-xl font-semibold"
              >
                <option value="stock_in">Stock In (Batch Inward / Restock)</option>
                <option value="stock_out">Stock Out (Manual Adjustment)</option>
                <option value="damage">Damage / Flaw Write-off</option>
                <option value="adjustment">Stock Count Reconciliation</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#272326]">Units to Adjust</label>
              <input
                type="number"
                min="1"
                required
                value={adjustQuantity}
                onChange={e => setAdjustQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF5F1] border border-[#E8DDDA] rounded-xl font-bold text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#272326]">Reason</label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                placeholder="e.g. Received new spring consignment"
                className="w-full px-3 py-2 bg-[#FAF5F1] border border-[#E8DDDA] rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#272326]">Batch / PO Reference</label>
              <input
                type="text"
                value={adjustReference}
                onChange={e => setAdjustReference(e.target.value)}
                placeholder="e.g. PO-2026-004"
                className="w-full px-3 py-2 bg-[#FAF5F1] border border-[#E8DDDA] rounded-xl font-mono text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-[#7D4052] text-white font-semibold uppercase tracking-wider hover:bg-[#A65C70] disabled:opacity-50"
              >
                {submitting ? 'Applying Adjustment...' : 'Confirm Stock Adjustment'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedVariant(null)}
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
