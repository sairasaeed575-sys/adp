import React, { useState } from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { SearchModal } from './components/common/SearchModal';
import { DemoSwitcherBar } from './components/common/DemoSwitcherBar';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { CustomerAccountPage } from './pages/CustomerAccountPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { AboutPage, ContactPage, FAQPage, PolicyPage } from './pages/StaticPages';

import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminCMS } from './pages/admin/AdminCMS';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminSettings } from './pages/admin/AdminSettings';

const RouterView: React.FC = () => {
  const { currentPath } = useNavigation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 1. ADMIN PANEL ROUTES
  if (currentPath.startsWith('/admin')) {
    let activeNav = 'dashboard';
    let content = <AdminDashboard />;

    if (currentPath === '/admin/orders') {
      activeNav = 'orders';
      content = <AdminOrders />;
    } else if (currentPath === '/admin/products') {
      activeNav = 'products';
      content = <AdminProducts />;
    } else if (currentPath === '/admin/inventory') {
      activeNav = 'inventory';
      content = <AdminInventory />;
    } else if (currentPath === '/admin/customers') {
      activeNav = 'customers';
      content = <AdminCustomers />;
    } else if (currentPath === '/admin/reviews') {
      activeNav = 'reviews';
      content = <AdminReviews />;
    } else if (currentPath === '/admin/coupons') {
      activeNav = 'coupons';
      content = <AdminCoupons />;
    } else if (currentPath === '/admin/cms') {
      activeNav = 'cms';
      content = <AdminCMS />;
    } else if (currentPath === '/admin/messages') {
      activeNav = 'messages';
      content = <AdminMessages />;
    } else if (currentPath === '/admin/settings') {
      activeNav = 'settings';
      content = <AdminSettings />;
    }

    return (
      <AdminLayout activeNav={activeNav}>
        {content}
      </AdminLayout>
    );
  }

  // 2. PUBLIC STOREFRONT ROUTES
  let storefrontContent = <HomePage />;

  if (currentPath === '/shop') {
    storefrontContent = <ShopPage />;
  } else if (currentPath === '/shop/new-arrivals') {
    storefrontContent = <ShopPage initialFilter="new-arrivals" />;
  } else if (currentPath === '/shop/sale') {
    storefrontContent = <ShopPage initialFilter="sale" />;
  } else if (currentPath.startsWith('/shop/category/')) {
    const slug = currentPath.replace('/shop/category/', '');
    storefrontContent = <ShopPage categorySlug={slug} />;
  } else if (currentPath.startsWith('/product/')) {
    const slug = currentPath.replace('/product/', '');
    storefrontContent = <ProductDetailPage slug={slug} />;
  } else if (currentPath === '/checkout') {
    storefrontContent = <CheckoutPage />;
  } else if (currentPath === '/order-success') {
    storefrontContent = <OrderSuccessPage />;
  } else if (currentPath === '/track-order') {
    storefrontContent = <TrackOrderPage />;
  } else if (currentPath === '/login') {
    storefrontContent = <LoginPage />;
  } else if (currentPath === '/register') {
    storefrontContent = <RegisterPage />;
  } else if (currentPath.startsWith('/account')) {
    const sub = currentPath.replace('/account/', '').replace('/account', '');
    storefrontContent = <CustomerAccountPage subPage={sub} />;
  } else if (currentPath === '/about') {
    storefrontContent = <AboutPage />;
  } else if (currentPath === '/contact') {
    storefrontContent = <ContactPage />;
  } else if (currentPath === '/faq') {
    storefrontContent = <FAQPage />;
  } else if (currentPath === '/shipping-policy') {
    storefrontContent = <PolicyPage type="shipping" />;
  } else if (currentPath === '/return-policy') {
    storefrontContent = <PolicyPage type="returns" />;
  } else if (currentPath === '/privacy') {
    storefrontContent = <PolicyPage type="privacy" />;
  } else if (currentPath === '/terms') {
    storefrontContent = <PolicyPage type="terms" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDFC] text-[#272326]">
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
      <main className="flex-1">
        {storefrontContent}
      </main>
      <Footer />
      <CartDrawer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <DemoSwitcherBar />
    </div>
  );
};

export default function App() {
  return (
    <NavigationProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <RouterView />
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </NavigationProvider>
  );
}
