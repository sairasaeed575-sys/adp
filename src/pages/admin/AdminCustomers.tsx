import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Users, Search, Download, MapPin, ShoppingBag, X } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const fetchCustomers = () => {
    setLoading(true);
    const token = localStorage.getItem('comfort_auth_token');
    fetch('/api/admin/customers', {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(res => res.json())
      .then(data => {
        if (data.customers) setCustomers(data.customers);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-[#272326]">
            Patron Management & LTV
          </h1>
          <p className="text-xs text-[#6F6769] mt-0.5">
            Registered customer accounts, lifetime purchasing value, and saved shipping addresses.
          </p>
        </div>

        <button
          onClick={() => window.location.href = '/api/admin/export/customers'}
          className="px-3.5 py-2 rounded-xl bg-white border border-[#E8DDDA] text-xs font-semibold text-[#272326] hover:bg-[#FAF5F1] transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-[#6F6769]" />
          <span>Export Patrons CSV</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 bg-white rounded-2xl border border-[#E8DDDA] flex items-center gap-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6F6769] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patron name, email, or telephone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-[#E8DDDA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF5F1] text-[#7D4052] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Lifetime Value (LTV)</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF5F1] font-medium text-[#272326]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#6F6769]">Loading patrons...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#6F6769]">No customer records found.</td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-[#FAF5F1]/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-[#272326]">{c.name}</div>
                      <div className="text-[11px] text-[#6F6769] font-normal">{c.email}</div>
                    </td>
                    <td className="p-4 text-[#6F6769]">
                      {c.phone || '—'}
                    </td>
                    <td className="p-4 text-[#6F6769]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-[#272326]">{c.totalOrders}</span> orders
                    </td>
                    <td className="p-4 font-semibold text-[#7D4052]">
                      ${c.lifetimeValue.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
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

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FFFDFC] rounded-3xl p-6 sm:p-8 border border-[#E8DDDA] shadow-2xl space-y-4 animate-scale-up text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#E8DDDA]">
              <div>
                <span className="text-[10px] font-bold text-[#A65C70] uppercase">Patron Dossier</span>
                <h3 className="font-editorial text-2xl font-bold text-[#272326]">
                  {selectedCustomer.name}
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedCustomer(null)}>
                <X className="w-5 h-5 text-[#6F6769]" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#FAF5F1] rounded-2xl">
                <div>
                  <span className="text-[#6F6769] block">Email:</span>
                  <strong>{selectedCustomer.email}</strong>
                </div>
                <div>
                  <span className="text-[#6F6769] block">Phone:</span>
                  <strong>{selectedCustomer.phone || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-[#6F6769] block">Total Orders:</span>
                  <strong>{selectedCustomer.totalOrders}</strong>
                </div>
                <div>
                  <span className="text-[#6F6769] block">LTV:</span>
                  <strong className="text-[#7D4052] text-sm">${selectedCustomer.lifetimeValue.toFixed(2)}</strong>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-xs text-[#272326] mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#A65C70]" />
                  <span>Saved Addresses ({selectedCustomer.addresses?.length || 0})</span>
                </h4>
                {selectedCustomer.addresses?.length === 0 ? (
                  <p className="text-[#6F6769]">No saved addresses.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.addresses.map((a: any) => (
                      <div key={a.id} className="p-3 bg-white border border-[#E8DDDA] rounded-xl text-[11px]">
                        <strong>{a.fullName}</strong> ({a.phone})<br />
                        {a.addressLine}, {a.city}, {a.state} {a.postalCode} • {a.country}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2.5 rounded-xl bg-[#7D4052] text-white font-semibold uppercase tracking-wider"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
