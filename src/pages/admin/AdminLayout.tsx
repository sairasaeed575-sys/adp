import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { 
  LayoutDashboard, ShoppingBag, Shirt, Layers, 
  Users, MessageSquare, Tag, Palette, Settings, 
  LogOut, ExternalLink, ShieldCheck, Bell, Mail 
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeNav: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeNav }) => {
  const { user, logout, demoSwitch } = useAuth();
  const { navigate } = useNavigation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders & Tracking', path: '/admin/orders', icon: ShoppingBag },
    { id: 'products', label: 'Products & Variants', path: '/admin/products', icon: Shirt },
    { id: 'inventory', label: 'Inventory & Stock', path: '/admin/inventory', icon: Layers },
    { id: 'customers', label: 'Customers & LTV', path: '/admin/customers', icon: Users },
    { id: 'reviews', label: 'Review Moderation', path: '/admin/reviews', icon: MessageSquare },
    { id: 'coupons', label: 'Discounts & Coupons', path: '/admin/coupons', icon: Tag },
    { id: 'cms', label: 'Homepage CMS', path: '/admin/cms', icon: Palette },
    { id: 'messages', label: 'Customer Inquiries', path: '/admin/messages', icon: Mail },
    { id: 'settings', label: 'Settings & Audit Log', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F4EFEA] text-[#272326] flex flex-col md:flex-row antialiased font-sans">
      {/* Dark Modern Sidebar */}
      <aside className="w-full md:w-64 bg-[#1E1B1D] text-[#FAF5F1] flex flex-col shrink-0 border-r border-[#312B2E]">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#312B2E] flex items-center justify-between">
          <div>
            <div className="font-editorial text-2xl tracking-widest font-semibold text-white">
              COMFORT
            </div>
            <div className="text-[9px] tracking-[0.25em] text-[#C7A26A] uppercase font-bold">
              Shopify-Grade Admin
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#A65C70] text-white font-semibold shadow-xs'
                    : 'text-[#D8D0D3] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#C7A26A]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card Bottom */}
        <div className="p-4 border-t border-[#312B2E] space-y-3 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#A65C70] text-white flex items-center justify-center font-bold text-xs uppercase">
              {user?.name ? user.name[0] : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-[#C7A26A] uppercase font-medium">{user?.role}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={() => navigate('/')}
              className="text-[#D8D0D3] hover:text-[#C7A26A] flex items-center gap-1 transition-colors"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-[#FFFDFC] border-b border-[#E8DDDA] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#7D4052] uppercase tracking-wider">
              Console
            </span>
            <span className="text-[#E8DDDA]">/</span>
            <span className="text-xs font-bold text-[#272326] capitalize">
              {activeNav}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => navigate('/')}
              className="px-3 py-1.5 rounded-xl border border-[#E8DDDA] hover:bg-[#FAF5F1] text-[#272326] font-medium flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#A65C70]" />
              <span className="hidden sm:inline">View Public Storefront</span>
            </button>

            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Database: Persistent
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
