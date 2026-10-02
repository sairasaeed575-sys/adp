import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, User as UserIcon, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoSwitch } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      showToast('Welcome back to COMFORT', 'success');
      navigate('/account');
    } else {
      showToast(res.error || 'Login failed', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[11px] font-semibold text-[#A65C70] uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#C7A26A]" />
          Patron Authentication
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#272326]">
          Sign In to COMFORT
        </h1>
        <p className="text-xs text-[#6F6769]">
          Access your orders, saved addresses, and tailored wishlist.
        </p>
      </div>

      <div className="p-8 bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] shadow-xs space-y-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#272326]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6F6769] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="e.g. sairasaeed575@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#272326]">Password</label>
              <button
                type="button"
                onClick={() => showToast('For demo testing, use "customer123" or click the Quick Demo Login below.', 'info')}
                className="text-[11px] text-[#A65C70] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6F6769] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#7D4052]/20 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Accounts Quick-Login Buttons */}
        <div className="pt-4 border-t border-[#FAF5F1] space-y-2">
          <div className="text-[11px] text-[#6F6769] text-center font-medium">
            Instant 1-Click Demo Accounts:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={async () => {
                await demoSwitch('customer');
                showToast('Switched to Customer account (Saira Saeed)', 'success');
                navigate('/account');
              }}
              className="p-2 rounded-xl bg-[#FAF5F1] hover:bg-[#E9C8CC]/40 border border-[#E8DDDA] text-xs font-medium text-[#7D4052] transition-colors"
            >
              Customer Demo
            </button>
            <button
              onClick={async () => {
                await demoSwitch('admin');
                showToast('Switched to Super Admin (Victoria Vance)', 'success');
                navigate('/admin');
              }}
              className="p-2 rounded-xl bg-[#272326] hover:bg-[#7D4052] text-white text-xs font-medium transition-colors"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#6F6769] pt-2">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[#7D4052] font-semibold hover:underline"
          >
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    setLoading(true);
    const res = await register(name, email, password, phone);
    setLoading(false);
    if (res.success) {
      showToast('Welcome to COMFORT! Account created successfully.', 'success');
      navigate('/account');
    } else {
      showToast(res.error || 'Registration failed', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[11px] font-semibold text-[#A65C70] uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#C7A26A]" />
          Welcome Privileges
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#272326]">
          Create Patron Account
        </h1>
        <p className="text-xs text-[#6F6769]">
          Enjoy express checkout, order tracking, and complimentary garment care concierge.
        </p>
      </div>

      <div className="p-8 bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] shadow-xs space-y-6">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#272326]">Full Name *</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-[#6F6769] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Saira Saeed"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#272326]">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6F6769] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="e.g. sairasaeed575@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#272326]">Phone (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#6F6769] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#272326]">Password (min 6 chars) *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6F6769] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#7D4052]/20 disabled:opacity-50"
          >
            <span>{loading ? 'Creating...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#6F6769] pt-2">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#7D4052] font-semibold hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
