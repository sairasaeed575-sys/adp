# COMFORT — Ladies Garments Ecommerce Platform & Admin System

A production-ready luxury women's fashion ecommerce platform and Shopify-grade admin console built with TypeScript, React, Express, Tailwind CSS, and persistent relational data storage.

---

## 1. Brand & Design Philosophy
**COMFORT** is a premium women's apparel brand inspired by luxury editorial aesthetics and comfortable daily elegance:
- **Color Palette**: Warm Ivory (`#FFFDFC`), Rich Cream (`#FAF5F1`), Dusty Rose, Mauve (`#9C6877`), Deep Rose (`#7D4052`), Primary Rose (`#A65C70`), Champagne Gold (`#C7A26A`), Charcoal (`#272326`), and Border Mauve (`#E8DDDA`).
- **Typography**: Editorial Serif (`Cormorant Garamond`) for titles and headlines; Modern Sans-Serif (`Plus Jakarta Sans`) for catalog, navigation, and administrative controls.
- **Zero Mock Policy**: Every button, variant selector, coupon code, inventory check, order creation, order tracking step, and review moderation action connects to the real backend and persistent database.

---

## 2. Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│                   Vite + React SPA                     │
│  - NavigationContext, AuthContext, CartContext         │
│  - WishlistContext, ToastContext                       │
│  - Storefront Pages (Home, Shop, Product, Checkout)   │
│  - Customer Account (Orders, Tracking, Returns)        │
│  - Shopify-Grade Admin (Inventory, CMS, Settings)     │
└───────────────────────────┬────────────────────────────┘
                            │ REST API + Bearer Tokens
┌───────────────────────────▼────────────────────────────┐
│                  Express Node.js Server                │
│  - server.ts: Vite dev middleware & production static  │
│  - server/auth.ts: Crypto HMAC token security & RBAC   │
│  - server/routes.ts: Full storefront & admin endpoints │
└───────────────────────────┬────────────────────────────┘
                            │ Atomic Transactions & Persistence
┌───────────────────────────▼────────────────────────────┐
│             Persistent Database Layer (server/db.ts)   │
│  - data/comfort_db.json (atomic safe write locks)      │
│  - Users, Products, Variants, Orders, Inventory Logs   │
│  - Coupons, Verified Reviews, Returns, CMS, Audit Logs │
└────────────────────────────────────────────────────────┘
```

---

## 3. Key Implemented Features

### Public Storefront
1. **Homepage CMS**:
   - Announcement bar (customizable from admin)
   - Hero banner with editorial styling, custom call-to-actions, and background photography
   - Four-pillar service bar (Free Shipping, 14-Day Returns, Secure Checkout, Bespoke Care)
   - Circular "Shop by Category" luxury cards
   - Filter tabs: Featured, New In, Best Sellers
   - Verified customer testimonials & Atelier craft manifesto
2. **Shop Catalog (`/shop`, `/shop/new-arrivals`, `/shop/sale`, `/shop/category/:slug`)**:
   - Live search across title, SKU, description, and tags
   - Multi-attribute filters: Category, Subcategory, Price range slider, Available Sizes (XS, S, M, L, XL, XXL), Color families, and In-Stock toggle
   - Sorting: Featured, Newest, Price Low to High, Price High to Low, Best Selling, Highest Rated
   - Product Cards with secondary hover image swap, New/Sale badges, variant size chips, wishlist toggle, and quick view modal
3. **Product Detail Page (`/product/:slug`)**:
   - Multi-image gallery with high-resolution view and thumbnail navigation
   - Variant-level stock checks: shows exact remaining stock e.g. "Only 2 left" if low stock
   - Interactive Size Guide modal with Bust, Waist, Hip, and Length measurements in inches and cm
   - Comprehensive garment specifications: fabric (80s yarn lawn), material, fit, sleeve, length, neckline, occasion, care instructions, origin
   - Verified customer reviews section with 5-star distribution and customer review submission form
   - Related garments recommendations
4. **Cart & Sliding Drawer**:
   - Free shipping progress bar ($50 goal)
   - Item quantity steppers with inventory boundary checks
   - Coupon code redemption (e.g. `WELCOME10`, `ELEGANCE20`, `FREESHIP`)
   - Real-time server-side tax (5%) and shipping calculation
5. **Checkout (`/checkout`)**:
   - Server-side price and stock validation (never trusts client prices)
   - Contact info & saved addresses selector
   - Delivery Tier selection (Standard vs Express)
   - Payment Methods (Online Payment, Cash on Delivery, Bank Transfer)
   - Atomic inventory decrement and order generation (`COM-2026-XXXXXX`)
6. **Order Confirmation & Tracking (`/order-success`, `/track-order`)**:
   - Printable invoice view
   - Live multi-stage courier timeline tracking (Placed -> Confirmed -> Processing -> Packed -> Shipped -> Out for Delivery -> Delivered) with tracking number (AWB) and carrier
7. **Customer Portal (`/account`)**:
   - Orders list with consignment details
   - 14-Day Return request trigger modal
   - Saved Wishlist with "Move to Bag"
   - Delivery addresses manager (add, delete, set default)
   - Security (password change, profile update)

### Shopify-Grade Admin Console (`/admin`)
1. **Dashboard (`/admin`)**:
   - Real KPI tiles: Gross Sales, Net Revenue, Orders count, Registered Patrons, AOV, Low Stock Alerts
   - Recent orders quick management table
   - Low-stock variant replenishment warnings
   - One-click CSV exports for Orders, Inventory, Products, and Customers
2. **Orders (`/admin/orders`)**:
   - Filter by status and payment
   - Order detail drawer with full breakdown
   - Fulfillment status updater with carrier and tracking code (AWB) input
   - Order refund processor with reason audit
   - Printable packing slip
3. **Products & Variants (`/admin/products`)**:
   - Garments catalog table with stock status
   - Comprehensive Product Editor modal: General info, Pricing, Variant Matrix (Size XS-XXL, Color, SKU, Stock), Garment specifications, and Media URLs
4. **Inventory Control (`/admin/inventory`)**:
   - Variant-level stock matrix
   - Stock adjustment modal (Stock In, Stock Out, Damage, Reconciliation) with reason and PO reference
   - Full chronological Inventory Movement Audit History
5. **Customer Management (`/admin/customers`)**:
   - Customer directory with Lifetime Value (LTV), total order counts, and address history
6. **Review Moderation (`/admin/reviews`)**:
   - Queue with Approved, Pending, Rejected, and Flagged tabs
   - Approve, Reject, and Atelier reply publisher
7. **Coupons & Discounts (`/admin/coupons`)**:
   - Percentage or fixed amount coupons with minimum spend, max discount, and expiry
8. **Homepage CMS (`/admin/cms`)**:
   - Live visual editor for announcement bar, hero banners, and trust pillars
9. **Settings & Governance (`/admin/settings`)**:
   - Store name, currency code/symbol, tax rate, shipping fees, and full system audit logs

---

## 4. Preloaded Seed Accounts for Evaluation
The application includes preloaded demo accounts accessible via the bottom-left **Demo Switcher Bar** or direct credentials:

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@comfortgarments.com` | `admin1234` |
| **Customer** | `sairasaeed575@gmail.com` | `customer123` |
| **Customer 2** | `amira.khan@example.com` | `customer123` |

### Sample Tracking Numbers:
- `COM-2026-000101` (Delivered, DHL Express, Customer: Saira Saeed)
- `COM-2026-000102` (Shipped, FedEx International, Customer: Amira Khan)

### Sample Promotional Coupons:
- `WELCOME10`: 10% off for orders over $40
- `ELEGANCE20`: 20% off for orders over $100
- `FREESHIP`: $15 off express shipping credit for orders over $50

---

## 5. Development & Running Locally

```bash
# Install dependencies
npm install

# Start development full-stack server (runs Express + Vite middleware on Port 3000)
npm run dev

# Run TypeScript linter
npm run lint

# Build production assets
npm run build

# Start production server
npm start
```
