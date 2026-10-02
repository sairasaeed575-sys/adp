import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Product, ProductVariant, Review } from '../types';
import { 
  Star, Heart, ShoppingBag, ShieldCheck, Truck, RotateCcw, 
  Ruler, Check, Plus, Minus, Share2, Sparkles, MessageSquare, 
  ChevronRight, ArrowLeft, X 
} from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const { navigate } = useNavigation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'shipping'>('specs');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);

  // Review submission state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          const prod: Product = data.product;
          setProduct(prod);
          setSelectedImage(prod.images[0] || '');
          const available = prod.variants.find(v => v.stock > 0) || prod.variants[0];
          setSelectedVariant(available);

          // Fetch reviews
          fetch(`/api/reviews?productId=${prod.id}`)
            .then(r => r.json())
            .then(rData => {
              if (rData.reviews) setReviews(rData.reviews);
            })
            .catch(console.error);

          // Fetch related
          fetch(`/api/products?category=${prod.categorySlug}`)
            .then(r => r.json())
            .then(relData => {
              if (relData.products) {
                setRelatedProducts(relData.products.filter((p: Product) => p.id !== prod.id).slice(0, 3));
              }
            })
            .catch(console.error);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#A65C70] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#6F6769]">Unfolding luxury garment details...</p>
      </div>
    );
  }

  if (!product || !selectedVariant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <p className="font-editorial text-2xl text-[#272326]">Garment Not Found</p>
        <p className="text-xs text-[#6F6769]">The garment you are looking for may have been archived or moved.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = selectedVariant.stock <= 0;
  const isLowStock = !isOutOfStock && selectedVariant.stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, selectedVariant, quantity);
    if (res.success) {
      showToast(`Added ${quantity}x ${product.name} (Size: ${selectedVariant.size}) to your bag.`, 'success');
    } else {
      showToast(res.message || 'Error adding to cart', 'error');
    }
  };

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product.id);
    showToast(
      added ? `Saved "${product.name}" to your wishlist.` : `Removed "${product.name}" from your wishlist.`,
      added ? 'success' : 'info'
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to submit a review.', 'info');
      navigate('/login');
      return;
    }
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      showToast('Please enter both a title and review comment.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('comfort_auth_token')}`,
        },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle.trim(),
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      setSubmittingReview(false);
      if (res.ok) {
        showToast('Your review has been submitted and approved!', 'success');
        setReviews([data.review, ...reviews]);
        setReviewTitle('');
        setReviewComment('');
      } else {
        showToast(data.error || 'Failed to submit review', 'error');
      }
    } catch {
      setSubmittingReview(false);
      showToast('Network error submitting review', 'error');
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating || '5.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#6F6769]">
        <button onClick={() => navigate('/')} className="hover:text-[#A65C70] transition-colors">Home</button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate('/shop')} className="hover:text-[#A65C70] transition-colors">Shop</button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate(`/shop/category/${product.categorySlug}`)} className="hover:text-[#A65C70] transition-colors">
          {product.categoryName}
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#272326] font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14">
        {/* Gallery Left (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-[#FAF5F1] border border-[#E8DDDA] shadow-xs relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.salePrice && product.discountPercentage && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#A65C70] text-white text-xs font-semibold tracking-wider shadow-sm">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-[#7D4052] shadow-md scale-102'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Selection Right (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A65C70] uppercase tracking-widest">
                {product.categoryName} {product.subcategory ? `• ${product.subcategory}` : ''}
              </span>
              <span className="text-xs text-[#6F6769] font-mono">SKU: {selectedVariant.sku}</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#272326]">
              {product.name}
            </h1>

            {/* Rating Stars & Reviews link */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center text-[#C7A26A]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(Number(avgRating)) ? 'fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-[#272326]">{avgRating}</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-[#6F6769] hover:text-[#A65C70] underline transition-colors"
              >
                ({reviews.length} verified reviews)
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2">
              {product.salePrice ? (
                <>
                  <span className="font-editorial text-3xl font-semibold text-[#7D4052]">
                    ${product.salePrice}
                  </span>
                  <span className="text-base text-gray-400 line-through">
                    ${product.price}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#E9C8CC] text-[#7D4052] text-xs font-bold">
                    Save ${product.price - product.salePrice}
                  </span>
                </>
              ) : (
                <span className="font-editorial text-3xl font-semibold text-[#272326]">
                  ${product.price}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#6F6769] leading-relaxed pt-1">
              {product.description}
            </p>

            {/* Variant Size Selector with Variant Stock Status */}
            <div className="space-y-3 pt-4 border-t border-[#E8DDDA]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#272326]">Size Selection</span>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[#A65C70] hover:underline flex items-center gap-1 font-medium"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>View Size Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      selectedVariant.id === v.id
                        ? 'border-[#7D4052] bg-[#7D4052] text-white shadow-xs'
                        : v.stock > 0
                        ? 'border-[#E8DDDA] text-[#272326] bg-[#FAF5F1]/50 hover:border-[#A65C70]'
                        : 'border-[#E8DDDA] text-gray-300 line-through bg-gray-50 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>

              {/* Live Variant Stock Status Notice */}
              <div className="text-xs pt-1">
                {isOutOfStock ? (
                  <span className="text-red-600 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                    Currently Out of Stock in Size {selectedVariant.size}.
                  </span>
                ) : isLowStock ? (
                  <span className="text-amber-700 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                    Limited Availability: Only <strong>{selectedVariant.stock} items remaining</strong> in Size {selectedVariant.size}.
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                    In Stock & Ready to Dispatch (Size {selectedVariant.size} • {selectedVariant.color}).
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Stepper & Add to Cart */}
            <div className="space-y-3 pt-4 border-t border-[#E8DDDA]">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#E8DDDA] rounded-xl overflow-hidden bg-[#FAF5F1]/50">
                  <button
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-3 text-[#272326] hover:bg-[#FAF5F1] transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold px-4 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= selectedVariant.stock || isOutOfStock}
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-3 text-[#272326] hover:bg-[#FAF5F1] transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-[#7D4052] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#A65C70] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#7D4052]/20 disabled:opacity-40"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}</span>
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    isWishlisted
                      ? 'border-[#A65C70] bg-[#A65C70] text-white'
                      : 'border-[#E8DDDA] text-[#272326] hover:bg-[#FAF5F1] hover:text-[#A65C70]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Trust highlights */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-[#6F6769]">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF5F1]/50 border border-[#E8DDDA]">
                  <Truck className="w-4 h-4 text-[#A65C70]" />
                  <span>Free Express Delivery above $50</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF5F1]/50 border border-[#E8DDDA]">
                  <RotateCcw className="w-4 h-4 text-[#A65C70]" />
                  <span>14-Day Complimentary Exchange</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Tabs Section: Specifications, Reviews, Shipping */}
      <section className="pt-8 border-t border-[#E8DDDA]">
        <div className="flex border-b border-[#E8DDDA] gap-8">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'specs'
                ? 'border-[#7D4052] text-[#7D4052]'
                : 'border-transparent text-[#6F6769] hover:text-[#272326]'
            }`}
          >
            Garment Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'reviews'
                ? 'border-[#7D4052] text-[#7D4052]'
                : 'border-transparent text-[#6F6769] hover:text-[#272326]'
            }`}
          >
            Verified Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-4 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'shipping'
                ? 'border-[#7D4052] text-[#7D4052]'
                : 'border-transparent text-[#6F6769] hover:text-[#272326]'
            }`}
          >
            Shipping & Return Policies
          </button>
        </div>

        <div className="py-8">
          {/* 1. Specifications Tab */}
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-[#FAF5F1] text-xs">
                  <span className="text-[#6F6769]">Primary Fabric</span>
                  <span className="font-semibold text-[#272326]">{product.specifications.fabric}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#FAF5F1] text-xs">
                  <span className="text-[#6F6769]">Material Fiber</span>
                  <span className="font-semibold text-[#272326]">{product.specifications.material}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#FAF5F1] text-xs">
                  <span className="text-[#6F6769]">Tailoring Fit</span>
                  <span className="font-semibold text-[#272326]">{product.specifications.fit}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#FAF5F1] text-xs">
                  <span className="text-[#6F6769]">Sleeve Style</span>
                  <span className="font-semibold text-[#272326]">{product.specifications.sleeve}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#FAF5F1] text-xs">
                  <span className="text-[#6F6769]">Garment Length</span>
                  <span className="font-semibold text-[#272326]">{product.specifications.length}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-[#FAF5F1] text-xs">
                  <span className="text-[#6F6769]">Neckline</span>
                  <span className="font-semibold text-[#272326]">{product.specifications.neckline}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#FAF5F1] text-xs">
                  <span className="text-[#6F6769]">Occasion Suitability</span>
                  <span className="font-semibold text-[#272326]">{product.specifications.occasion}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#FAF5F1] text-xs">
                  <span className="text-[#6F6769]">Care Instructions</span>
                  <span className="font-semibold text-[#272326]">{product.specifications.care}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#FAF5F1] text-xs">
                  <span className="text-[#6F6769]">Country of Origin</span>
                  <span className="font-semibold text-[#272326]">{product.specifications.origin}</span>
                </div>
                {product.specifications.composition && (
                  <div className="flex justify-between py-2 border-b border-[#FAF5F1] text-xs">
                    <span className="text-[#6F6769]">Fiber Breakdown</span>
                    <span className="font-semibold text-[#272326]">{product.specifications.composition}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Reviews List (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <h3 className="font-editorial text-2xl font-medium text-[#272326]">
                  Verified Customer Feedback
                </h3>

                {reviews.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#FAF5F1]/50 border border-[#E8DDDA] text-center space-y-2">
                    <MessageSquare className="w-6 h-6 text-[#A65C70] mx-auto opacity-70" />
                    <p className="font-editorial text-lg text-[#272326]">No reviews yet</p>
                    <p className="text-xs text-[#6F6769]">
                      Be the first to share your experience with this garment.
                    </p>
                  </div>
                ) : (
                  reviews.map(rev => (
                    <div
                      key={rev.id}
                      className="p-6 rounded-2xl bg-[#FFFDFC] border border-[#E8DDDA] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[#272326]">{rev.customerName}</span>
                          {rev.isVerifiedPurchase && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#6F6769]">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center text-[#C7A26A]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>

                      <h4 className="text-xs font-semibold text-[#272326]">{rev.title}</h4>
                      <p className="text-xs text-[#6F6769] leading-relaxed">{rev.comment}</p>

                      {rev.adminReply && (
                        <div className="mt-3 p-3 rounded-xl bg-[#FAF5F1] border-l-2 border-[#A65C70] text-xs space-y-1">
                          <div className="font-semibold text-[#7D4052]">COMFORT Atelier Response:</div>
                          <div className="text-[#6F6769] italic">{rev.adminReply}</div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Write a Review Box (5 cols) */}
              <div className="lg:col-span-5 bg-[#FAF5F1] rounded-3xl p-6 sm:p-8 border border-[#E8DDDA] space-y-4">
                <div>
                  <h4 className="font-editorial text-xl font-medium text-[#272326]">
                    Write a Review
                  </h4>
                  <p className="text-xs text-[#6F6769] mt-0.5">
                    Share your thoughts on sizing, fabric drape, and stitch quality.
                  </p>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Rating Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#272326]">Your Rating</label>
                    <div className="flex items-center gap-1 text-[#C7A26A]">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= reviewRating ? 'fill-current' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#272326]">Review Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. Exquisite lawn fabric and royal fit"
                      value={reviewTitle}
                      onChange={e => setReviewTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-[#E8DDDA] focus:outline-none focus:border-[#A65C70]"
                    />
                  </div>

                  {/* Review Body */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#272326]">Detailed Thoughts</label>
                    <textarea
                      rows={4}
                      placeholder="How did the fabric feel? Was the length accurate to the size guide?"
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-[#E8DDDA] focus:outline-none focus:border-[#A65C70]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-3 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A65C70] transition-colors disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 3. Shipping Tab */}
          {activeTab === 'shipping' && (
            <div className="max-w-3xl space-y-6 text-xs text-[#6F6769] leading-relaxed">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-[#272326]">Domestic & Worldwide Shipping</h4>
                <p>
                  All orders are dispatched in custom keepsake garment boxes wrapped in archival tissue and silk ribbons. Standard shipping takes 3-5 business days. Express shipping takes 2-3 business days. Orders exceeding $50 receive complimentary express dispatch.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-[#272326]">Hassle-Free 14-Day Returns</h4>
                <p>
                  Unworn, unaltered garments with original atelier tags intact can be returned or exchanged within 14 calendar days of delivery. Return requests can be triggered directly from your customer account portal.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-[#E8DDDA] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-[#272326]">
              Complete Your Wardrobe
            </h2>
            <button
              onClick={() => navigate('/shop')}
              className="text-xs font-semibold text-[#A65C70] hover:underline"
            >
              Explore Collection
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={() => navigate(`/product/${p.slug}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#FFFDFC] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8DDDA] space-y-6 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DDDA]">
              <div>
                <h3 className="font-editorial text-2xl font-medium text-[#272326]">
                  Garment Size Guide
                </h3>
                <p className="text-xs text-[#6F6769]">Measurements are in inches (standard body fit)</p>
              </div>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-1 text-[#6F6769] hover:text-[#272326]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF5F1] text-[#7D4052] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3 rounded-l-xl">Size</th>
                    <th className="p-3">Bust (in)</th>
                    <th className="p-3">Waist (in)</th>
                    <th className="p-3">Hip (in)</th>
                    <th className="p-3 rounded-r-xl">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF5F1] font-medium text-[#272326]">
                  <tr>
                    <td className="p-3 font-bold text-[#A65C70]">XS</td>
                    <td className="p-3">34</td>
                    <td className="p-3">28</td>
                    <td className="p-3">37</td>
                    <td className="p-3">42</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#A65C70]">S</td>
                    <td className="p-3">36</td>
                    <td className="p-3">30</td>
                    <td className="p-3">39</td>
                    <td className="p-3">43</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#A65C70]">M</td>
                    <td className="p-3">38</td>
                    <td className="p-3">32</td>
                    <td className="p-3">41</td>
                    <td className="p-3">44</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#A65C70]">L</td>
                    <td className="p-3">41</td>
                    <td className="p-3">35</td>
                    <td className="p-3">44</td>
                    <td className="p-3">44</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#A65C70]">XL</td>
                    <td className="p-3">44</td>
                    <td className="p-3">38</td>
                    <td className="p-3">47</td>
                    <td className="p-3">45</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-[#A65C70]">XXL</td>
                    <td className="p-3">47</td>
                    <td className="p-3">41</td>
                    <td className="p-3">50</td>
                    <td className="p-3">45</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF5F1] text-xs text-[#6F6769] space-y-1">
              <strong className="text-[#272326]">Measurement Advice:</strong>
              <p>
                Measure across the fullest part of your bust while keeping the tape parallel to the floor. If you fall between two sizes, we recommend sizing up for a relaxed luxury drape.
              </p>
            </div>

            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full py-3 rounded-xl bg-[#7D4052] text-white text-xs font-semibold uppercase tracking-wider"
            >
              Close Size Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
