import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { Order, OrderStatus } from '../../types';
import { 
  Search, Filter, PackageCheck, Printer, Truck, 
  RotateCcw, DollarSign, X, Check, MapPin, CreditCard, AlertCircle 
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { queryParams } = useNavigation();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status update form inside drawer
  const [newStatus, setNewStatus] = useState<OrderStatus>('Processing');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('DHL Express');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Refund modal
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('Customer Request / Fit Return');
  const [processingRefund, setProcessingRefund] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    const token = localStorage.getItem('comfort_auth_token');
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);

    fetch(`/api/admin/orders?${params.toString()}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(res => res.json())
      .then(data => {
        if (data.orders) {
          setOrders(data.orders);
          if (queryParams.orderId) {
            const found = data.orders.find((o: Order) => o.id === queryParams.orderId);
            if (found) setSelectedOrder(found);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdatingStatus(true);

    try {
      const token = localStorage.getItem('comfort_auth_token');
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote || `Status changed to ${newStatus}`,
          trackingNumber: trackingNumber || selectedOrder.trackingNumber,
          carrier: carrier || selectedOrder.carrier,
        }),
      });

      const data = await res.json();
      setUpdatingStatus(false);
      if (res.ok) {
        showToast(`Order ${selectedOrder.orderNumber} updated to ${newStatus}`, 'success');
        setSelectedOrder(data.order);
        setOrders(orders.map(o => (o.id === data.order.id ? data.order : o)));
        setStatusNote('');
      } else {
        showToast(data.error || 'Failed to update order', 'error');
      }
    } catch {
      setUpdatingStatus(false);
      showToast('Network error updating status', 'error');
    }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const amount = Number(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid refund amount', 'error');
      return;
    }

    setProcessingRefund(true);
    try {
      const token = localStorage.getItem('comfort_auth_token');
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount,
          reason: refundReason,
        }),
      });

      const data = await res.json();
      setProcessingRefund(false);
      if (res.ok) {
        showToast(`Refund of $${amount.toFixed(2)} processed for ${selectedOrder.orderNumber}`, 'success');
        setSelectedOrder(data.order);
        setOrders(orders.map(o => (o.id === data.order.id ? data.order : o)));
        setIsRefundOpen(false);
        setRefundAmount('');
      } else {
        showToast(data.error || 'Refund failed', 'error');
      }
    } catch {
      setProcessingRefund(false);
      showToast('Network error processing refund', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-[#272326]">
            Orders & Consignments
          </h1>
          <p className="text-xs text-[#6F6769] mt-0.5">
            Manage fulfillment, courier dispatch, AWB tracking numbers, and financial refunds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6F6769]">
            Total: <strong className="text-[#272326]">{orders.length}</strong> orders
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-[#E8DDDA] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6F6769] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order # or Customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-[#6F6769] font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl font-medium text-[#272326] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#E8DDDA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF5F1] text-[#7D4052] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Order Number</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Courier Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF5F1] font-medium text-[#272326]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6F6769]">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6F6769]">
                    No orders matching criteria.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-[#FAF5F1]/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#7D4052]">
                      {order.orderNumber}
                    </td>
                    <td className="p-4 text-[#6F6769]">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <span className="block text-[10px] text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">{order.customerName}</div>
                      <div className="text-[11px] text-[#6F6769] font-normal">{order.customerEmail}</div>
                    </td>
                    <td className="p-4 font-normal">
                      {order.items.length} item(s)
                    </td>
                    <td className="p-4 font-semibold text-sm">
                      ${order.grandTotal.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.paymentStatus === 'Refunded'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF5F1] text-[#272326] border border-[#E8DDDA]">
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.orderStatus);
                          setTrackingNumber(order.trackingNumber || '');
                          setCarrier(order.carrier || 'DHL Express');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#FAF5F1] text-[#7D4052] font-semibold hover:bg-[#E9C8CC]/40 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="w-full max-w-2xl bg-[#FFFDFC] h-full shadow-2xl flex flex-col p-6 sm:p-8 overflow-y-auto animate-slide-left space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DDDA]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A65C70]">
                  Consignment Inspector
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#7D4052]">
                  {selectedOrder.orderNumber}
                </h2>
                <div className="text-xs text-[#6F6769]">
                  Placed {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl border border-[#E8DDDA] hover:bg-[#FAF5F1] text-[#272326]"
                  title="Print Packing Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-[#6F6769] hover:text-[#272326]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF5F1] border border-[#E8DDDA] space-y-1">
                <div className="font-semibold text-[#7D4052] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Shipping Address</span>
                </div>
                <div className="font-medium text-[#272326]">{selectedOrder.shippingAddress.fullName}</div>
                <div className="text-[#6F6769]">{selectedOrder.shippingAddress.addressLine}</div>
                <div className="text-[#6F6769]">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                </div>
                <div className="text-[#6F6769]">{selectedOrder.shippingAddress.country}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF5F1] border border-[#E8DDDA] space-y-1">
                <div className="font-semibold text-[#7D4052] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Financial Status</span>
                </div>
                <div>Method: <strong>{selectedOrder.paymentMethod}</strong></div>
                <div>
                  Status:{' '}
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <div>Grand Total: <strong className="text-sm font-semibold">${selectedOrder.grandTotal.toFixed(2)}</strong></div>
                {selectedOrder.couponCode && (
                  <div className="text-[11px] text-[#A65C70]">Coupon applied: {selectedOrder.couponCode}</div>
                )}
              </div>
            </div>

            {/* Items in order */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#272326]">
                Garments Ordered
              </h3>
              <div className="space-y-2 divide-y divide-[#FAF5F1]">
                {selectedOrder.items.map((it, i) => (
                  <div key={i} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.productImage}
                        alt={it.productName}
                        className="w-12 h-16 object-cover rounded-xl border border-[#E8DDDA]"
                      />
                      <div>
                        <div className="font-semibold text-[#272326]">{it.productName}</div>
                        <div className="text-[11px] text-[#6F6769]">Size: {it.size} • Color: {it.color} • SKU: {it.sku}</div>
                        <div className="text-[11px] text-[#6F6769]">Qty: {it.quantity} × ${it.price}</div>
                      </div>
                    </div>
                    <div className="font-semibold text-[#272326]">
                      ${it.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Update Status Section */}
            <form onSubmit={handleUpdateStatus} className="p-5 rounded-2xl bg-[#FAF5F1] border border-[#E8DDDA] space-y-3 text-xs">
              <h3 className="font-semibold text-[#7D4052] uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Update Fulfillment & Tracking</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#272326]">Fulfillment Status</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#E8DDDA] rounded-xl font-medium"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#272326]">Courier Partner</label>
                  <select
                    value={carrier}
                    onChange={e => setCarrier(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#E8DDDA] rounded-xl font-medium"
                  >
                    <option value="DHL Express">DHL Express</option>
                    <option value="FedEx International">FedEx International</option>
                    <option value="UPS Worldwide">UPS Worldwide</option>
                    <option value="TCS Express">TCS Express</option>
                    <option value="Local Courier Dispatch">Local Courier Dispatch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#272326]">Tracking Number / AWB Consignment Code</label>
                <input
                  type="text"
                  placeholder="e.g. TRK-983411"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-[#E8DDDA] rounded-xl font-mono text-xs uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-[#272326]">Staff Status Note (Visible in Courier Timeline)</label>
                <input
                  type="text"
                  placeholder="e.g. Inspected, pressed, and handed to DHL courier."
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-[#E8DDDA] rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2.5 rounded-xl bg-[#7D4052] text-white font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors disabled:opacity-50"
                >
                  {updatingStatus ? 'Updating...' : 'Save & Broadcast Status'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsRefundOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-50 text-red-700 font-semibold border border-red-200 hover:bg-red-100 transition-colors ml-auto flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refund Order</span>
                </button>
              </div>
            </form>

            {/* Timeline history */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#272326]">
                Timeline Event Trail
              </h3>
              <div className="space-y-2 text-xs">
                {selectedOrder.statusHistory?.map((ev, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#FAF5F1]/50 border border-[#E8DDDA] flex justify-between">
                    <div>
                      <strong className="text-[#7D4052]">{ev.status}</strong>
                      <div className="text-[#6F6769] text-[11px] mt-0.5">{ev.note}</div>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(ev.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {isRefundOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleProcessRefund} className="w-full max-w-md bg-[#FFFDFC] rounded-3xl p-6 sm:p-8 border border-[#E8DDDA] shadow-2xl space-y-4 animate-scale-up text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#E8DDDA]">
              <h3 className="font-editorial text-xl font-bold text-red-700">
                Process Order Refund
              </h3>
              <button type="button" onClick={() => setIsRefundOpen(false)}>
                <X className="w-5 h-5 text-[#6F6769]" />
              </button>
            </div>

            <p className="text-[#6F6769]">
              Issue financial refund for order <strong>{selectedOrder.orderNumber}</strong>. Max refundable: ${selectedOrder.grandTotal.toFixed(2)}.
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-[#272326]">Refund Amount ($)</label>
              <input
                type="number"
                step="0.01"
                max={selectedOrder.grandTotal}
                required
                placeholder={selectedOrder.grandTotal.toFixed(2)}
                value={refundAmount}
                onChange={e => setRefundAmount(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF5F1] border border-[#E8DDDA] rounded-xl font-semibold text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#272326]">Reason for Refund</label>
              <select
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF5F1] border border-[#E8DDDA] rounded-xl"
              >
                <option value="Customer Return Approved">Customer Return Approved</option>
                <option value="Item Out of Stock / Unfulfilled">Item Out of Stock / Unfulfilled</option>
                <option value="Damaged in Courier Transit">Damaged in Courier Transit</option>
                <option value="Goodwill Customer Service Credit">Goodwill Customer Service Credit</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={processingRefund}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50"
              >
                {processingRefund ? 'Processing...' : 'Authorize Refund'}
              </button>
              <button
                type="button"
                onClick={() => setIsRefundOpen(false)}
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
