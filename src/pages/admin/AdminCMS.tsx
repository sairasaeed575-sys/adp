import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { HomepageCMS } from '../../types';
import { Palette, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

export const AdminCMS: React.FC = () => {
  const { showToast } = useToast();
  const [cms, setCms] = useState<HomepageCMS | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/cms/homepage')
      .then(res => res.json())
      .then(data => {
        if (data.cms) setCms(data.cms);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cms) return;
    setSaving(true);
    const token = localStorage.getItem('comfort_auth_token');
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(cms),
      });
      setSaving(false);
      if (res.ok) {
        showToast('Homepage visual content saved and published live!', 'success');
      } else {
        showToast('Failed to save CMS content', 'error');
      }
    } catch {
      setSaving(false);
      showToast('Network error', 'error');
    }
  };

  if (loading || !cms) {
    return <div className="py-24 text-center text-xs text-[#6F6769]">Loading visual CMS...</div>;
  }

  return (
    <form onSubmit={handleSaveCMS} className="space-y-8 max-w-5xl mx-auto text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-[#272326]">
            Homepage Visual CMS
          </h1>
          <p className="text-xs text-[#6F6769] mt-0.5">
            Modify promotional announcements, hero imagery, and editorial service pillars without code deployments.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-[#7D4052] text-white font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors disabled:opacity-50 shadow-sm"
        >
          {saving ? 'Publishing...' : 'Publish Content Live'}
        </button>
      </div>

      {/* 1. Announcement Bar */}
      <div className="p-6 bg-white rounded-3xl border border-[#E8DDDA] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#FAF5F1]">
          <h2 className="font-editorial text-xl font-medium text-[#272326]">
            Top Announcement Bar
          </h2>
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#7D4052]">
            <input
              type="checkbox"
              checked={cms.announcementBar.enabled}
              onChange={e => setCms({
                ...cms,
                announcementBar: { ...cms.announcementBar, enabled: e.target.checked }
              })}
              className="accent-[#7D4052] w-4 h-4"
            />
            <span>Enabled</span>
          </label>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-[#272326]">Announcement Broadcast Text</label>
          <input
            type="text"
            value={cms.announcementBar.text}
            onChange={e => setCms({
              ...cms,
              announcementBar: { ...cms.announcementBar, text: e.target.value }
            })}
            className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
          />
        </div>
      </div>

      {/* 2. Primary Hero Showcase */}
      <div className="p-6 bg-white rounded-3xl border border-[#E8DDDA] shadow-xs space-y-4">
        <h2 className="font-editorial text-xl font-medium text-[#272326] pb-3 border-b border-[#FAF5F1]">
          Main Hero Composition
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-[#272326]">Season Badge</label>
            <input
              type="text"
              value={cms.hero.badge}
              onChange={e => setCms({ ...cms, hero: { ...cms.hero, badge: e.target.value } })}
              className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#272326]">Headline Title</label>
            <input
              type="text"
              value={cms.hero.title}
              onChange={e => setCms({ ...cms, hero: { ...cms.hero, title: e.target.value } })}
              className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl font-editorial text-base"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="font-semibold text-[#272326]">Hero Description Narrative</label>
            <textarea
              rows={2}
              value={cms.hero.description}
              onChange={e => setCms({ ...cms, hero: { ...cms.hero, description: e.target.value } })}
              className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#272326]">Primary Button Label</label>
            <input
              type="text"
              value={cms.hero.primaryCtaText}
              onChange={e => setCms({ ...cms, hero: { ...cms.hero, primaryCtaText: e.target.value } })}
              className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#272326]">Primary Link</label>
            <input
              type="text"
              value={cms.hero.primaryCtaLink}
              onChange={e => setCms({ ...cms, hero: { ...cms.hero, primaryCtaLink: e.target.value } })}
              className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl font-mono text-[11px]"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="font-semibold text-[#272326]">Hero High-Resolution Background URL</label>
            <input
              type="url"
              value={cms.hero.image}
              onChange={e => setCms({ ...cms, hero: { ...cms.hero, image: e.target.value } })}
              className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl font-mono text-[11px]"
            />
            {cms.hero.image && (
              <div className="h-32 rounded-xl overflow-hidden mt-2 border border-[#E8DDDA]">
                <img src={cms.hero.image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 rounded-xl bg-[#7D4052] text-white font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors shadow-lg disabled:opacity-50"
        >
          {saving ? 'Publishing...' : 'Save All Changes'}
        </button>
      </div>
    </form>
  );
};
