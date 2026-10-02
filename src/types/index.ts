export type Role = 'super_admin' | 'admin' | 'inventory_manager' | 'order_manager' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt: string;
  status: 'active' | 'suspended';
  addresses: Address[];
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
  colorHex: string;
  price: number;
  salePrice?: number;
  stock: number;
  reservedStock: number;
}

export interface ProductSpecification {
  fabric: string;
  material: string;
  fit: string;
  sleeve: string;
  length: string;
  neckline: string;
  occasion: string;
  care: string;
  origin: string;
  composition?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice?: number;
  discountPercentage?: number;
  categorySlug: string;
  categoryName: string;
  subcategory?: string;
  collectionSlugs: string[];
  images: string[];
  variants: ProductVariant[];
  specifications: ProductSpecification;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  status: 'active' | 'draft' | 'archived';
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  totalSold: number;
  // Computed dynamically from approved reviews
  rating?: number;
  reviewCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  bannerImage?: string;
  displayOrder: number;
  isActive: boolean;
  subcategories: string[];
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  bannerImage?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variantId: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  salePrice?: number;
  quantity: number;
}

export type OrderStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'
  | 'Refunded';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'Partially Refunded';
export type PaymentMethod = 'Cash on Delivery' | 'Online Payment' | 'Bank Transfer';

export interface OrderTimelineEvent {
  timestamp: string;
  status: OrderStatus;
  note: string;
  location?: string;
  updatedBy?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variantId: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. COM-2026-000123
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  deliveryMethod: string;
  shippingFee: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  taxAmount: number;
  grandTotal: number;
  notes?: string;
  carrier?: string;
  trackingNumber?: string;
  statusHistory: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
  isReturnEligible?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrder: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderNumber?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  adminReply?: string;
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: {
    productId: string;
    productName: string;
    variantId: string;
    quantity: number;
    reason: string;
  }[];
  comment: string;
  status: 'Requested' | 'Approved' | 'Rejected' | 'Pickup Scheduled' | 'Received' | 'Inspection' | 'Refunded';
  refundAmount?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  variantId: string;
  sku: string;
  productName: string;
  changeType: 'stock_in' | 'stock_out' | 'sold' | 'return' | 'adjustment' | 'damage';
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: string; // Order # or Batch #
  user: string;
  timestamp: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  currencyCode: string;
  currencySymbol: string;
  taxRatePercent: number;
  isTaxInclusive: boolean;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  supportEmail: string;
  supportPhone: string;
  announcementBarText: string;
  announcementBarEnabled: boolean;
}

export interface HomepageCMS {
  announcementBar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  hero: {
    badge: string;
    title: string;
    description: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    image: string;
    secondaryBannerImage: string;
    secondaryBadge: string;
    secondaryTitle: string;
    secondarySubtitle: string;
  };
  trustBar: {
    title: string;
    subtitle: string;
    icon: string;
  }[];
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
}
