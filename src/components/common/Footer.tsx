import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { Mail, ArrowRight, ShieldCheck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useNavigation();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setSubscribed(true);
        showToast('Thank you for subscribing to COMFORT Gazette!', 'success');
      } else {
        showToast(data.error || 'Subscription failed', 'error');
      }
    } catch {
      setLoading(false);
      showToast('Network error, please try again.', 'error');
    }
  };

  return (
    <footer className="bg-[#FAF5F1] text-[#272326] border-t border-[#E8DDDA] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Newsletter & Atelier Section */}
        <div className="bg-[#FFFDFC] rounded-3xl p-8 sm:p-12 border border-[#E8DDDA] mb-16 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-[#A65C70] flex items-center justify-center lg:justify-start gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C7A26A]" />
              The COMFORT Gazette
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-medium text-[#272326]">
              Timeless stories, private previews & new collections.
            </h3>
            <p className="text-xs sm:text-sm text-[#6F6769] mt-2 leading-relaxed">
              Subscribe to receive curated invitations to seasonal lookbooks, fabric care guides, and a 10% welcome privilege on your first order.
            </p>
          </div>

          <div className="w-full lg:w-auto min-w-[320px]">
            {subscribed ? (
              <div className="flex items-center gap-2 p-4 bg-[#FAF5F1] rounded-2xl border border-[#A65C70]/30 text-xs text-[#7D4052] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#A65C70]" />
                <span>You are subscribed. Welcome to the COMFORT circle.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-[#6F6769] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl text-xs focus:outline-none focus:border-[#A65C70] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#7D4052] text-white text-xs font-semibold tracking-wider uppercase rounded-xl hover:bg-[#A65C70] transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>{loading ? '...' : 'Join'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#E8DDDA]">
          {/* Brand Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="font-editorial text-3xl tracking-[0.2em] font-medium text-[#272326]">
                COMFORT
              </div>
              <div className="text-[10px] tracking-[0.35em] uppercase text-[#7D4052] font-semibold mt-0.5">
                LADIES GARMENTS
              </div>
            </div>
            <p className="text-xs text-[#6F6769] leading-relaxed max-w-sm">
              Dedicated to the art of feminine grace and uncompromising comfort. We celebrate delicate embroideries, natural combed fibers, and silhouettes designed to make every woman feel regal yet at home.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#7D4052]">
              <ShieldCheck className="w-4 h-4 text-[#C7A26A]" />
              <span className="font-medium">Ethically Tailored & Responsibly Sourced</span>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#A65C70]">Collections</h4>
            <ul className="space-y-2 text-xs text-[#6F6769]">
              <li>
                <button onClick={() => navigate('/shop/new-arrivals')} className="hover:text-[#A65C70] transition-colors">
                  New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop/category/formal-wear')} className="hover:text-[#A65C70] transition-colors">
                  Formal & Festive Wear
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop/category/casual-wear')} className="hover:text-[#A65C70] transition-colors">
                  Linen Co-Ords & Casuals
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop/category/unstitched')} className="hover:text-[#A65C70] transition-colors">
                  Unstitched Luxury Lawn
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop/category/modest-wear')} className="hover:text-[#A65C70] transition-colors">
                  Modest Silk Abayas
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop/sale')} className="hover:text-[#A65C70] text-[#7D4052] font-semibold transition-colors">
                  Seasonal Archives & Sale
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#A65C70]">Customer Care</h4>
            <ul className="space-y-2 text-xs text-[#6F6769]">
              <li>
                <button onClick={() => navigate('/track-order')} className="hover:text-[#A65C70] font-medium transition-colors">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/account/orders')} className="hover:text-[#A65C70] transition-colors">
                  Order History & Returns
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-[#A65C70] transition-colors">
                  Contact Concierge
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faq')} className="hover:text-[#A65C70] transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/account/wishlist')} className="hover:text-[#A65C70] transition-colors">
                  Saved Wishlist
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#A65C70]">Legal & Policies</h4>
            <ul className="space-y-2 text-xs text-[#6F6769]">
              <li>
                <button onClick={() => navigate('/shipping-policy')} className="hover:text-[#A65C70] transition-colors">
                  Shipping & Handling
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/return-policy')} className="hover:text-[#A65C70] transition-colors">
                  14-Day Return Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-[#A65C70] transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-[#A65C70] transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-[#A65C70] transition-colors">
                  About Our Brand
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Payment Icons & Made with Care */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F6769]">
          <div>
            © {new Date().getFullYear()} COMFORT — Ladies Garments. All Rights Reserved.
          </div>

          {/* Authentic Payment Badges */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-[#272326]">Accepted Payments:</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-white border border-[#E8DDDA] text-[10px] font-semibold text-[#272326]">
                Cash on Delivery
              </span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#E8DDDA] text-[10px] font-semibold text-[#272326]">
                Credit / Debit Card
              </span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#E8DDDA] text-[10px] font-semibold text-[#272326]">
                Direct Bank Wire
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
