import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Order, Product, Review, Address, ReturnRequest } from '../types';
import { 
  User as UserIcon, PackageCheck, Heart, MessageSquare, 
  MapPin, Shield, LogOut, ArrowRight, RotateCcw, 
  Plus, Trash2, Edit2, CheckCircle2, Clock, X, ShoppingBag 
} from 'lucide-react';

export const CustomerAccountPage: React.FC<{ subPage?: string }> = ({ subPage }) => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { navigate } = useNavigation();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'reviews' | 'addresses' | 'security'>(
    (subPage as any) || 'overview'
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [myReturns, setMyReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Return modal state
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Fit / Size issue');
  const [returnComment, setReturnComment] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Address edit state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrFullName, setNewAddrFullName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrLine, setNewAddrLine] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPostal, setNewAddrPostal] = useState('');
  const [newAddrCountry, setNewAddrCountry] = useState('United States');

  // Password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Profile info state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('comfort_auth_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch('/api/orders', { headers }).then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
      fetch('/api/returns/my', { headers }).then(r => r.json()),
    ])
      .then(([ordersData, productsData, returnsData]) => {
        if (ordersData.orders) setOrders(ordersData.orders);
        if (returnsData.returns) setMyReturns(returnsData.returns);

        if (productsData.products) {
          const matched = productsData.products.filter((p: Product) => wishlist.includes(p.id));
          setWishlistProducts(matched);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, wishlist]);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateProfile({ name: profileName, phone: profilePhone });
    setSavingProfile(false);
    if (res.success) {
      showToast('Profile updated successfully', 'success');
    } else {
      showToast(res.error || 'Failed to update', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPass(true);
    const res = await changePassword(currentPass, newPass);
    setChangingPass(false);
    if (res.success) {
      showToast('Password updated successfully', 'success');
      setCurrentPass('');
      setNewPass('');
    } else {
      showToast(res.error || 'Password update failed', 'error');
    }
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: Address = {
      id: `addr_${Date.now()}`,
      fullName: newAddrFullName || user.name,
      phone: newAddrPhone || user.phone || '',
      addressLine: newAddrLine,
      city: newAddrCity,
      state: newAddrState,
      postalCode: newAddrPostal,
      country: newAddrCountry,
      isDefault: (user.addresses?.length || 0) === 0,
    };

    const updatedAddresses = [...(user.addresses || []), newAddr];
    const res = await updateProfile({ addresses: updatedAddresses });
    if (res.success) {
      showToast('New address saved', 'success');
      setIsAddingAddress(false);
      setNewAddrLine('');
      setNewAddrCity('');
      setNewAddrState('');
      setNewAddrPostal('');
    } else {
      showToast(res.error || 'Could not save address', 'error');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const updated = (user.addresses || []).filter(a => a.id !== addressId);
    await updateProfile({ addresses: updated });
    showToast('Address removed', 'info');
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReturn) return;

    setSubmittingReturn(true);
    try {
      const token = localStorage.getItem('comfort_auth_token');
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: selectedOrderForReturn.id,
          items: selectedOrderForReturn.items.map(i => ({
            productId: i.productId,
            productName: i.productName,
            variantId: i.variantId,
            quantity: i.quantity,
            reason: returnReason,
          })),
          comment: returnComment,
        }),
      });
      const data = await res.json();
      setSubmittingReturn(false);
      if (res.ok) {
        showToast('Return request submitted! Our concierge will review shortly.', 'success');
        setSelectedOrderForReturn(null);
        setMyReturns([data.returnRequest, ...myReturns]);
      } else {
        showToast(data.error || 'Return request failed', 'error');
      }
    } catch {
      setSubmittingReturn(false);
      showToast('Network error', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-[#FAF5F1] border border-[#E8DDDA] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#A65C70]">
            Patron Portal
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-medium text-[#272326]">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-[#6F6769] mt-0.5">
            Manage your orders, addresses, and curated bespoke wishlist.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white text-[#7D4052] text-xs font-semibold border border-[#E8DDDA]">
            Status: Active Patron
          </span>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-3 py-1 rounded-full bg-white hover:bg-red-50 text-red-600 text-xs font-semibold border border-[#E8DDDA] transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Nav Sidebar (3 cols) + Content (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-[#FFFDFC] rounded-2xl border border-[#E8DDDA] p-4 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'overview'
                ? 'bg-[#7D4052] text-white shadow-xs'
                : 'text-[#272326] hover:bg-[#FAF5F1]'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Account Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2.5 transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#7D4052] text-white shadow-xs'
                : 'text-[#272326] hover:bg-[#FAF5F1]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <PackageCheck className="w-4 h-4" />
              <span>My Orders & Returns</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 font-bold">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2.5 transition-colors ${
              activeTab === 'wishlist'
                ? 'bg-[#7D4052] text-white shadow-xs'
                : 'text-[#272326] hover:bg-[#FAF5F1]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4" />
              <span>Saved Wishlist</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 font-bold">
              {wishlist.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'addresses'
                ? 'bg-[#7D4052] text-white shadow-xs'
                : 'text-[#272326] hover:bg-[#FAF5F1]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'security'
                ? 'bg-[#7D4052] text-white shadow-xs'
                : 'text-[#272326] hover:bg-[#FAF5F1]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Settings</span>
          </button>
        </aside>

        {/* Tab Content (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#FFFDFC] border border-[#E8DDDA] space-y-1">
                  <span className="text-xs text-[#6F6769]">Total Orders</span>
                  <div className="font-editorial text-3xl font-semibold text-[#7D4052]">
                    {orders.length}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">All authenticated orders</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#FFFDFC] border border-[#E8DDDA] space-y-1">
                  <span className="text-xs text-[#6F6769]">Wishlist Items</span>
                  <div className="font-editorial text-3xl font-semibold text-[#272326]">
                    {wishlist.length}
                  </div>
                  <span className="text-[10px] text-[#A65C70] font-medium">Saved for future shopping</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#FFFDFC] border border-[#E8DDDA] space-y-1">
                  <span className="text-xs text-[#6F6769]">Saved Addresses</span>
                  <div className="font-editorial text-3xl font-semibold text-[#272326]">
                    {user.addresses?.length || 0}
                  </div>
                  <span className="text-[10px] text-[#6F6769]">For express 1-click checkout</span>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="p-6 sm:p-8 bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#FAF5F1]">
                  <h3 className="font-editorial text-xl font-semibold text-[#272326]">
                    Recent Order History
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#A65C70] hover:underline"
                  >
                    View All Orders ({orders.length})
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-[#6F6769] py-4 text-center">
                    You have not placed any orders yet. Discover our latest collections.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 2).map(o => (
                      <div
                        key={o.id}
                        className="p-4 rounded-2xl bg-[#FAF5F1]/50 border border-[#E8DDDA] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-[#7D4052]">{o.orderNumber}</div>
                          <div className="text-[11px] text-[#6F6769] mt-0.5">
                            {new Date(o.createdAt).toLocaleDateString()} • {o.items.length} items
                          </div>
                          <div className="font-medium text-[#272326] mt-1">${o.grandTotal.toFixed(2)}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            o.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.orderStatus}
                          </span>
                          <button
                            onClick={() => navigate(`/track-order`, { orderNumber: o.orderNumber })}
                            className="px-3 py-1.5 rounded-lg bg-white border border-[#E8DDDA] text-xs font-semibold text-[#272326] hover:bg-[#FAF5F1] transition-colors"
                          >
                            Track
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. ORDERS & RETURNS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-editorial text-2xl font-medium text-[#272326]">
                  Your Orders & Consignments
                </h2>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] space-y-3">
                  <PackageCheck className="w-8 h-8 text-[#A65C70] mx-auto opacity-70" />
                  <p className="font-editorial text-xl text-[#272326]">No orders found</p>
                  <p className="text-xs text-[#6F6769]">Explore our unstitched lawn and evening co-ords.</p>
                  <button
                    onClick={() => navigate('/shop')}
                    className="px-6 py-2.5 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className="bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] p-6 space-y-4 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#FAF5F1] gap-2">
                        <div>
                          <div className="font-editorial text-lg font-bold text-[#7D4052]">
                            {order.orderNumber}
                          </div>
                          <span className="text-[11px] text-[#6F6769]">
                            Ordered on {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF5F1] text-[11px] font-medium text-[#6F6769]">
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-12 h-16 object-cover rounded-xl border border-[#E8DDDA]"
                              />
                              <div>
                                <h4 
                                  onClick={() => navigate(`/product/${item.productSlug}`)}
                                  className="font-semibold text-[#272326] hover:text-[#A65C70] cursor-pointer"
                                >
                                  {item.productName}
                                </h4>
                                <p className="text-[11px] text-[#6F6769]">
                                  Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="font-semibold text-[#272326]">
                              ${item.total.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-[#FAF5F1] flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="text-[#6F6769]">
                          Total Paid: <strong className="text-[#272326] font-semibold text-sm">${order.grandTotal.toFixed(2)}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/track-order`, { orderNumber: order.orderNumber, email: order.customerEmail })}
                            className="px-3.5 py-1.5 rounded-xl border border-[#E8DDDA] text-xs font-semibold text-[#272326] hover:bg-[#FAF5F1] transition-colors"
                          >
                            Live Tracking
                          </button>

                          {order.isReturnEligible && order.orderStatus === 'Delivered' && (
                            <button
                              onClick={() => setSelectedOrderForReturn(order)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#FAF5F1] text-[#7D4052] text-xs font-semibold border border-[#E8DDDA] hover:bg-[#E9C8CC]/40 transition-colors flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Request Return</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Return Requests History */}
              {myReturns.length > 0 && (
                <div className="p-6 bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] space-y-4">
                  <h3 className="font-editorial text-xl font-medium text-[#272326]">
                    Submitted Return Inquiries
                  </h3>
                  <div className="divide-y divide-[#FAF5F1] text-xs">
                    {myReturns.map(r => (
                      <div key={r.id} className="py-3 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-[#7D4052]">Order {r.orderNumber}</div>
                          <div className="text-[#6F6769] text-[11px]">Reason: {r.items[0]?.reason}</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-editorial text-2xl font-medium text-[#272326]">
                Saved Wishlist ({wishlistProducts.length})
              </h2>

              {wishlistProducts.length === 0 ? (
                <div className="p-12 text-center bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] space-y-3">
                  <Heart className="w-8 h-8 text-[#A65C70] mx-auto opacity-70" />
                  <p className="font-editorial text-xl text-[#272326]">Your wishlist is waiting for something beautiful</p>
                  <p className="text-xs text-[#6F6769]">Click the heart icon on any garment to save it here.</p>
                  <button
                    onClick={() => navigate('/shop')}
                    className="px-6 py-2.5 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider"
                  >
                    Explore Shop
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistProducts.map(p => (
                    <div
                      key={p.id}
                      className="bg-[#FFFDFC] rounded-2xl border border-[#E8DDDA] overflow-hidden flex flex-col justify-between"
                    >
                      <div className="aspect-[3/4] bg-[#FAF5F1] relative overflow-hidden">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white text-red-500 shadow-md"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 
                          onClick={() => navigate(`/product/${p.slug}`)}
                          className="font-editorial text-base font-semibold text-[#272326] hover:text-[#A65C70] cursor-pointer truncate"
                        >
                          {p.name}
                        </h4>
                        <div className="text-sm font-semibold text-[#7D4052]">
                          ${p.salePrice || p.price}
                        </div>
                        <button
                          onClick={() => {
                            const v = p.variants.find(item => item.stock > 0) || p.variants[0];
                            if (v) {
                              addToCart(p, v, 1);
                              showToast(`Moved ${p.name} to your bag!`, 'success');
                            }
                          }}
                          className="w-full py-2.5 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Move to Bag</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-editorial text-2xl font-medium text-[#272326]">
                  Saved Delivery Addresses
                </h2>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="px-4 py-2 rounded-xl bg-[#7D4052] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#A65C70] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {isAddingAddress && (
                <form onSubmit={handleSaveNewAddress} className="p-6 bg-[#FAF5F1] rounded-3xl border border-[#E8DDDA] space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[#E8DDDA]">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#272326]">New Shipping Address</h3>
                    <button type="button" onClick={() => setIsAddingAddress(false)}>
                      <X className="w-4 h-4 text-[#6F6769]" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Recipient Full Name"
                      value={newAddrFullName}
                      onChange={e => setNewAddrFullName(e.target.value)}
                      required
                      className="px-3 py-2 text-xs bg-white rounded-xl border border-[#E8DDDA]"
                    />
                    <input
                      type="tel"
                      placeholder="Contact Phone"
                      value={newAddrPhone}
                      onChange={e => setNewAddrPhone(e.target.value)}
                      required
                      className="px-3 py-2 text-xs bg-white rounded-xl border border-[#E8DDDA]"
                    />
                    <input
                      type="text"
                      placeholder="Street Address, Apt, Suite"
                      value={newAddrLine}
                      onChange={e => setNewAddrLine(e.target.value)}
                      required
                      className="col-span-2 px-3 py-2 text-xs bg-white rounded-xl border border-[#E8DDDA]"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddrCity}
                      onChange={e => setNewAddrCity(e.target.value)}
                      required
                      className="px-3 py-2 text-xs bg-white rounded-xl border border-[#E8DDDA]"
                    />
                    <input
                      type="text"
                      placeholder="State / Region"
                      value={newAddrState}
                      onChange={e => setNewAddrState(e.target.value)}
                      required
                      className="px-3 py-2 text-xs bg-white rounded-xl border border-[#E8DDDA]"
                    />
                    <input
                      type="text"
                      placeholder="Zip / Postal Code"
                      value={newAddrPostal}
                      onChange={e => setNewAddrPostal(e.target.value)}
                      required
                      className="px-3 py-2 text-xs bg-white rounded-xl border border-[#E8DDDA]"
                    />
                    <select
                      value={newAddrCountry}
                      onChange={e => setNewAddrCountry(e.target.value)}
                      className="px-3 py-2 text-xs bg-white rounded-xl border border-[#E8DDDA]"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-4 py-2.5 text-xs text-[#6F6769]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Address Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses?.map(addr => (
                  <div
                    key={addr.id}
                    className="p-5 rounded-2xl bg-[#FFFDFC] border border-[#E8DDDA] space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#272326]">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-[#A65C70] bg-[#FAF5F1] px-2 py-0.5 rounded-full border border-[#E8DDDA]">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6F6769] leading-relaxed">
                      {addr.addressLine}<br />
                      {addr.city}, {addr.state} {addr.postalCode}<br />
                      {addr.country}
                    </p>
                    <div className="text-[11px] text-[#6F6769]">Phone: {addr.phone}</div>

                    <div className="pt-2 border-t border-[#FAF5F1] flex justify-end">
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs text-red-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. SECURITY & SETTINGS */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              {/* Profile Details */}
              <form onSubmit={handleUpdateProfile} className="p-6 bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] space-y-4">
                <h3 className="font-editorial text-xl font-medium text-[#272326]">
                  Personal Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#272326]">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#272326]">Contact Phone</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={e => setProfilePhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-[#272326]">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-3.5 py-2.5 bg-gray-100 border border-[#E8DDDA] rounded-xl text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A65C70]"
                >
                  {savingProfile ? 'Saving...' : 'Update Profile'}
                </button>
              </form>

              {/* Password Change */}
              <form onSubmit={handleChangePassword} className="p-6 bg-[#FFFDFC] rounded-3xl border border-[#E8DDDA] space-y-4">
                <h3 className="font-editorial text-xl font-medium text-[#272326]">
                  Change Password
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#272326]">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPass}
                      onChange={e => setCurrentPass(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#272326]">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changingPass}
                  className="px-6 py-2.5 rounded-xl bg-[#272326] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7D4052]"
                >
                  {changingPass ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Return Request Modal */}
      {selectedOrderForReturn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FFFDFC] rounded-3xl p-6 sm:p-8 border border-[#E8DDDA] shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-[#E8DDDA]">
              <div>
                <h3 className="font-editorial text-xl font-medium text-[#272326]">
                  Initiate Return for {selectedOrderForReturn.orderNumber}
                </h3>
                <p className="text-xs text-[#6F6769]">Complimentary 14-day exchange and refund</p>
              </div>
              <button onClick={() => setSelectedOrderForReturn(null)}>
                <X className="w-5 h-5 text-[#6F6769]" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#272326]">Primary Return Reason</label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E8DDDA] rounded-xl"
                >
                  <option value="Fit / Size issue">Fit / Size too large or small</option>
                  <option value="Fabric preference">Fabric feel different than expected</option>
                  <option value="Style exchange">Would like to exchange for different color</option>
                  <option value="Damaged in transit">Damaged packaging / item flaw</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#272326]">Comments for Atelier Inspector</label>
                <textarea
                  rows={3}
                  value={returnComment}
                  onChange={e => setReturnComment(e.target.value)}
                  placeholder="Provide any details about pickup timing or sizing preference"
                  className="w-full px-3 py-2 bg-white border border-[#E8DDDA] rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReturn}
                className="w-full py-3 rounded-xl bg-[#7D4052] text-white font-semibold uppercase tracking-wider disabled:opacity-50"
              >
                {submittingReturn ? 'Submitting Request...' : 'Confirm Return Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
