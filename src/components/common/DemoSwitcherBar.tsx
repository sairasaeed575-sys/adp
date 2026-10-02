import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Shield, User as UserIcon, ExternalLink, Sparkles, X } from 'lucide-react';

export const DemoSwitcherBar: React.FC = () => {
  const { user, demoSwitch, isAdmin } = useAuth();
  const { currentPath, navigate } = useNavigation();
  const [collapsed, setCollapsed] = useState(false);

  const isInAdmin = currentPath.startsWith('/admin');

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 left-4 z-40 bg-[#272326] text-[#FFFDFC] text-xs font-medium px-3 py-1.5 rounded-full shadow-lg border border-[#A65C70]/40 flex items-center gap-1.5 hover:bg-[#7D4052] transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#C7A26A]" />
        <span>Demo Switcher</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-[#272326]/95 backdrop-blur-md text-[#FFFDFC] text-xs px-4 py-2.5 rounded-2xl shadow-2xl border border-[#A65C70]/30 flex flex-wrap items-center gap-3 animate-fade-in max-w-xl">
      <div className="flex items-center gap-1.5 text-[#E9C8CC]">
        <Sparkles className="w-3.5 h-3.5 text-[#C7A26A]" />
        <span className="font-semibold tracking-wider text-[11px] uppercase">COMFORT Preview Mode:</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-400">Current User:</span>
        <span className="font-medium text-[#FFFDFC] bg-white/10 px-2 py-0.5 rounded-md">
          {user ? `${user.name} (${user.role})` : 'Guest'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => demoSwitch('customer')}
          className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-[#A65C70] transition-colors flex items-center gap-1"
          title="Switch to customer Saira Saeed"
        >
          <UserIcon className="w-3 h-3" />
          <span>Customer</span>
        </button>

        <button
          onClick={() => demoSwitch('admin')}
          className="px-2.5 py-1 rounded-md bg-[#A65C70]/80 hover:bg-[#A65C70] text-white font-medium transition-colors flex items-center gap-1"
          title="Switch to Super Admin Victoria Vance"
        >
          <Shield className="w-3 h-3 text-[#C7A26A]" />
          <span>Super Admin</span>
        </button>
      </div>

      <div className="h-4 w-px bg-white/20 mx-1" />

      {isInAdmin ? (
        <button
          onClick={() => navigate('/')}
          className="text-[#C7A26A] hover:underline flex items-center gap-1 font-medium"
        >
          <span>View Storefront</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      ) : (
        <button
          onClick={() => navigate('/admin')}
          className="text-[#C7A26A] hover:underline flex items-center gap-1 font-medium"
        >
          <Shield className="w-3 h-3" />
          <span>Open Admin Panel</span>
        </button>
      )}

      <button
        onClick={() => setCollapsed(true)}
        className="text-gray-400 hover:text-white ml-auto"
        title="Minimize"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
