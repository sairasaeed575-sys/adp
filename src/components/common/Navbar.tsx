import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { 
  Search, Heart, ShoppingBag, User as UserIcon, 
  Menu, X, ChevronDown, PackageCheck, Shield, LogOut, ArrowRight 
} from 'lucide-react';
import { Category } from '../../types';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { currentPath, navigate } = useNavigation();
  const { user, logout, isAdmin } = useAuth();
  const { openCart, itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWomenDropdownOpen, setIsWomenDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<string>(
    'Complimentary Express Delivery on Orders Over $50  •  Hassle-Free 14-Day Returns  •  100% Certified Fabrics'
  );
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(console.error);

    fetch('/api/cms/homepage')
      .then(res => res.json())
      .then(data => {
        if (data.cms?.announcementBar) {
          setAnnouncement(data.cms.announcementBar.text);
          setAnnouncementEnabled(data.cms.announcementBar.enabled);
        }
      })
      .catch(console.error);
  }, []);

  const handleNav = (path: string, params?: Record<string, string>) => {
    setIsMobileMenuOpen(false);
    setIsWomenDropdownOpen(false);
    setIsUserMenuOpen(false);
    navigate(path, params);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDFC]/95 backdrop-blur-md border-b border-[#E8DDDA] transition-all">
      {/* 1. Announcement Bar */}
      {announcementEnabled && (
        <div className="bg-[#7D4052] text-[#FAF5F1] text-[11px] sm:text-xs py-2 px-4 text-center tracking-widest uppercase font-medium flex items-center justify-center gap-2">
          <span>{announcement}</span>
          <button 
            onClick={() => handleNav('/shop')}
            className="hidden md:inline-flex items-center gap-1 underline underline-offset-2 hover:text-[#C7A26A] transition-colors"
          >
            <span>Shop Now</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 2. Top utility bar */}
      <div className="hidden lg:flex items-center justify-between px-8 py-1.5 text-[11px] text-[#6F6769] border-b border-[#FAF5F1] tracking-wide">
        <div className="flex items-center gap-4">
          <span>Concierge Care: +1 (800) 450-COZY</span>
          <span className="text-[#E8DDDA]">•</span>
          <span>care@comfortgarments.com</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNav('/track-order')}
            className="hover:text-[#A65C70] transition-colors flex items-center gap-1"
          >
            <PackageCheck className="w-3 h-3 text-[#A65C70]" />
            <span>Track Your Order</span>
          </button>
          <span className="text-[#E8DDDA]">•</span>
          <button
            onClick={() => handleNav('/about')}
            className="hover:text-[#A65C70] transition-colors"
          >
            The Atelier Story
          </button>
        </div>
      </div>

      {/* 3. Main Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#272326] hover:text-[#A65C70] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Left Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] tracking-widest uppercase font-medium text-[#272326]">
            <button
              onClick={() => handleNav('/')}
              className={`transition-colors hover:text-[#A65C70] pb-1 border-b-2 ${
                currentPath === '/' ? 'border-[#A65C70] text-[#A65C70]' : 'border-transparent'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNav('/shop/new-arrivals')}
              className={`transition-colors hover:text-[#A65C70] pb-1 border-b-2 ${
                currentPath === '/shop/new-arrivals' ? 'border-[#A65C70] text-[#A65C70]' : 'border-transparent'
              }`}
            >
              New Arrivals
            </button>

            {/* Women with Dropdown Menu */}
            <div 
              className="relative"
              onMouseEnter={() => setIsWomenDropdownOpen(true)}
              onMouseLeave={() => setIsWomenDropdownOpen(false)}
            >
              <button
                onClick={() => handleNav('/shop')}
                className={`transition-colors hover:text-[#A65C70] flex items-center gap-1 pb-1 border-b-2 ${
                  currentPath.startsWith('/shop') && currentPath !== '/shop/new-arrivals' && currentPath !== '/shop/sale'
                    ? 'border-[#A65C70] text-[#A65C70]'
                    : 'border-transparent'
                }`}
              >
                <span>Women</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Dropdown Card */}
              {isWomenDropdownOpen && (
                <div className="absolute top-full left-0 w-72 bg-[#FFFDFC] shadow-2xl rounded-2xl border border-[#E8DDDA] p-4 py-5 animate-fade-in z-50">
                  <div className="text-[10px] tracking-widest uppercase font-semibold text-[#A65C70] px-3 mb-2">
                    Browse By Category
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleNav('/shop')}
                      className="text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#272326] hover:bg-[#FAF5F1] hover:text-[#A65C70] transition-colors"
                    >
                      All Garments & Collections
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleNav(`/shop/category/${cat.slug}`)}
                        className="text-left px-3 py-2 rounded-lg text-xs text-[#6F6769] hover:bg-[#FAF5F1] hover:text-[#A65C70] transition-colors flex items-center justify-between"
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-[#A65C70]/70 uppercase tracking-wider font-light">Explore</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNav('/shop', { collection: 'spring-summer' })}
              className="transition-colors hover:text-[#A65C70] pb-1 border-b-2 border-transparent"
            >
              Collections
            </button>

            <button
              onClick={() => handleNav('/shop/sale')}
              className={`transition-colors hover:text-[#A65C70] text-[#A65C70] font-semibold pb-1 border-b-2 ${
                currentPath === '/shop/sale' ? 'border-[#A65C70]' : 'border-transparent'
              }`}
            >
              Sale
            </button>
          </nav>

          {/* Central Luxury Logo */}
          <div className="text-center cursor-pointer select-none" onClick={() => handleNav('/')}>
            <div className="font-editorial text-2xl sm:text-3xl lg:text-4xl tracking-[0.2em] font-medium text-[#272326]">
              COMFORT
            </div>
            <div className="text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-[#7D4052] font-semibold flex items-center justify-center gap-1">
              <span>LADIES</span>
              <span className="w-1 h-1 rounded-full bg-[#C7A26A] inline-block" />
              <span>GARMENTS</span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#272326] hover:text-[#A65C70] transition-colors rounded-full hover:bg-[#FAF5F1]"
              aria-label="Search garments"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => handleNav('/account/wishlist')}
              className="p-2 text-[#272326] hover:text-[#A65C70] transition-colors rounded-full hover:bg-[#FAF5F1] relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#A65C70] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={openCart}
              className="p-2 text-[#272326] hover:text-[#A65C70] transition-colors rounded-full hover:bg-[#FAF5F1] relative"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#7D4052] text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Account / User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 text-[#272326] hover:text-[#A65C70] transition-colors rounded-full hover:bg-[#FAF5F1] flex items-center gap-1"
                aria-label="Account options"
              >
                <UserIcon className="w-5 h-5" />
                {user && (
                  <span className="hidden xl:inline text-xs font-medium text-[#272326] max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                )}
              </button>

              {/* Account Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FFFDFC] shadow-2xl rounded-2xl border border-[#E8DDDA] p-3 animate-fade-in z-50">
                  {user ? (
                    <div>
                      <div className="p-3 border-b border-[#E8DDDA] mb-2">
                        <div className="font-semibold text-sm text-[#272326]">{user.name}</div>
                        <div className="text-xs text-[#6F6769] truncate">{user.email}</div>
                        <div className="mt-1 inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#FAF5F1] text-[#7D4052] border border-[#E8DDDA]">
                          Role: {user.role}
                        </div>
                      </div>

                      <button
                        onClick={() => handleNav('/account')}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#272326] hover:bg-[#FAF5F1] transition-colors flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-[#A65C70]" />
                        <span>Customer Dashboard</span>
                      </button>

                      <button
                        onClick={() => handleNav('/account/orders')}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#272326] hover:bg-[#FAF5F1] transition-colors flex items-center gap-2"
                      >
                        <PackageCheck className="w-4 h-4 text-[#A65C70]" />
                        <span>Order History & Returns</span>
                      </button>

                      <button
                        onClick={() => handleNav('/account/wishlist')}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#272326] hover:bg-[#FAF5F1] transition-colors flex items-center gap-2"
                      >
                        <Heart className="w-4 h-4 text-[#A65C70]" />
                        <span>Saved Wishlist ({wishlistCount})</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleNav('/admin')}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#7D4052] bg-[#FAF5F1] hover:bg-[#E9C8CC]/40 transition-colors flex items-center gap-2 my-1"
                        >
                          <Shield className="w-4 h-4 text-[#C7A26A]" />
                          <span>Shopify Admin Panel</span>
                        </button>
                      )}

                      <div className="border-t border-[#E8DDDA] my-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      <div className="text-xs text-[#6F6769] px-2 mb-2">
                        Welcome to COMFORT. Sign in to access your orders and wishlist.
                      </div>
                      <button
                        onClick={() => handleNav('/login')}
                        className="w-full py-2 px-4 rounded-xl bg-[#7D4052] text-white text-xs font-medium tracking-wide hover:bg-[#A65C70] transition-colors text-center block"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => handleNav('/register')}
                        className="w-full py-2 px-4 rounded-xl border border-[#E8DDDA] text-[#272326] text-xs font-medium tracking-wide hover:bg-[#FAF5F1] transition-colors text-center block"
                      >
                        Create Account
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-[#FFFDFC] h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-slide-right">
            <div className="flex items-center justify-between pb-6 border-b border-[#E8DDDA]">
              <div>
                <div className="font-editorial text-2xl font-semibold tracking-wider text-[#272326]">COMFORT</div>
                <div className="text-[9px] tracking-widest text-[#7D4052] uppercase font-semibold">Ladies Garments</div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-[#6F6769] hover:text-[#272326]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-4 py-6 text-sm tracking-widest uppercase font-medium">
              <button
                onClick={() => handleNav('/')}
                className="text-left py-2 text-[#272326] hover:text-[#A65C70]"
              >
                Home
              </button>
              <button
                onClick={() => handleNav('/shop/new-arrivals')}
                className="text-left py-2 text-[#A65C70] font-semibold"
              >
                New Arrivals ✨
              </button>
              <button
                onClick={() => handleNav('/shop')}
                className="text-left py-2 text-[#272326] hover:text-[#A65C70]"
              >
                All Garments
              </button>

              <div className="border-t border-b border-[#FAF5F1] py-3 space-y-2">
                <div className="text-[10px] text-[#A65C70] uppercase font-bold tracking-widest">Categories</div>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleNav(`/shop/category/${c.slug}`)}
                    className="block text-left text-xs text-[#6F6769] py-1.5 hover:text-[#A65C70]"
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleNav('/shop/sale')}
                className="text-left py-2 text-[#7D4052] font-semibold"
              >
                Special Sale
              </button>
              <button
                onClick={() => handleNav('/track-order')}
                className="text-left py-2 text-[#272326] hover:text-[#A65C70] flex items-center gap-2"
              >
                <PackageCheck className="w-4 h-4 text-[#A65C70]" />
                <span>Track Order</span>
              </button>
              <button
                onClick={() => handleNav('/about')}
                className="text-left py-2 text-[#6F6769] hover:text-[#272326]"
              >
                About Atelier
              </button>
              <button
                onClick={() => handleNav('/contact')}
                className="text-left py-2 text-[#6F6769] hover:text-[#272326]"
              >
                Contact & Concierge
              </button>
            </nav>

            <div className="mt-auto pt-6 border-t border-[#E8DDDA] space-y-3">
              {user ? (
                <div>
                  <div className="text-xs text-[#6F6769] mb-2">Signed in as <strong className="text-[#272326]">{user.name}</strong></div>
                  <button
                    onClick={() => handleNav('/account')}
                    className="w-full py-2.5 rounded-xl bg-[#FAF5F1] text-[#7D4052] text-xs font-semibold text-center mb-2 block"
                  >
                    My Account Dashboard
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleNav('/admin')}
                      className="w-full py-2.5 rounded-xl bg-[#7D4052] text-white text-xs font-semibold text-center mb-2 block"
                    >
                      Admin Console
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-xs text-red-600 text-center font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => handleNav('/login')}
                    className="w-full py-3 rounded-xl bg-[#7D4052] text-white text-xs font-medium tracking-wide text-center block"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNav('/register')}
                    className="w-full py-3 rounded-xl border border-[#E8DDDA] text-[#272326] text-xs font-medium tracking-wide text-center block"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
