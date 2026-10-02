import express, { Response } from 'express';
import { db } from './db';
import { 
  AuthenticatedRequest, 
  generateToken, 
  requireAuth, 
  requireAdmin 
} from './auth';
import { Order, OrderItem, Review, ReturnRequest } from '../src/types';

export const apiRouter = express.Router();

// ----------------------------------------------------
// AUTHENTICATION & CUSTOMER ACCOUNT
// ----------------------------------------------------

apiRouter.post('/auth/register', (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const newUser = db.createUser(
      {
        name,
        email,
        phone,
        role: 'customer',
        addresses: [],
      },
      password
    );

    const token = generateToken(newUser);
    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: newUser,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

apiRouter.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact support.' });
    }

    const isValid = db.verifyPassword(user.id, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    db.logAudit(user.name, 'User Login', 'User', user.id, `User logged in from ${req.ip || 'web'}`);

    return res.json({
      message: 'Logged in successfully',
      token,
      user,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Demo switch: lets testers and reviewers seamlessly switch between Super Admin and Customer
apiRouter.post('/auth/demo-switch', (req, res) => {
  try {
    const { role } = req.body; // 'admin' | 'customer'
    let targetEmail = role === 'admin' ? 'admin@comfortgarments.com' : 'sairasaeed575@gmail.com';
    let user = db.getUserByEmail(targetEmail);
    if (!user) {
      const users = db.getUsers();
      user = role === 'admin' 
        ? users.find(u => u.role === 'super_admin' || u.role === 'admin') 
        : users.find(u => u.role === 'customer');
    }

    if (!user) {
      return res.status(404).json({ error: 'Target demo account not found' });
    }

    const token = generateToken(user);
    return res.json({
      message: `Switched to ${user.name} (${user.role})`,
      token,
      user,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/auth/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  return res.json({ user: req.user });
});

apiRouter.put('/auth/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone, addresses } = req.body;
    const updated = db.updateUserProfile(req.user!.id, {
      name: name ?? req.user!.name,
      phone: phone ?? req.user!.phone,
      addresses: addresses ?? req.user!.addresses,
    });
    return res.json({ message: 'Profile updated', user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/auth/change-password', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const valid = db.verifyPassword(req.user!.id, currentPassword);
    if (!valid) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    db.updateUserPassword(req.user!.id, newPassword);
    return res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// STOREFRONT PRODUCTS & CATALOG
// ----------------------------------------------------

apiRouter.get('/products', (req, res) => {
  try {
    let products = db.getProducts().filter(p => p.status === 'active');

    const { 
      search, 
      category, 
      collection, 
      minPrice, 
      maxPrice, 
      size, 
      color, 
      sort,
      filter 
    } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (category && typeof category === 'string' && category !== 'all') {
      products = products.filter(p => p.categorySlug === category || p.subcategory?.toLowerCase() === category.toLowerCase());
    }

    if (collection && typeof collection === 'string' && collection !== 'all') {
      products = products.filter(p => p.collectionSlugs.includes(collection));
    }

    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) {
        products = products.filter(p => (p.salePrice || p.price) >= min);
      }
    }

    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        products = products.filter(p => (p.salePrice || p.price) <= max);
      }
    }

    if (size && typeof size === 'string') {
      products = products.filter(p => p.variants.some(v => v.size === size && v.stock > 0));
    }

    if (color && typeof color === 'string') {
      products = products.filter(p => p.variants.some(v => v.color.toLowerCase().includes(color.toLowerCase())));
    }

    if (filter === 'new-arrivals') {
      products = products.filter(p => p.isNewArrival);
    } else if (filter === 'sale') {
      products = products.filter(p => p.salePrice && p.salePrice < p.price);
    } else if (filter === 'best-sellers') {
      products = products.filter(p => p.isBestSeller);
    }

    // Sorting
    if (sort === 'price-low') {
      products.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sort === 'price-high') {
      products.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'bestseller') {
      products.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
    } else {
      // featured default
      products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return res.json({
      count: products.length,
      products,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/products/:slug', (req, res) => {
  try {
    const product = db.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ product });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/categories', (_req, res) => {
  const categories = db.getCategories().filter(c => c.isActive);
  return res.json({ categories });
});

apiRouter.get('/collections', (_req, res) => {
  const collections = db.getCollections().filter(c => c.isActive);
  return res.json({ collections });
});

// ----------------------------------------------------
// COUPON VALIDATION
// ----------------------------------------------------

apiRouter.post('/coupons/validate', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const coupon = db.getCouponByCode(code);
    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ error: 'Invalid or inactive promotional code.' });
    }

    const now = new Date();
    if (new Date(coupon.startDate) > now || new Date(coupon.endDate) < now) {
      return res.status(400).json({ error: 'This coupon has expired.' });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'This coupon has reached its maximum redemption limit.' });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (orderSubtotal < coupon.minimumOrder) {
      return res.status(400).json({ 
        error: `Minimum order amount of $${coupon.minimumOrder} required for code ${coupon.code}.` 
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, orderSubtotal);

    return res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Number(discountAmount.toFixed(2)),
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// CHECKOUT & ORDERS
// ----------------------------------------------------

apiRouter.post('/checkout', (req: AuthenticatedRequest, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      items,
      couponCode,
      notes,
    } = req.body;

    if (!customerName || !customerEmail || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer name, email, shipping address, and at least one item are required.' });
    }

    const settings = db.getSettings();

    // SERVER-SIDE VALIDATION & PRICING: NEVER TRUST CLIENT SUBMITTED PRICES!
    let calculatedSubtotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const clientItem of items) {
      const product = db.getProductById(clientItem.productId);
      if (!product || product.status !== 'active') {
        return res.status(400).json({ error: `Product "${clientItem.productName || clientItem.productId}" is not available.` });
      }

      const variant = product.variants.find(v => v.id === clientItem.variantId);
      if (!variant) {
        return res.status(400).json({ error: `Variant for product "${product.name}" not found.` });
      }

      const requestedQty = Number(clientItem.quantity) || 1;
      if (requestedQty <= 0) {
        return res.status(400).json({ error: `Invalid quantity for "${product.name}".` });
      }

      if (variant.stock < requestedQty) {
        return res.status(400).json({ 
          error: `Only ${variant.stock} item(s) left in stock for ${product.name} (Size: ${variant.size}, Color: ${variant.color}). Please adjust your cart.` 
        });
      }

      const unitPrice = variant.salePrice || variant.price || product.salePrice || product.price;
      const lineTotal = unitPrice * requestedQty;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.images[0] || '',
        variantId: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        price: unitPrice,
        quantity: requestedQty,
        total: lineTotal,
      });
    }

    // Shipping calculation
    let shippingFee = 0;
    if (deliveryMethod === 'Express Delivery (2-3 Business Days)') {
      shippingFee = settings.expressShippingFee;
    } else {
      shippingFee = calculatedSubtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
    }

    // Coupon calculation server-side
    let discountAmount = 0;
    if (couponCode) {
      const coupon = db.getCouponByCode(couponCode);
      if (coupon && coupon.isActive && calculatedSubtotal >= coupon.minimumOrder) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (calculatedSubtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, calculatedSubtotal);
      }
    }

    // Tax calculation
    const taxableAmount = Math.max(0, calculatedSubtotal - discountAmount);
    const taxAmount = Number(((taxableAmount * settings.taxRatePercent) / 100).toFixed(2));
    const grandTotal = Number((taxableAmount + shippingFee + taxAmount).toFixed(2));

    const order = db.createOrder({
      customerId: req.user ? req.user.id : undefined,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      shippingAddress,
      deliveryMethod: deliveryMethod || 'Standard Delivery',
      shippingFee,
      paymentMethod: paymentMethod || 'Online Payment',
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      orderStatus: 'Confirmed',
      items: validatedItems,
      subtotal: calculatedSubtotal,
      discountAmount,
      couponCode: discountAmount > 0 ? couponCode : undefined,
      taxAmount,
      grandTotal,
      notes: notes || '',
    });

    return res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Checkout failed' });
  }
});

// Customer orders list
apiRouter.get('/orders', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const allOrders = db.getOrders();
    const userOrders = allOrders.filter(o => 
      (o.customerId && o.customerId === req.user!.id) ||
      o.customerEmail.toLowerCase() === req.user!.email.toLowerCase()
    );
    return res.json({ orders: userOrders });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/orders/:id', (req: AuthenticatedRequest, res) => {
  try {
    const order = db.getOrderById(req.params.id) || db.getOrderByNumber(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Public order tracking by order number & email
apiRouter.get('/orders/track/:orderNumber', (req, res) => {
  try {
    const { email } = req.query;
    const order = db.getOrderByNumber(req.params.orderNumber);
    if (!order) {
      return res.status(404).json({ error: 'No order found with the provided order number.' });
    }

    if (email && typeof email === 'string') {
      if (order.customerEmail.toLowerCase() !== email.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Email does not match the order records.' });
      }
    }

    return res.json({
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      statusHistory: order.statusHistory,
      items: order.items,
      shippingCity: order.shippingAddress.city,
      shippingCountry: order.shippingAddress.country,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// REVIEWS
// ----------------------------------------------------

apiRouter.get('/reviews', (req, res) => {
  const { productId } = req.query;
  const reviews = db.getReviews(productId ? String(productId) : undefined)
    .filter(r => r.status === 'approved');
  return res.json({ reviews });
});

apiRouter.post('/reviews', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({ error: 'Product ID, rating, title, and review comments are required.' });
    }

    const product = db.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const review = db.addReview({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      customerId: req.user!.id,
      customerName: req.user!.name,
      customerEmail: req.user!.email,
      rating: Math.min(5, Math.max(1, Number(rating))),
      title,
      comment,
    });

    return res.status(201).json({
      message: 'Thank you! Your review has been submitted.',
      review,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// RETURNS & CUSTOMER SERVICE
// ----------------------------------------------------

apiRouter.post('/returns', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { orderId, items, comment } = req.body;
    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order ID and items to return are required.' });
    }

    const order = db.getOrderById(orderId) || db.getOrderByNumber(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const returnReq = db.createReturn({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: req.user!.id,
      customerName: req.user!.name,
      customerEmail: req.user!.email,
      items,
      comment: comment || '',
    });

    return res.status(201).json({
      message: 'Return request submitted successfully. Our team will review within 24 hours.',
      returnRequest: returnReq,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/returns/my', requireAuth, (req: AuthenticatedRequest, res) => {
  const allReturns = db.getReturns();
  const myReturns = allReturns.filter(r => r.customerId === req.user!.id);
  return res.json({ returns: myReturns });
});

apiRouter.post('/contact', (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
    }
    const msg = db.addContactMessage({ name, email, phone, subject, message });
    return res.status(201).json({ message: 'Thank you for reaching out. We will get back to you shortly.', data: msg });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/newsletter', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address required.' });
    }
    const resSub = db.addNewsletterSubscriber(email);
    return res.json(resSub);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// CMS & SETTINGS PUBLIC
// ----------------------------------------------------

apiRouter.get('/cms/homepage', (_req, res) => {
  return res.json({ cms: db.getCMS() });
});

apiRouter.get('/settings', (_req, res) => {
  const s = db.getSettings();
  return res.json({ settings: s });
});

// ----------------------------------------------------
// ADMIN DASHBOARD & MANAGEMENT (Protected by requireAdmin)
// ----------------------------------------------------

apiRouter.get('/admin/dashboard', requireAdmin, (_req, res) => {
  try {
    const orders = db.getOrders();
    const products = db.getProducts();
    const users = db.getUsers().filter(u => u.role === 'customer');
    const reviews = db.getReviews();

    const totalGrossSales = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const paidOrders = orders.filter(o => o.paymentStatus === 'Paid');
    const netRevenue = paidOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalOrders = orders.length;
    const aov = totalOrders > 0 ? Number((totalGrossSales / totalOrders).toFixed(2)) : 0;

    // Variant low-stock scanning
    let lowStockCount = 0;
    const lowStockVariants: any[] = [];
    for (const p of products) {
      for (const v of p.variants) {
        if (v.stock <= 5) {
          lowStockCount++;
          lowStockVariants.push({
            productId: p.id,
            productName: p.name,
            sku: v.sku,
            size: v.size,
            color: v.color,
            stock: v.stock,
          });
        }
      }
    }

    const pendingReviewsCount = reviews.filter(r => r.status === 'pending').length;

    // Sales by day / orders chart data
    const recentOrders = orders.slice(0, 8);

    return res.json({
      metrics: {
        totalGrossSales: Number(totalGrossSales.toFixed(2)),
        netRevenue: Number(netRevenue.toFixed(2)),
        totalOrders,
        totalCustomers: users.length,
        averageOrderValue: aov,
        totalProducts: products.length,
        lowStockCount,
        pendingReviewsCount,
      },
      lowStockVariants: lowStockVariants.slice(0, 10),
      recentOrders,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Orders
apiRouter.get('/admin/orders', requireAdmin, (req, res) => {
  try {
    const { status, paymentStatus, search } = req.query;
    let orders = db.getOrders();

    if (status && status !== 'all') {
      orders = orders.filter(o => o.orderStatus.toLowerCase() === String(status).toLowerCase());
    }

    if (paymentStatus && paymentStatus !== 'all') {
      orders = orders.filter(o => o.paymentStatus.toLowerCase() === String(paymentStatus).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      orders = orders.filter(o => 
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    }

    return res.json({ orders });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/admin/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { status, note, trackingNumber, carrier } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const updated = db.updateOrderStatus(
      req.params.id,
      status,
      note || `Status updated to ${status}`,
      req.user!.name,
      trackingNumber,
      carrier
    );
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ message: 'Order status updated', order: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/orders/:id/refund', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { amount, reason } = req.body;
    if (!amount || !reason) {
      return res.status(400).json({ error: 'Refund amount and reason are required' });
    }
    const updated = db.refundOrder(req.params.id, Number(amount), reason, req.user!.name);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json({ message: 'Refund recorded successfully', order: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Products & Variants
apiRouter.get('/admin/products', requireAdmin, (_req, res) => {
  return res.json({ products: db.getProducts() });
});

apiRouter.post('/admin/products', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const productData = req.body;
    if (!productData.name || !productData.price) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }
    const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct = db.createProduct({
      ...productData,
      slug,
      variants: productData.variants || [],
      images: productData.images || [],
      specifications: productData.specifications || {},
      status: productData.status || 'active',
      tags: productData.tags || [],
    }, req.user!.name);

    return res.status(201).json({ message: 'Product created', product: newProduct });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body, req.user!.name);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ message: 'Product updated', product: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const success = db.deleteProduct(req.params.id, req.user!.name);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ message: 'Product deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Inventory
apiRouter.get('/admin/inventory', requireAdmin, (_req, res) => {
  try {
    const products = db.getProducts();
    const inventoryList: any[] = [];
    for (const p of products) {
      for (const v of p.variants) {
        inventoryList.push({
          productId: p.id,
          productName: p.name,
          productSlug: p.slug,
          categoryName: p.categoryName,
          variantId: v.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          price: v.price,
          salePrice: v.salePrice,
          stock: v.stock,
          reservedStock: v.reservedStock || 0,
        });
      }
    }
    const movements = db.getInventoryMovements().slice(0, 50);
    return res.json({ inventory: inventoryList, movements });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/inventory/adjust', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { variantId, change, reason, changeType, reference } = req.body;
    if (!variantId || change === undefined || !reason) {
      return res.status(400).json({ error: 'Variant ID, change quantity, and reason are required' });
    }

    const result = db.adjustInventory(
      variantId, 
      Number(change), 
      reason, 
      changeType || 'adjustment', 
      req.user!.name, 
      reference
    );

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    return res.json({ message: 'Inventory adjusted successfully', newStock: result.newStock });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Customers
apiRouter.get('/admin/customers', requireAdmin, (_req, res) => {
  try {
    const users = db.getUsers().filter(u => u.role === 'customer');
    const orders = db.getOrders();

    const customerList = users.map(u => {
      const custOrders = orders.filter(o => 
        (o.customerId && o.customerId === u.id) ||
        o.customerEmail.toLowerCase() === u.email.toLowerCase()
      );
      const lifetimeValue = custOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
      return {
        ...u,
        totalOrders: custOrders.length,
        lifetimeValue: Number(lifetimeValue.toFixed(2)),
        lastOrderDate: custOrders.length > 0 ? custOrders[0].createdAt : null,
      };
    });

    return res.json({ customers: customerList });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Reviews
apiRouter.get('/admin/reviews', requireAdmin, (_req, res) => {
  return res.json({ reviews: db.getReviews() });
});

apiRouter.patch('/admin/reviews/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { status, adminReply } = req.body;
    const updated = db.moderateReview(req.params.id, status, adminReply, req.user!.name);
    if (!updated) {
      return res.status(404).json({ error: 'Review not found' });
    }
    return res.json({ message: 'Review updated', review: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Coupons
apiRouter.get('/admin/coupons', requireAdmin, (_req, res) => {
  return res.json({ coupons: db.getCoupons() });
});

apiRouter.post('/admin/coupons', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const coupon = req.body;
    if (!coupon.code || !coupon.discountValue) {
      return res.status(400).json({ error: 'Coupon code and discount value required' });
    }
    const saved = db.saveCoupon({
      ...coupon,
      id: coupon.id || `cpn_${Date.now()}`,
      code: coupon.code.toUpperCase().trim(),
      usageCount: coupon.usageCount || 0,
    }, req.user!.name);
    return res.status(201).json({ message: 'Coupon saved', coupon: saved });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin Returns
apiRouter.get('/admin/returns', requireAdmin, (_req, res) => {
  return res.json({ returns: db.getReturns() });
});

apiRouter.patch('/admin/returns/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { status, adminNotes } = req.body;
    const updated = db.updateReturnStatus(req.params.id, status, adminNotes, req.user!.name);
    if (!updated) {
      return res.status(404).json({ error: 'Return request not found' });
    }
    return res.json({ message: 'Return status updated', returnRequest: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin CMS & Settings
apiRouter.put('/admin/cms', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateCMS(req.body, req.user!.name);
    return res.json({ message: 'Homepage CMS saved', cms: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/settings', requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateSettings(req.body, req.user!.name);
    return res.json({ message: 'Store settings saved', settings: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/admin/audit-logs', requireAdmin, (_req, res) => {
  return res.json({ auditLogs: db.getAuditLogs() });
});

// Admin Inquiries / Contact Messages
apiRouter.get('/admin/messages', requireAdmin, (_req, res) => {
  return res.json({ messages: db.getContactMessages() });
});

// CSV Export
apiRouter.get('/admin/export/:type', requireAdmin, (req, res) => {
  try {
    const { type } = req.params;
    let csv = '';
    let filename = `comfort_${type}_export.csv`;

    if (type === 'orders') {
      const orders = db.getOrders();
      csv = 'OrderNumber,Date,CustomerName,CustomerEmail,ItemsCount,Subtotal,Discount,Tax,GrandTotal,OrderStatus,PaymentStatus\n' +
        orders.map(o => 
          `"${o.orderNumber}","${o.createdAt}","${o.customerName}","${o.customerEmail}",${o.items.length},${o.subtotal},${o.discountAmount},${o.taxAmount},${o.grandTotal},"${o.orderStatus}","${o.paymentStatus}"`
        ).join('\n');
    } else if (type === 'inventory') {
      const products = db.getProducts();
      csv = 'SKU,Product,Category,Size,Color,Stock,Price\n';
      const rows: string[] = [];
      for (const p of products) {
        for (const v of p.variants) {
          rows.push(`"${v.sku}","${p.name}","${p.categoryName}","${v.size}","${v.color}",${v.stock},${v.price}`);
        }
      }
      csv += rows.join('\n');
    } else if (type === 'products') {
      const products = db.getProducts();
      csv = 'SKU,Name,Category,Price,SalePrice,VariantsCount,Status,TotalSold\n' +
        products.map(p => `"${p.sku}","${p.name}","${p.categoryName}",${p.price},${p.salePrice || ''},${p.variants.length},"${p.status}",${p.totalSold}`).join('\n');
    } else {
      return res.status(400).json({ error: 'Unsupported export type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
