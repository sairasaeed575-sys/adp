import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Review } from '../../types';
import { MessageSquare, Star, Check, X, Flag, CornerDownRight } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Response modal
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = () => {
    setLoading(true);
    const token = localStorage.getItem('comfort_auth_token');
    fetch('/api/admin/reviews', {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(res => res.json())
      .then(data => {
        if (data.reviews) setReviews(data.reviews);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (reviewId: string, newStatus: Review['status']) => {
    const token = localStorage.getItem('comfort_auth_token');
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Review marked as ${newStatus}`, 'success');
        setReviews(reviews.map(r => (r.id === reviewId ? { ...r, status: newStatus } : r)));
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;
    setSubmittingReply(true);
    const token = localStorage.getItem('comfort_auth_token');
    try {
      const res = await fetch(`/api/admin/reviews/${replyingReview.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: replyingReview.status, adminReply: replyText }),
      });
      setSubmittingReply(false);
      if (res.ok) {
        showToast('Admin reply saved and published', 'success');
        setReviews(reviews.map(r => (r.id === replyingReview.id ? { ...r, adminReply: replyText } : r)));
        setReplyingReview(null);
        setReplyText('');
      }
    } catch {
      setSubmittingReply(false);
      showToast('Network error saving reply', 'error');
    }
  };

  const filtered = reviews.filter(r => statusFilter === 'all' || r.status === statusFilter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-editorial text-3xl font-medium text-[#272326]">
          Customer Review Moderation
        </h1>
        <p className="text-xs text-[#6F6769] mt-0.5">
          Moderate verified purchase feedback, manage reviews, and publish atelier responses.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8DDDA] gap-6 text-xs font-semibold">
        {['all', 'approved', 'pending', 'flagged', 'rejected'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`pb-3 capitalize transition-all border-b-2 ${
              statusFilter === st
                ? 'border-[#7D4052] text-[#7D4052]'
                : 'border-transparent text-[#6F6769] hover:text-[#272326]'
            }`}
          >
            {st} ({reviews.filter(r => st === 'all' || r.status === st).length})
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-[#E8DDDA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF5F1] text-[#7D4052] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Garment</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Review Content</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF5F1] font-medium text-[#272326]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#6F6769]">Loading reviews...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#6F6769]">No reviews in this category.</td>
                </tr>
              ) : (
                filtered.map(rev => (
                  <tr key={rev.id} className="hover:bg-[#FAF5F1]/30 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold">{rev.customerName}</div>
                      <div className="text-[11px] text-[#6F6769] font-normal">{rev.customerEmail}</div>
                      {rev.isVerifiedPurchase && (
                        <span className="text-[9px] text-emerald-700 font-bold">Verified Patron</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold">
                      {rev.productName}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-[#C7A26A]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-[#272326]">{rev.title}</div>
                      <p className="text-[#6F6769] line-clamp-2 mt-0.5">{rev.comment}</p>
                      {rev.adminReply && (
                        <div className="text-[10px] text-[#7D4052] mt-1 italic">
                          Reply: {rev.adminReply}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        rev.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rev.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rev.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(rev.id, 'approved')}
                          className="p-1.5 rounded-lg border border-[#E8DDDA] hover:bg-emerald-50 text-emerald-600"
                          title="Approve"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                          className="p-1.5 rounded-lg border border-[#E8DDDA] hover:bg-red-50 text-red-600"
                          title="Reject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setReplyingReview(rev);
                            setReplyText(rev.adminReply || '');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FAF5F1] text-[#7D4052] font-semibold text-[11px] flex items-center gap-1"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSendReply} className="w-full max-w-md bg-[#FFFDFC] rounded-3xl p-6 sm:p-8 border border-[#E8DDDA] shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#E8DDDA]">
              <h3 className="font-editorial text-xl font-bold text-[#272326]">
                Atelier Response
              </h3>
              <button type="button" onClick={() => setReplyingReview(null)}>
                <X className="w-5 h-5 text-[#6F6769]" />
              </button>
            </div>

            <p className="text-[#6F6769]">
              Replying to <strong>{replyingReview.customerName}</strong> on <em>{replyingReview.productName}</em>:
            </p>

            <textarea
              rows={4}
              required
              placeholder="Thank you so much! We are thrilled to hear that..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              className="w-full p-3 bg-[#FAF5F1] border border-[#E8DDDA] rounded-xl focus:outline-none"
            />

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submittingReply}
                className="flex-1 py-3 rounded-xl bg-[#7D4052] text-white font-semibold uppercase tracking-wider disabled:opacity-50"
              >
                {submittingReply ? 'Publishing...' : 'Publish Response'}
              </button>
              <button
                type="button"
                onClick={() => setReplyingReview(null)}
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
