import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Product, ProductVariant, Category } from '../../types';
import { 
  Plus, Search, Edit2, Trash2, Copy, Download, 
  X, Check, Eye, AlertCircle, Sparkles, Image as ImageIcon 
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'variants' | 'specs' | 'media'>('general');
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categorySlug, setCategorySlug] = useState('formal-wear');
  const [subcategory, setSubcategory] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('150');
  const [salePrice, setSalePrice] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');

  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [variants, setVariants] = useState<ProductVariant[]>([
    { id: 'v_s', sku: 'COM-NEW-S', size: 'S', color: 'Dusty Rose', colorHex: '#C98B99', price: 150, stock: 15, reservedStock: 0 },
    { id: 'v_m', sku: 'COM-NEW-M', size: 'M', color: 'Dusty Rose', colorHex: '#C98B99', price: 150, stock: 20, reservedStock: 0 },
    { id: 'v_l', sku: 'COM-NEW-L', size: 'L', color: 'Dusty Rose', colorHex: '#C98B99', price: 150, stock: 10, reservedStock: 0 },
  ]);

  const [specs, setSpecs] = useState({
    fabric: 'Fine Combed Lawn (80s Yarn)',
    material: '100% Breathable Cotton',
    fit: 'Regular Tailored Silhouette',
    sleeve: 'Full Length',
    length: 'Calf Length (44 in)',
    neckline: 'V-Neck',
    occasion: 'Festive & Semi-Formal',
    care: 'Dry clean or gentle hand wash',
    origin: 'Ethically Handcrafted',
  });

  const fetchCatalog = () => {
    setLoading(true);
    const token = localStorage.getItem('comfort_auth_token');
    Promise.all([
      fetch('/api/admin/products', { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }).then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ])
      .then(([prodData, catData]) => {
        if (prodData.products) setProducts(prodData.products);
        if (catData.categories) setCategories(catData.categories);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`COM-GAR-${Math.floor(100 + Math.random() * 900)}`);
    setCategorySlug(categories[0]?.slug || 'formal-wear');
    setSubcategory('');
    setShortDescription('');
    setDescription('');
    setPrice('160');
    setSalePrice('');
    setIsNewArrival(true);
    setIsFeatured(false);
    setIsBestSeller(false);
    setStatus('active');
    setImages(['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80']);
    setVariants([
      { id: `v_${Date.now()}_s`, sku: 'SKU-S', size: 'S', color: 'Dusty Rose', colorHex: '#C98B99', price: 160, stock: 15, reservedStock: 0 },
      { id: `v_${Date.now()}_m`, sku: 'SKU-M', size: 'M', color: 'Dusty Rose', colorHex: '#C98B99', price: 160, stock: 20, reservedStock: 0 },
      { id: `v_${Date.now()}_l`, sku: 'SKU-L', size: 'L', color: 'Dusty Rose', colorHex: '#C98B99', price: 160, stock: 10, reservedStock: 0 },
    ]);
    setActiveTab('general');
    setIsEditorOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategorySlug(p.categorySlug);
    setSubcategory(p.subcategory || '');
    setShortDescription(p.shortDescription);
    setDescription(p.description);
    setPrice(String(p.price));
    setSalePrice(p.salePrice ? String(p.salePrice) : '');
    setIsNewArrival(Boolean(p.isNewArrival));
    setIsFeatured(Boolean(p.isFeatured));
    setIsBestSeller(Boolean(p.isBestSeller));
    setStatus(p.status);
    setImages(p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80']);
    setVariants(p.variants);
    setSpecs(p.specifications);
    setActiveTab('general');
    setIsEditorOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    const basePrice = Number(price);
    const saleNum = salePrice ? Number(salePrice) : undefined;
    const catObj = categories.find(c => c.slug === categorySlug);

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      categorySlug,
      categoryName: catObj ? catObj.name : 'Garments',
      subcategory: subcategory.trim() || undefined,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      price: basePrice,
      salePrice: saleNum,
      discountPercentage: saleNum && saleNum < basePrice ? Math.round(((basePrice - saleNum) / basePrice) * 100) : undefined,
      collectionSlugs: ['spring-summer'],
      images,
      variants,
      specifications: specs,
      isNewArrival,
      isFeatured,
      isBestSeller,
      status,
      tags: [categorySlug, subcategory, 'comfort', 'fashion'].filter(Boolean),
    };

    setSaving(true);
    const token = localStorage.getItem('comfort_auth_token');
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        showToast(editingProduct ? 'Product updated successfully' : 'Product created', 'success');
        setIsEditorOpen(false);
        fetchCatalog();
      } else {
        showToast(data.error || 'Failed to save product', 'error');
      }
    } catch {
      setSaving(false);
      showToast('Network error saving product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const token = localStorage.getItem('comfort_auth_token');
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        showToast(`Deleted ${name}`, 'info');
        setProducts(products.filter(p => p.id !== id));
      } else {
        showToast('Failed to delete product', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.categorySlug === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-medium text-[#272326]">
            Garments & Variants Catalog
          </h1>
          <p className="text-xs text-[#6F6769] mt-0.5">
            Configure women’s apparel, variant-level SKU inventories, fabric specifications, and imagery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.href = '/api/admin/export/products'}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E8DDDA] text-xs font-semibold text-[#272326] hover:bg-[#FAF5F1] transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#6F6769]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Garment</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-[#E8DDDA] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6F6769] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by garment name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none focus:border-[#A65C70]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-[#6F6769] font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl font-medium text-[#272326] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#E8DDDA] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF5F1] text-[#7D4052] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Garment</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Variants & Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF5F1] font-medium text-[#272326]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#6F6769]">Loading catalog...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#6F6769]">No garments found.</td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF5F1]/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-12 h-16 object-cover rounded-xl border border-[#E8DDDA]"
                          />
                          <div>
                            <div className="font-semibold text-[#272326]">{p.name}</div>
                            <div className="text-[10px] text-[#A65C70]">
                              {p.isNewArrival && '• New In '}
                              {p.isBestSeller && '• Best Seller '}
                              {p.isFeatured && '• Featured'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-[#7D4052]">
                        {p.sku}
                      </td>
                      <td className="p-4 text-[#6F6769]">
                        {p.categoryName}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">${p.salePrice || p.price}</div>
                        {p.salePrice && (
                          <span className="text-[10px] text-gray-400 line-through">${p.price}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{p.variants.length} sizes</span>
                          <span className="text-[#E8DDDA]">•</span>
                          <span className={totalStock <= 5 ? 'text-amber-600 font-bold' : 'text-emerald-700'}>
                            {totalStock} in stock
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg border border-[#E8DDDA] hover:bg-[#FAF5F1] text-[#7D4052]"
                            title="Edit Garment"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg border border-[#E8DDDA] hover:bg-red-50 text-red-600"
                            title="Delete Garment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal with Tabs */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProduct}
            className="w-full max-w-4xl bg-[#FFFDFC] rounded-3xl shadow-2xl border border-[#E8DDDA] max-h-[90vh] flex flex-col overflow-hidden animate-scale-up text-xs"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E8DDDA] flex items-center justify-between bg-[#FAF5F1]/50">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#A65C70]">
                  Garment Architect
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#272326]">
                  {editingProduct ? `Edit: ${editingProduct.name}` : 'Create New Garment'}
                </h2>
              </div>
              <button type="button" onClick={() => setIsEditorOpen(false)} className="p-1">
                <X className="w-5 h-5 text-[#6F6769]" />
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-[#E8DDDA] px-6 gap-6 bg-[#FAF5F1]/30">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`py-3 font-semibold uppercase tracking-wider border-b-2 ${
                  activeTab === 'general' ? 'border-[#7D4052] text-[#7D4052]' : 'border-transparent text-[#6F6769]'
                }`}
              >
                1. General Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className={`py-3 font-semibold uppercase tracking-wider border-b-2 ${
                  activeTab === 'pricing' ? 'border-[#7D4052] text-[#7D4052]' : 'border-transparent text-[#6F6769]'
                }`}
              >
                2. Pricing & Status
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('variants')}
                className={`py-3 font-semibold uppercase tracking-wider border-b-2 ${
                  activeTab === 'variants' ? 'border-[#7D4052] text-[#7D4052]' : 'border-transparent text-[#6F6769]'
                }`}
              >
                3. Variants & Stock ({variants.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`py-3 font-semibold uppercase tracking-wider border-b-2 ${
                  activeTab === 'specs' ? 'border-[#7D4052] text-[#7D4052]' : 'border-transparent text-[#6F6769]'
                }`}
              >
                4. Specifications
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`py-3 font-semibold uppercase tracking-wider border-b-2 ${
                  activeTab === 'media' ? 'border-[#7D4052] text-[#7D4052]' : 'border-transparent text-[#6F6769]'
                }`}
              >
                5. Media & Imagery
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: GENERAL */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-semibold text-[#272326]">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Terracotta Flared Palazzo Suit"
                        className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#272326]">Base SKU *</label>
                      <input
                        type="text"
                        required
                        value={sku}
                        onChange={e => setSku(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#272326]">Primary Category</label>
                      <select
                        value={categorySlug}
                        onChange={e => setCategorySlug(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-semibold text-[#272326]">Short Tagline Summary</label>
                      <input
                        type="text"
                        value={shortDescription}
                        onChange={e => setShortDescription(e.target.value)}
                        placeholder="One sentence description for catalog cards"
                        className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-semibold text-[#272326]">Full Product Description</label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Detailed editorial description of craftsmanship and fabric drape..."
                        className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING */}
              {activeTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#272326]">Regular Retail Price ($) *</label>
                      <input
                        type="number"
                        required
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none font-semibold text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#272326]">Sale / Promotional Price ($)</label>
                      <input
                        type="number"
                        value={salePrice}
                        onChange={e => setSalePrice(e.target.value)}
                        placeholder="Leave blank if not on sale"
                        className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl focus:outline-none font-semibold text-sm text-[#7D4052]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#272326]">Catalog Status</label>
                      <select
                        value={status}
                        onChange={e => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
                      >
                        <option value="active">Active (Visible in Storefront)</option>
                        <option value="draft">Draft (Hidden)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 pt-4 border-t border-[#FAF5F1] space-y-2">
                      <label className="font-semibold text-[#272326] block">Marketing Badges</label>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isNewArrival}
                            onChange={e => setIsNewArrival(e.target.checked)}
                            className="rounded accent-[#7D4052]"
                          />
                          <span>New Arrival Badge</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={e => setIsFeatured(e.target.checked)}
                            className="rounded accent-[#7D4052]"
                          />
                          <span>Homepage Featured</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isBestSeller}
                            onChange={e => setIsBestSeller(e.target.checked)}
                            className="rounded accent-[#7D4052]"
                          />
                          <span>Best Seller Highlight</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VARIANTS */}
              {activeTab === 'variants' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[#6F6769]">Variant-level inventory allows precise tracking of sizes and colors.</p>
                    <button
                      type="button"
                      onClick={() => {
                        const newV: ProductVariant = {
                          id: `v_${Date.now()}`,
                          sku: `${sku || 'COM'}-XL`,
                          size: 'XL',
                          color: variants[0]?.color || 'Dusty Rose',
                          colorHex: variants[0]?.colorHex || '#C98B99',
                          price: Number(price),
                          stock: 10,
                          reservedStock: 0,
                        };
                        setVariants([...variants, newV]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#7D4052] text-white font-semibold"
                    >
                      + Add Size Variant
                    </button>
                  </div>

                  <div className="space-y-3">
                    {variants.map((v, idx) => (
                      <div key={v.id} className="p-3 rounded-2xl bg-[#FAF5F1]/60 border border-[#E8DDDA] grid grid-cols-5 gap-2 items-center">
                        <div>
                          <label className="text-[10px] text-[#6F6769] block">Size</label>
                          <select
                            value={v.size}
                            onChange={e => {
                              const updated = [...variants];
                              updated[idx].size = e.target.value as any;
                              setVariants(updated);
                            }}
                            className="w-full px-2 py-1 bg-white border border-[#E8DDDA] rounded-lg font-semibold"
                          >
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-[#6F6769] block">Color Name</label>
                          <input
                            type="text"
                            value={v.color}
                            onChange={e => {
                              const updated = [...variants];
                              updated[idx].color = e.target.value;
                              setVariants(updated);
                            }}
                            className="w-full px-2 py-1 bg-white border border-[#E8DDDA] rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-[#6F6769] block">Variant SKU</label>
                          <input
                            type="text"
                            value={v.sku}
                            onChange={e => {
                              const updated = [...variants];
                              updated[idx].sku = e.target.value;
                              setVariants(updated);
                            }}
                            className="w-full px-2 py-1 bg-white border border-[#E8DDDA] rounded-lg font-mono text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-[#6F6769] block">Available Stock</label>
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={e => {
                              const updated = [...variants];
                              updated[idx].stock = Number(e.target.value);
                              setVariants(updated);
                            }}
                            className="w-full px-2 py-1 bg-white border border-[#E8DDDA] rounded-lg font-bold"
                          />
                        </div>

                        <div className="text-right pt-3">
                          <button
                            type="button"
                            onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:underline text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SPECS */}
              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#272326]">Fabric</label>
                    <input
                      type="text"
                      value={specs.fabric}
                      onChange={e => setSpecs({ ...specs, fabric: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#272326]">Material</label>
                    <input
                      type="text"
                      value={specs.material}
                      onChange={e => setSpecs({ ...specs, material: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#272326]">Tailored Fit</label>
                    <input
                      type="text"
                      value={specs.fit}
                      onChange={e => setSpecs({ ...specs, fit: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#272326]">Care Instructions</label>
                    <input
                      type="text"
                      value={specs.care}
                      onChange={e => setSpecs({ ...specs, care: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-[#272326]">Origin Atelier</label>
                    <input
                      type="text"
                      value={specs.origin}
                      onChange={e => setSpecs({ ...specs, origin: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: MEDIA */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Add image URL (Unsplash or CDN link)..."
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#FAF5F1]/50 border border-[#E8DDDA] rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newImageUrl.trim()) {
                          setImages([...images, newImageUrl.trim()]);
                          setNewImageUrl('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-[#7D4052] text-white font-semibold"
                    >
                      Add Image
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden border border-[#E8DDDA] relative group bg-[#FAF5F1]">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#E8DDDA] flex justify-end gap-3 bg-[#FAF5F1]/50">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-[#E8DDDA] text-[#6F6769]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#7D4052] text-white font-semibold uppercase tracking-wider hover:bg-[#A65C70] disabled:opacity-50"
              >
                {saving ? 'Persisting...' : 'Save Garment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
