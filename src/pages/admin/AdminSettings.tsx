import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { StoreSettings, AuditLog } from '../../types';
import { Settings, Shield, History, Save } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('comfort_auth_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch('/api/settings').then(r => r.json()),
      fetch('/api/admin/audit-logs', { headers }).then(r => r.json()),
    ])
      .then(([settingsData, auditData]) => {
        if (settingsData.settings) setSettings(settingsData.settings);
        if (auditData.auditLogs) setAuditLogs(auditData.auditLogs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    const token = localStorage.getItem('comfort_auth_token');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(settings),
      });

      setSaving(false);
      if (res.ok) {
        showToast('Store settings saved and applied to checkout calculations', 'success');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch {
      setSaving(false);
      showToast('Network error', 'error');
    }
  };

  if (loading || !settings) {
    return <div className="py-24 text-center text-xs text-[#6F6769]">Loading settings...</div>;
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto text-xs">
      <div>
        <h1 className="font-editorial text-3xl font-medium text-[#272326]">
          Store Settings & Governance
        </h1>
        <p className="text-xs text-[#6F6769] mt-0.5">
          Configure financial rules, shipping thresholds, currency tokens, and view administrative audit trails.
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 bg-white rounded-3xl border border-[#E8DDDA] shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#FAF5F1]">
          <h2 className="font-editorial text-xl font-medium text-[#272326] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#A65C70]" />
            <span>Store Configuration</span>
          </h2>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#7D4052] text-white font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-[#272326]">Store Name</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={e => setSettings({ ...settings, storeName: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#272326]">Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={e => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#272326]">Currency Symbol & Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.currencySymbol}
                onChange={e => setSettings({ ...settings, currencySymbol: e.target.value })}
                className="w-16 px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl text-center font-bold"
              />
              <input
                type="text"
                value={settings.currencyCode}
                onChange={e => setSettings({ ...settings, currencyCode: e.target.value })}
                className="flex-1 px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl font-mono uppercase"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#272326]">Sales Tax Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              value={settings.taxRatePercent}
              onChange={e => setSettings({ ...settings, taxRatePercent: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#272326]">Free Shipping Minimum Spend ($)</label>
            <input
              type="number"
              value={settings.freeShippingThreshold}
              onChange={e => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#272326]">Standard Delivery Charge ($)</label>
            <input
              type="number"
              value={settings.standardShippingFee}
              onChange={e => setSettings({ ...settings, standardShippingFee: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#272326]">Concierge Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#272326]">Concierge Telephone</label>
            <input
              type="tel"
              value={settings.supportPhone}
              onChange={e => setSettings({ ...settings, supportPhone: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
            />
          </div>
        </div>
      </form>

      {/* Audit Logs Table */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#E8DDDA] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#FAF5F1]">
          <h2 className="font-editorial text-xl font-medium text-[#272326] flex items-center gap-2">
            <History className="w-5 h-5 text-[#A65C70]" />
            <span>Administrative Audit Log Trail</span>
          </h2>
          <span className="text-[10px] text-[#6F6769] font-mono">
            {auditLogs.length} events recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF5F1] text-[#7D4052] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User / Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF5F1] font-medium text-[#272326]">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#FAF5F1]/30">
                  <td className="p-3 text-[#6F6769]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-semibold text-[#7D4052]">
                    {log.user}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF5F1] border border-[#E8DDDA] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-[#6F6769]">
                    {log.entity} ({log.entityId})
                  </td>
                  <td className="p-3 text-[#272326]">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
