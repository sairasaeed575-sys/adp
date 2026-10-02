import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { 
  Sparkles, Mail, Phone, MapPin, Send, CheckCircle2, 
  HelpCircle, ShieldCheck, Truck, RotateCcw, ChevronDown 
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-3">
        <span className="text-[11px] font-semibold text-[#A65C70] uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C7A26A]" />
          Our Heritage & Philosophy
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-medium text-[#272326]">
          The Story of COMFORT
        </h1>
        <p className="text-sm text-[#6F6769] font-light max-w-xl mx-auto leading-relaxed">
          Ladies garments designed with quiet confidence, tactile tenderness, and everlasting silhouettes.
        </p>
      </div>

      <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-lg border border-[#E8DDDA]">
        <img
          src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=85"
          alt="Atelier Craft"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-6 text-sm text-[#6F6769] leading-relaxed">
        <h2 className="font-editorial text-2xl font-semibold text-[#272326]">
          Where Modern Grace Meets Unhurried Comfort
        </h2>
        <p>
          Founded on the conviction that women should feel exquisitely comfortable in the clothing they inhabit, COMFORT curates collections that honor traditional eastern handcraft while embracing contemporary ease. We reject stiff synthetics and fast-fashion corners in favor of 80-count combed cotton lawn, naturally thermoregulating European flax linen, and pure raw silk blends.
        </p>
        <p>
          Each garment passes through the hands of master embroiders, lace crafters, and tailoring artisans. From delicate resham florals and scalloped hemlines to mother-of-pearl closures and discreet deep pockets, every nuance is considered for the woman who values dignity, poise, and tactile delight.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#E8DDDA]">
          <div className="p-6 rounded-2xl bg-[#FAF5F1] space-y-2">
            <div className="font-editorial text-2xl font-bold text-[#7D4052]">100%</div>
            <div className="text-xs font-semibold text-[#272326]">Certified Natural Yarns</div>
            <p className="text-[11px] text-[#6F6769]">Breathable lawn, flax linen, and pure silk.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF5F1] space-y-2">
            <div className="font-editorial text-2xl font-bold text-[#7D4052]">Bespoke</div>
            <div className="text-xs font-semibold text-[#272326]">Artisanal Finishing</div>
            <p className="text-[11px] text-[#6F6769]">Hand-placed pearls, tilla wire, and scalloped edges.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF5F1] space-y-2">
            <div className="font-editorial text-2xl font-bold text-[#7D4052]">14-Day</div>
            <div className="text-xs font-semibold text-[#272326]">Complimentary Exchange</div>
            <p className="text-[11px] text-[#6F6769]">Confidence in every purchase with door-to-door pickups.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      setSubmitting(false);
      if (res.ok) {
        setSubmitted(true);
        showToast('Thank you! Your inquiry has been routed to our concierge team.', 'success');
      } else {
        showToast('Failed to send message, please try again.', 'error');
      }
    } catch {
      setSubmitting(false);
      showToast('Network error', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-[11px] font-semibold text-[#A65C70] uppercase tracking-widest">
          Personal Concierge
        </span>
        <h1 className="font-editorial text-4xl font-medium text-[#272326]">
          Contact COMFORT Atelier
        </h1>
        <p className="text-xs text-[#6F6769] max-w-md mx-auto">
          For bespoke bridal consultations, custom alterations, or parcel assistance, our styling advisors are at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info (5 cols) */}
        <div className="md:col-span-5 bg-[#FAF5F1] rounded-3xl p-6 sm:p-8 border border-[#E8DDDA] space-y-6">
          <div className="space-y-4">
            <h3 className="font-editorial text-xl font-medium text-[#272326]">
              Atelier Headquarters
            </h3>
            <div className="space-y-3 text-xs text-[#6F6769]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#A65C70] shrink-0 mt-0.5" />
                <span>450 Fashion Avenue, Suite 1200<br />New York, NY 10018</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#A65C70] shrink-0" />
                <span>+1 (800) 450-COZY (2699)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#A65C70] shrink-0" />
                <span>care@comfortgarments.com</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8DDDA] text-xs text-[#6F6769] space-y-1">
            <strong className="text-[#272326]">Concierge Hours:</strong>
            <p>Monday – Friday: 9:00 AM – 7:00 PM EST</p>
            <p>Saturday: 10:00 AM – 4:00 PM EST</p>
          </div>
        </div>

        {/* Form (7 cols) */}
        <div className="md:col-span-7 bg-[#FFFDFC] rounded-3xl p-6 sm:p-8 border border-[#E8DDDA] shadow-xs">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-editorial text-2xl font-medium text-[#272326]">
                Message Received
              </h3>
              <p className="text-xs text-[#6F6769] max-w-sm mx-auto">
                Thank you, {name}. A member of our concierge styling team will reply to <strong>{email}</strong> within 12 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#272326]">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Saira Saeed"
                    className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#272326]">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. sairasaeed575@gmail.com"
                    className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#272326]">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Inquiring about custom sizing on lawn suit"
                  className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#272326]">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Please describe your inquiry in detail..."
                  className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#7D4052] text-white font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Transmitting...' : 'Send Inquiry'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const faqs = [
    {
      q: 'How do I know which size to order?',
      a: 'Each product page includes our interactive "View Size Guide" with exact measurements for bust, waist, hip, and length in inches. If you prefer a relaxed modest drape, we recommend selecting one size up from your standard body measurement.'
    },
    {
      q: 'What is your fabric composition and care recommendation?',
      a: 'We use 80-count combed cotton lawn, 100% pre-washed European flax linen, and high-density Korean Nida silk. Lawn and linen can be cold machine-washed in gentle cycles, whereas raw silk and pearl-embellished garments should be professionally dry-cleaned.'
    },
    {
      q: 'How long does shipping take?',
      a: 'Standard delivery takes 3 to 5 business days. Express Priority shipping takes 2 to 3 business days. Orders exceeding $50 receive complimentary express delivery automatically.'
    },
    {
      q: 'How do I initiate a return or exchange?',
      a: 'Simply log into your customer portal, navigate to "My Orders", and click "Request Return" next to your delivered package. You can also contact our concierge team at care@comfortgarments.com.'
    },
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes! We support Cash on Delivery across eligible delivery zones as well as secure 256-bit encrypted credit/debit card processing.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[11px] font-semibold text-[#A65C70] uppercase tracking-widest">
          Frequently Asked Questions
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#272326]">
          Patron Inquiries & Sizing
        </h1>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="p-6 rounded-2xl bg-[#FFFDFC] border border-[#E8DDDA] space-y-2">
            <h3 className="font-editorial text-lg font-semibold text-[#272326] flex items-start gap-2">
              <span className="text-[#A65C70]">Q.</span>
              <span>{f.q}</span>
            </h3>
            <p className="text-xs text-[#6F6769] leading-relaxed pl-6">
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PolicyPage: React.FC<{ type: 'shipping' | 'returns' | 'privacy' | 'terms' }> = ({ type }) => {
  if (type === 'shipping') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 text-xs text-[#6F6769] leading-relaxed">
        <h1 className="font-editorial text-3xl font-medium text-[#272326]">
          Shipping & Delivery Policy
        </h1>
        <p>
          At COMFORT, all garments are prepared with archival garment wraps and dispatched through certified express couriers (including DHL Express and FedEx International).
        </p>
        <h3 className="font-semibold text-sm text-[#272326] pt-2">Domestic & International Rates</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Standard Delivery (3-5 business days): $10.00 (Complimentary on orders above $50.00).</li>
          <li>Express Air Priority (2-3 business days): $20.00 flat rate.</li>
        </ul>
        <h3 className="font-semibold text-sm text-[#272326] pt-2">Tracking & SMS Notifications</h3>
        <p>
          Upon dispatch, you will receive an automated tracking code (AWB) allowing live consignment tracking via our dedicated /track-order portal.
        </p>
      </div>
    );
  }

  if (type === 'returns') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 text-xs text-[#6F6769] leading-relaxed">
        <h1 className="font-editorial text-3xl font-medium text-[#272326]">
          14-Day Return & Exchange Policy
        </h1>
        <p>
          We stand unconditionally behind the cut, stitch, and fabric integrity of every garment. If your piece does not fit as desired, you may request an exchange or refund within 14 calendar days of delivery.
        </p>
        <h3 className="font-semibold text-sm text-[#272326] pt-2">Eligibility Criteria</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Garments must be unworn, unwashed, and unaltered.</li>
          <li>All original COMFORT atelier tags and seal ribbons must remain intact.</li>
          <li>Accompanied by the digital invoice or order reference.</li>
        </ul>
        <p>
          Return pickups can be scheduled directly from your account page, with courier collection arranged at your doorstep.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 text-xs text-[#6F6769] leading-relaxed">
      <h1 className="font-editorial text-3xl font-medium text-[#272326]">
        {type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
      </h1>
      <p>
        COMFORT respects the confidential nature of customer data. We never sell, lease, or distribute email records or personal identifiers to third-party marketing entities.
      </p>
      <p>
        All transactions, order numbers, and address details are stored using encrypted relational database protocols. For inquiries regarding your records, contact legal@comfortgarments.com.
      </p>
    </div>
  );
};
