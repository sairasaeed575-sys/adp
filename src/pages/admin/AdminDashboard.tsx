import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { 
  DollarSign, ShoppingBag, Users, AlertTriangle, 
  TrendingUp, Download, Plus, ArrowRight, PackageCheck, 
  Star, Layers, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { Order } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { navigate } = useNavigation();
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('comfort_auth_token');
    fetch('/api/admin/dashboard', {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleExportCSV = (type: string) => {
    const token = localStorage.getItem('comfort_auth_token');
    window.location.href = `/api/admin/export/${type}`;
    showToast(`Downloading ${type} CSV report...`, 'info');
  };

  if (loading || !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#A65C70] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#6F6769]">Compiling administrative analytics...</p>
      </div>
    );
  }

  const { metrics, recentOrders, lowStockVariants } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-[#272326]">
            Store Performance Overview
          </h1>
          <p className="text-xs text-[#6F6769] mt-0.5">
            Real-time financial metrics, inventory movements, and customer order flow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExportCSV('orders')}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E8DDDA] text-xs font-semibold text-[#272326] hover:bg-[#FAF5F1] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#6F6769]" />
            <span>Export Orders CSV</span>
          </button>

          <button
            onClick={() => navigate('/admin/products')}
            className="px-3.5 py-2 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Garment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Gross Revenue */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8DDDA] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#6F6769]">
            <span className="text-xs font-medium uppercase tracking-wider">Gross Sales</span>
            <div className="p-2 rounded-xl bg-[#FAF5F1] text-[#7D4052]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-3xl font-semibold text-[#272326]">
            ${metrics.totalGrossSales.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>${metrics.netRevenue.toLocaleString()} Net Captured</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8DDDA] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#6F6769]">
            <span className="text-xs font-medium uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-[#FAF5F1] text-[#7D4052]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-3xl font-semibold text-[#272326]">
            {metrics.totalOrders}
          </div>
          <div className="text-[11px] text-[#6F6769]">
            Average Order Value: <strong className="text-[#272326]">${metrics.averageOrderValue}</strong>
          </div>
        </div>

        {/* Customers */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8DDDA] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#6F6769]">
            <span className="text-xs font-medium uppercase tracking-wider">Registered Patrons</span>
            <div className="p-2 rounded-xl bg-[#FAF5F1] text-[#7D4052]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-3xl font-semibold text-[#272326]">
            {metrics.totalCustomers}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            100% Verified Customer Accounts
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8DDDA] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#6F6769]">
            <span className="text-xs font-medium uppercase tracking-wider">Low Stock Alerts</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-editorial text-3xl font-semibold text-amber-700">
            {metrics.lowStockCount}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            Variants at ≤ 5 pieces remaining
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders (8 cols) & Stock Warnings (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E8DDDA] p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#FAF5F1]">
            <div>
              <h3 className="font-editorial text-xl font-medium text-[#272326]">
                Recent Customer Orders
              </h3>
              <p className="text-xs text-[#6F6769]">Showing latest consignments received by server</p>
            </div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-semibold text-[#A65C70] hover:underline"
            >
              View All Orders
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF5F1] text-[#7D4052] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3 rounded-l-xl">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF5F1] font-medium text-[#272326]">
                {recentOrders.map((ord: Order) => (
                  <tr key={ord.id} className="hover:bg-[#FAF5F1]/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#7D4052]">
                      {ord.orderNumber}
                    </td>
                    <td className="p-3">
                      <div>{ord.customerName}</div>
                      <div className="text-[10px] text-[#6F6769] font-normal">{ord.customerEmail}</div>
                    </td>
                    <td className="p-3 font-semibold">
                      ${ord.grandTotal.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF5F1] text-[#272326] border border-[#E8DDDA]">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => navigate('/admin/orders', { orderId: ord.id })}
                        className="text-[#A65C70] hover:underline font-semibold"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E8DDDA] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#FAF5F1]">
            <h3 className="font-editorial text-lg font-medium text-[#272326] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Stock Warnings</span>
            </h3>
            <button
              onClick={() => navigate('/admin/inventory')}
              className="text-xs font-semibold text-[#A65C70] hover:underline"
            >
              Inventory Matrix
            </button>
          </div>

          <div className="space-y-3">
            {lowStockVariants.length === 0 ? (
              <p className="text-xs text-emerald-600 py-4 text-center">
                All garments have optimal stock levels.
              </p>
            ) : (
              lowStockVariants.map((item: any, i: number) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-[#FAF5F1]/60 border border-[#E8DDDA] flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-[#272326] truncate">{item.productName}</h4>
                    <span className="text-[11px] text-[#6F6769]">
                      Size: {item.size} • SKU: {item.sku}
                    </span>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                      {item.stock} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => navigate('/admin/inventory')}
            className="w-full py-2.5 rounded-xl bg-[#FAF5F1] text-[#7D4052] text-xs font-semibold hover:bg-[#E9C8CC]/40 transition-colors text-center block"
          >
            Adjust Variant Inventory
          </button>
        </div>
      </div>
    </div>
  );
};
