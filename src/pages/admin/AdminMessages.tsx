import React, { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle2 } from 'lucide-react';

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('comfort_auth_token');
    fetch('/api/admin/messages', {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(res => res.json())
      .then(data => {
        if (data.messages) setMessages(data.messages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-xs">
      <div>
        <h1 className="font-editorial text-3xl font-medium text-[#272326]">
          Customer Inquiries & Concierge Messages
        </h1>
        <p className="text-xs text-[#6F6769] mt-0.5">
          Messages submitted through the public Contact page.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8DDDA] overflow-hidden shadow-xs">
        <div className="divide-y divide-[#FAF5F1]">
          {loading ? (
            <div className="p-8 text-center text-[#6F6769]">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-[#6F6769]">No messages received yet.</div>
          ) : (
            messages.map(m => (
              <div key={m.id} className="p-6 space-y-2 hover:bg-[#FAF5F1]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#272326]">{m.name}</span>
                    <span className="text-[#6F6769]">({m.email})</span>
                    {m.phone && <span className="text-[#6F6769]">• {m.phone}</span>}
                  </div>
                  <span className="text-[11px] text-[#6F6769]">
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="font-bold text-[#7D4052]">{m.subject}</div>
                <p className="text-[#272326] leading-relaxed bg-[#FAF5F1] p-3 rounded-xl border border-[#E8DDDA]">
                  {m.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
