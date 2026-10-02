import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  User, Product, Category, Collection, Order, Coupon, 
  Review, ReturnRequest, InventoryMovement, StoreSettings, 
  HomepageCMS, AuditLog 
} from '../src/types';

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, { salt: string; hash: string }>; // userId -> hash
  products: Product[];
  categories: Category[];
  collections: Collection[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  returns: ReturnRequest[];
  inventoryMovements: InventoryMovement[];
  storeSettings: StoreSettings;
  cms: HomepageCMS;
  auditLogs: AuditLog[];
  contactMessages: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: 'new' | 'in_progress' | 'resolved';
    createdAt: string;
  }[];
  newsletterSubscribers: {
    id: string;
    email: string;
    subscribedAt: string;
  }[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'comfort_db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function generateInitialSeed(): DatabaseSchema {
  const adminId = 'usr_admin_01';
  const customerId = 'usr_cust_01';
  const customer2Id = 'usr_cust_02';

  const adminSalt = crypto.randomBytes(16).toString('hex');
  const custSalt = crypto.randomBytes(16).toString('hex');

  const passwords: Record<string, { salt: string; hash: string }> = {
    [adminId]: {
      salt: adminSalt,
      hash: hashPassword('admin1234', adminSalt),
    },
    [customerId]: {
      salt: custSalt,
      hash: hashPassword('customer123', custSalt),
    },
    [customer2Id]: {
      salt: custSalt,
      hash: hashPassword('customer123', custSalt),
    }
  };

  const users: User[] = [
    {
      id: adminId,
      name: 'Victoria Vance',
      email: 'admin@comfortgarments.com',
      phone: '+1 (555) 234-5678',
      role: 'super_admin',
      createdAt: '2026-01-10T08:00:00.000Z',
      status: 'active',
      addresses: [
        {
          id: 'addr_adm_1',
          fullName: 'Victoria Vance',
          phone: '+1 (555) 234-5678',
          addressLine: '450 Fashion Avenue, Suite 1200',
          city: 'New York',
          state: 'NY',
          postalCode: '10018',
          country: 'United States',
          isDefault: true,
        }
      ]
    },
    {
      id: customerId,
      name: 'Saira Saeed',
      email: 'sairasaeed575@gmail.com',
      phone: '+1 (555) 892-1244',
      role: 'customer',
      createdAt: '2026-02-14T10:30:00.000Z',
      status: 'active',
      addresses: [
        {
          id: 'addr_cust_1',
          fullName: 'Saira Saeed',
          phone: '+1 (555) 892-1244',
          addressLine: '742 Rosewood Crescent',
          city: 'Beverly Hills',
          state: 'CA',
          postalCode: '90210',
          country: 'United States',
          isDefault: true,
        }
      ]
    },
    {
      id: customer2Id,
      name: 'Amira Khan',
      email: 'amira.khan@example.com',
      phone: '+1 (555) 431-7788',
      role: 'customer',
      createdAt: '2026-02-20T12:00:00.000Z',
      status: 'active',
      addresses: [
        {
          id: 'addr_cust_2',
          fullName: 'Amira Khan',
          phone: '+1 (555) 431-7788',
          addressLine: '128 Kensington Way',
          city: 'London',
          state: 'Greater London',
          postalCode: 'SW7 2AZ',
          country: 'United Kingdom',
          isDefault: true,
        }
      ]
    }
  ];

  const categories: Category[] = [
    {
      id: 'cat_formal',
      name: 'Formal Wear',
      slug: 'formal-wear',
      description: 'Sophisticated silhouettes, hand-finished borders, and statement formal wear crafted for grand celebrations.',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1600&q=80',
      displayOrder: 1,
      isActive: true,
      subcategories: ['Suits', 'Maxis', 'Drapes', 'Gowns']
    },
    {
      id: 'cat_casual',
      name: 'Casual Wear',
      slug: 'casual-wear',
      description: 'Effortless co-ords, breathable linens, and daily kurtas designed for comfort without compromising grace.',
      image: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
      displayOrder: 2,
      isActive: true,
      subcategories: ['Kurtas', 'Co-Ord Sets', 'Palazzo Sets', 'Tunics']
    },
    {
      id: 'cat_unstitched',
      name: 'Unstitched Luxury',
      slug: 'unstitched',
      description: 'Pure lawn and raw silk unstitched ensembles with embroidered motifs, schiffli borders, and pure organza dupattas.',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80',
      displayOrder: 3,
      isActive: true,
      subcategories: ['3-Piece Lawn', 'Embroidered Silk', 'Festive Chiffon']
    },
    {
      id: 'cat_party',
      name: 'Party & Evening',
      slug: 'party-wear',
      description: 'Glistening beadwork, delicate pearl embellishments, and dramatic evening couture.',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80',
      displayOrder: 4,
      isActive: true,
      subcategories: ['Evening Dresses', 'Festive Gowns', 'Silk Suits']
    },
    {
      id: 'cat_western',
      name: 'Western Wear',
      slug: 'western-wear',
      description: 'Modern structured trench-style co-ords, tailored linen pantsuits, and contemporary silk shirts.',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
      displayOrder: 5,
      isActive: true,
      subcategories: ['Shirts', 'Trousers', 'Jackets', 'Midi Dresses']
    },
    {
      id: 'cat_modest',
      name: 'Modest & Abayas',
      slug: 'modest-wear',
      description: 'Sumptuous Korean Nida and mulberry silk abayas with discreet pearl detailing and generous silhouettes.',
      image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1600&q=80',
      displayOrder: 6,
      isActive: true,
      subcategories: ['Classic Abayas', 'Kimono Capes', 'Hijab Scarves']
    }
  ];

  const collections: Collection[] = [
    {
      id: 'col_spring_summer',
      name: 'Spring / Summer 2026',
      slug: 'spring-summer',
      description: 'Lightweight mulmul, breezy georgettes, and pastel florals designed for sunlit afternoons.',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80',
      displayOrder: 1,
      isActive: true,
    },
    {
      id: 'col_festive',
      name: 'Festive Elegance',
      slug: 'festive-elegance',
      description: 'Zardozi wire-work, hand-embroidered resham, and gold thread tapestries for life’s grandest celebrations.',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1600&q=80',
      displayOrder: 2,
      isActive: true,
    },
    {
      id: 'col_minimalist',
      name: 'Minimalist Comfort',
      slug: 'minimalist-comfort',
      description: 'Clean tailoring, neutral palettes, and pure natural fibers with timeless longevity.',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
      displayOrder: 3,
      isActive: true,
    }
  ];

  const products: Product[] = [
    {
      id: 'prod_rose_lawn_01',
      name: 'Rose Embroidered Lawn Suit',
      slug: 'rose-embroidered-lawn-suit',
      sku: 'COM-LNW-001',
      shortDescription: 'Three-piece fine cotton lawn ensemble with handcrafted resham florals and pure organza dupatta.',
      description: 'Imbued with botanical romance, the Rose Embroidered Lawn Suit represents the pinnacle of summer luxury. Cut from 80-count combed cotton lawn, the shirt features intricate tone-on-tone embroidery across the neckline and front panels. Paired with tailored cigarette trousers and an ethereal digital-printed silk-organza dupatta featuring scalloped border lace.',
      price: 185,
      salePrice: 155,
      discountPercentage: 16,
      categorySlug: 'unstitched',
      categoryName: 'Unstitched Luxury',
      subcategory: '3-Piece Lawn',
      collectionSlugs: ['spring-summer', 'festive-elegance'],
      images: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85',
      ],
      variants: [
        { id: 'v_rose_xs', sku: 'COM-LNW-001-XS', size: 'XS', color: 'Dusty Rose', colorHex: '#C98B99', price: 185, salePrice: 155, stock: 12, reservedStock: 0 },
        { id: 'v_rose_s', sku: 'COM-LNW-001-S', size: 'S', color: 'Dusty Rose', colorHex: '#C98B99', price: 185, salePrice: 155, stock: 18, reservedStock: 0 },
        { id: 'v_rose_m', sku: 'COM-LNW-001-M', size: 'M', color: 'Dusty Rose', colorHex: '#C98B99', price: 185, salePrice: 155, stock: 24, reservedStock: 1 },
        { id: 'v_rose_l', sku: 'COM-LNW-001-L', size: 'L', color: 'Dusty Rose', colorHex: '#C98B99', price: 185, salePrice: 155, stock: 15, reservedStock: 0 },
        { id: 'v_rose_xl', sku: 'COM-LNW-001-XL', size: 'XL', color: 'Dusty Rose', colorHex: '#C98B99', price: 185, salePrice: 155, stock: 6, reservedStock: 0 },
        { id: 'v_rose_xxl', sku: 'COM-LNW-001-XXL', size: 'XXL', color: 'Dusty Rose', colorHex: '#C98B99', price: 185, salePrice: 155, stock: 3, reservedStock: 0 },
      ],
      specifications: {
        fabric: 'Fine Combed Lawn (80s Yarn)',
        material: '100% Breathable Cotton',
        fit: 'Regular Tailored Silhouette',
        sleeve: 'Full Length with Lace Cuffs',
        length: 'Calf Length (44 inches)',
        neckline: 'V-Neck with Embroidered Placket',
        occasion: 'Festive Gatherings, Semi-Formal Brunches',
        care: 'Dry clean recommended or gentle cold hand wash. Iron inside out.',
        origin: 'Made in Pakistan',
        composition: 'Shirt: 100% Cotton Lawn, Trouser: 100% Cotton, Dupatta: Silk Organza'
      },
      isNewArrival: true,
      isFeatured: true,
      isBestSeller: true,
      status: 'active',
      tags: ['lawn', 'embroidered', '3-piece', 'summer', 'rose', 'luxury'],
      seoTitle: 'Rose Embroidered 3-Piece Lawn Suit | COMFORT Ladies Garments',
      seoDescription: 'Handcrafted luxury 3-piece lawn suit in dusty rose with pure organza dupatta. Elegant, breathable, and designed for celebration.',
      createdAt: '2026-02-01T10:00:00.000Z',
      totalSold: 42,
    },
    {
      id: 'prod_mauve_linen_02',
      name: 'Mauve Linen Co-Ord Set',
      slug: 'mauve-linen-co-ord-set',
      sku: 'COM-CRD-002',
      shortDescription: 'Tailored relaxed-cut tunic with pleated wide-leg trousers in organic pre-washed European linen.',
      description: 'Understated luxury meets daytime serenity. Crafted from naturally thermo-regulating French flax linen, this two-piece co-ord set features a relaxed dropped-shoulder tunic with genuine mother-of-pearl buttons, coupled with high-waisted wide-leg trousers featuring a discreet elasticized back waistband.',
      price: 145,
      salePrice: 125,
      discountPercentage: 14,
      categorySlug: 'casual-wear',
      categoryName: 'Casual Wear',
      subcategory: 'Co-Ord Sets',
      collectionSlugs: ['minimalist-comfort', 'spring-summer'],
      images: [
        'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
      ],
      variants: [
        { id: 'v_mauve_xs', sku: 'COM-CRD-002-XS', size: 'XS', color: 'Mauve Whisper', colorHex: '#9C6877', price: 145, salePrice: 125, stock: 8, reservedStock: 0 },
        { id: 'v_mauve_s', sku: 'COM-CRD-002-S', size: 'S', color: 'Mauve Whisper', colorHex: '#9C6877', price: 145, salePrice: 125, stock: 14, reservedStock: 0 },
        { id: 'v_mauve_m', sku: 'COM-CRD-002-M', size: 'M', color: 'Mauve Whisper', colorHex: '#9C6877', price: 145, salePrice: 125, stock: 19, reservedStock: 0 },
        { id: 'v_mauve_l', sku: 'COM-CRD-002-L', size: 'L', color: 'Mauve Whisper', colorHex: '#9C6877', price: 145, salePrice: 125, stock: 10, reservedStock: 0 },
        { id: 'v_mauve_xl', sku: 'COM-CRD-002-XL', size: 'XL', color: 'Mauve Whisper', colorHex: '#9C6877', price: 145, salePrice: 125, stock: 5, reservedStock: 0 },
      ],
      specifications: {
        fabric: '100% Pre-Washed European Linen',
        material: 'Organic Flax Fiber',
        fit: 'Relaxed Tailored Drape',
        sleeve: '3/4 Length with Cuffed Hem',
        length: 'Tunic: 32 inches, Trousers: 39 inches',
        neckline: 'Mandarin Band Collar',
        occasion: 'Everyday Chic, Travel, Casual Dinners',
        care: 'Machine wash delicate cycle in cold water. Line dry in shade.',
        origin: 'Ethically Crafted in Turkey',
        composition: '100% Certified Linen'
      },
      isNewArrival: true,
      isFeatured: true,
      isBestSeller: true,
      status: 'active',
      tags: ['linen', 'co-ord', 'mauve', 'casual', 'sustainable'],
      seoTitle: 'Mauve Linen Co-Ord Set | COMFORT Ladies Garments',
      seoDescription: 'Breathable European linen co-ord set in elegant mauve whisper. Relaxed silhouette and mother-of-pearl buttons for daily sophistication.',
      createdAt: '2026-02-05T11:00:00.000Z',
      totalSold: 38,
    },
    {
      id: 'prod_ivory_pearl_03',
      name: 'Ivory Pearl Embellished Maxi Dress',
      slug: 'ivory-pearl-embellished-dress',
      sku: 'COM-EVN-003',
      shortDescription: 'Floor-skimming raw silk blend gown with hand-sewn freshwater seed pearls and micro-zari detail.',
      description: 'An architectural tribute to bridal elegance and gala celebrations. The Ivory Pearl Embellished Maxi features hundreds of meticulously hand-placed lustrous faux pearls along the bodice, framing an empire line that falls gracefully into a pleated double-chiffon skirt.',
      price: 260,
      salePrice: 220,
      discountPercentage: 15,
      categorySlug: 'party-wear',
      categoryName: 'Party & Evening',
      subcategory: 'Evening Dresses',
      collectionSlugs: ['festive-elegance'],
      images: [
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85',
      ],
      variants: [
        { id: 'v_ivory_xs', sku: 'COM-EVN-003-XS', size: 'XS', color: 'Ivory Pearl', colorHex: '#FBF9F4', price: 260, salePrice: 220, stock: 4, reservedStock: 0 },
        { id: 'v_ivory_s', sku: 'COM-EVN-003-S', size: 'S', color: 'Ivory Pearl', colorHex: '#FBF9F4', price: 260, salePrice: 220, stock: 9, reservedStock: 0 },
        { id: 'v_ivory_m', sku: 'COM-EVN-003-M', size: 'M', color: 'Ivory Pearl', colorHex: '#FBF9F4', price: 260, salePrice: 220, stock: 11, reservedStock: 0 },
        { id: 'v_ivory_l', sku: 'COM-EVN-003-L', size: 'L', color: 'Ivory Pearl', colorHex: '#FBF9F4', price: 260, salePrice: 220, stock: 7, reservedStock: 0 },
        { id: 'v_ivory_xl', sku: 'COM-EVN-003-XL', size: 'XL', color: 'Ivory Pearl', colorHex: '#FBF9F4', price: 260, salePrice: 220, stock: 2, reservedStock: 0 }, // Low stock!
      ],
      specifications: {
        fabric: 'Raw Silk Blend Bodice with Double Georgette Chiffon Skirt',
        material: '60% Raw Silk, 40% Viscose, Soft Modal Satin Lining',
        fit: 'Empire Waist with Flared A-Line Sweep',
        sleeve: 'Long Sheer Sleeves with Embellished Wrists',
        length: 'Floor Length (58 inches)',
        neckline: 'Modest Boat Neck with Pearl Edging',
        occasion: 'Weddings, Formal Receptions, Black Tie Galas',
        care: 'Strictly professional dry clean only.',
        origin: 'Handcrafted in UAE',
        composition: 'Shell: 60% Silk 40% Viscose, Lining: 100% Modal Satin'
      },
      isNewArrival: false,
      isFeatured: true,
      isBestSeller: true,
      status: 'active',
      tags: ['evening', 'pearl', 'ivory', 'gown', 'wedding', 'maxi'],
      seoTitle: 'Ivory Pearl Embellished Maxi Dress | COMFORT Ladies Garments',
      seoDescription: 'Graceful ivory maxi dress with hand-embellished pearl detailing. Flared silhouette for grand receptions and wedding guests.',
      createdAt: '2026-01-20T14:30:00.000Z',
      totalSold: 29,
    },
    {
      id: 'prod_black_abaya_04',
      name: 'Classic Black Silk Abaya',
      slug: 'classic-black-silk-abaya',
      sku: 'COM-ABY-004',
      shortDescription: 'Sumptuous Korean Nida silk front-open abaya with discreet metallic piping and matching chiffon hijab.',
      description: 'The epitome of modest grace. Tailored from the finest grade jet-black Korean Nida silk, this abaya falls with unmatched fluidity and zero static cling. Finished with concealed magnetic front closures and subtle bronze metallic cord piping along the lapels.',
      price: 170,
      salePrice: 145,
      discountPercentage: 15,
      categorySlug: 'modest-wear',
      categoryName: 'Modest & Abayas',
      subcategory: 'Classic Abayas',
      collectionSlugs: ['minimalist-comfort'],
      images: [
        'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1000&q=85',
      ],
      variants: [
        { id: 'v_abaya_s', sku: 'COM-ABY-004-52', size: 'S', color: 'Jet Black', colorHex: '#1F1E1E', price: 170, salePrice: 145, stock: 15, reservedStock: 0 },
        { id: 'v_abaya_m', sku: 'COM-ABY-004-54', size: 'M', color: 'Jet Black', colorHex: '#1F1E1E', price: 170, salePrice: 145, stock: 22, reservedStock: 0 },
        { id: 'v_abaya_l', sku: 'COM-ABY-004-56', size: 'L', color: 'Jet Black', colorHex: '#1F1E1E', price: 170, salePrice: 145, stock: 18, reservedStock: 0 },
        { id: 'v_abaya_xl', sku: 'COM-ABY-004-58', size: 'XL', color: 'Jet Black', colorHex: '#1F1E1E', price: 170, salePrice: 145, stock: 7, reservedStock: 0 },
      ],
      specifications: {
        fabric: 'High-Density Korean Nida Fabric',
        material: 'Premium Breathable Poly-Silk',
        fit: 'Flowing Modest Cut',
        sleeve: 'Flared Kimono Sleeves with Inner Snaps',
        length: '54 / 56 / 58 inches options',
        neckline: 'High Overlap Collar',
        occasion: 'Daily Modesty, Friday Prayers, Formal Evenings',
        care: 'Gentle machine wash cold in laundry bag or hand wash. Low steam iron.',
        origin: 'Made in Dubai',
        composition: '100% Korean Nida Poly-Silk'
      },
      isNewArrival: false,
      isFeatured: false,
      isBestSeller: true,
      status: 'active',
      tags: ['abaya', 'black', 'modest', 'hijab', 'nida', 'silk'],
      seoTitle: 'Classic Black Silk Abaya | COMFORT Ladies Garments',
      seoDescription: 'High-grade Korean Nida black abaya with matching hijab. Unmatched drape, opaque coverage, and understated elegance.',
      createdAt: '2026-01-15T09:00:00.000Z',
      totalSold: 56,
    },
    {
      id: 'prod_emerald_velvet_05',
      name: 'Emerald Festive Velvet Ensemble',
      slug: 'emerald-festive-velvet-ensemble',
      sku: 'COM-FLV-005',
      shortDescription: 'Deep emerald micro-velvet kurta adorned with authentic tilla and zardozi needlework.',
      description: 'A regal winter and autumn celebration piece. Cut from plush 9000-grade micro-velvet in midnight emerald, accented with antique gold dabka and zari work across the collar, daaman, and cuffs. Accompanied by silk jamawar straight pants and a crushed gold organza stole.',
      price: 295,
      salePrice: 260,
      discountPercentage: 12,
      categorySlug: 'formal-wear',
      categoryName: 'Formal Wear',
      subcategory: 'Suits',
      collectionSlugs: ['festive-elegance'],
      images: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85',
      ],
      variants: [
        { id: 'v_emerald_xs', sku: 'COM-FLV-005-XS', size: 'XS', color: 'Royal Emerald', colorHex: '#1B4D3E', price: 295, salePrice: 260, stock: 5, reservedStock: 0 },
        { id: 'v_emerald_s', sku: 'COM-FLV-005-S', size: 'S', color: 'Royal Emerald', colorHex: '#1B4D3E', price: 295, salePrice: 260, stock: 8, reservedStock: 0 },
        { id: 'v_emerald_m', sku: 'COM-FLV-005-M', size: 'M', color: 'Royal Emerald', colorHex: '#1B4D3E', price: 295, salePrice: 260, stock: 12, reservedStock: 0 },
        { id: 'v_emerald_l', sku: 'COM-FLV-005-L', size: 'L', color: 'Royal Emerald', colorHex: '#1B4D3E', price: 295, salePrice: 260, stock: 6, reservedStock: 0 },
      ],
      specifications: {
        fabric: 'Plush 9000 Micro Velvet',
        material: 'Silk Velvet Blend with Zari Embellishment',
        fit: 'Structured Straight Cut',
        sleeve: 'Full Sleeves with Heavy Embroidered Cuffs',
        length: 'Knee Length Kurta (40 inches)',
        neckline: 'Royal Keyhole Mandarin Neck',
        occasion: 'Winter Weddings, Sangeet, Eid Celebrations',
        care: 'Dry clean only. Store in muslin cloth garment bag.',
        origin: 'Hand-crafted in Lahore',
        composition: 'Kurta: 80% Silk Velvet, 20% Rayon. Pants: Silk Jamawar'
      },
      isNewArrival: true,
      isFeatured: true,
      isBestSeller: false,
      status: 'active',
      tags: ['velvet', 'emerald', 'festive', 'zari', 'winter', 'luxury'],
      seoTitle: 'Emerald Festive Velvet Ensemble | COMFORT Ladies Garments',
      seoDescription: 'Regal micro-velvet suit in royal emerald with traditional zardozi and antique tilla wire work.',
      createdAt: '2026-02-10T16:00:00.000Z',
      totalSold: 19,
    },
    {
      id: 'prod_champagne_tunic_06',
      name: 'Champagne Jacquard Silk Tunic',
      slug: 'champagne-jacquard-silk-tunic',
      sku: 'COM-JKT-006',
      shortDescription: 'Woven metallic jacquard tunic with pleated bell sleeves and pearl loop buttons.',
      description: 'A sparkling yet serene daytime celebration top. Features delicate self-woven botanical jacquard motifs in muted champagne gold, lined with soft breathable cotton lawn.',
      price: 135,
      salePrice: 115,
      discountPercentage: 15,
      categorySlug: 'casual-wear',
      categoryName: 'Casual Wear',
      subcategory: 'Kurtas',
      collectionSlugs: ['spring-summer'],
      images: [
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=85',
      ],
      variants: [
        { id: 'v_champ_xs', sku: 'COM-JKT-006-XS', size: 'XS', color: 'Champagne Gold', colorHex: '#E5D3B3', price: 135, salePrice: 115, stock: 7, reservedStock: 0 },
        { id: 'v_champ_s', sku: 'COM-JKT-006-S', size: 'S', color: 'Champagne Gold', colorHex: '#E5D3B3', price: 135, salePrice: 115, stock: 15, reservedStock: 0 },
        { id: 'v_champ_m', sku: 'COM-JKT-006-M', size: 'M', color: 'Champagne Gold', colorHex: '#E5D3B3', price: 135, salePrice: 115, stock: 20, reservedStock: 0 },
        { id: 'v_champ_l', sku: 'COM-JKT-006-L', size: 'L', color: 'Champagne Gold', colorHex: '#E5D3B3', price: 135, salePrice: 115, stock: 8, reservedStock: 0 },
      ],
      specifications: {
        fabric: 'Art Silk Jacquard',
        material: 'Fine Weave with Cotton Lining',
        fit: 'Straight Comfort Fit',
        sleeve: 'Flared Bell Sleeves',
        length: 'Hip Length (34 inches)',
        neckline: 'Round Neck with Teardrop Slit',
        occasion: 'Festive Dinners, Eid Brunches',
        care: 'Gentle dry clean or hand wash cold.',
        origin: 'Made in India',
        composition: '70% Viscose Silk, 30% Metallic Yarns'
      },
      isNewArrival: false,
      isFeatured: false,
      isBestSeller: true,
      status: 'active',
      tags: ['jacquard', 'champagne', 'tunic', 'silk', 'festive'],
      seoTitle: 'Champagne Jacquard Silk Tunic | COMFORT Ladies Garments',
      seoDescription: 'Luminous champagne silk jacquard tunic with delicate woven motifs and comfortable cotton lining.',
      createdAt: '2026-01-25T11:20:00.000Z',
      totalSold: 31,
    }
  ];

  const coupons: Coupon[] = [
    {
      id: 'cpn_welcome10',
      code: 'WELCOME10',
      description: '10% discount on your first order over $40',
      discountType: 'percentage',
      discountValue: 10,
      minimumOrder: 40,
      maxDiscount: 50,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
      usageLimit: 500,
      usageCount: 42,
      isActive: true,
    },
    {
      id: 'cpn_elegance20',
      code: 'ELEGANCE20',
      description: '20% off for orders over $100',
      discountType: 'percentage',
      discountValue: 20,
      minimumOrder: 100,
      maxDiscount: 80,
      startDate: '2026-02-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
      usageLimit: 200,
      usageCount: 18,
      isActive: true,
    },
    {
      id: 'cpn_freeship',
      code: 'FREESHIP',
      description: '$15 off (complimentary express shipping credit) for orders over $50',
      discountType: 'fixed',
      discountValue: 15,
      minimumOrder: 50,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
      usageCount: 35,
      isActive: true,
    }
  ];

  const reviews: Review[] = [
    {
      id: 'rev_01',
      productId: 'prod_rose_lawn_01',
      productName: 'Rose Embroidered Lawn Suit',
      productSlug: 'rose-embroidered-lawn-suit',
      customerId: customerId,
      customerName: 'Saira Saeed',
      customerEmail: 'sairasaeed575@gmail.com',
      orderNumber: 'COM-2026-000101',
      rating: 5,
      title: 'Exquisite embroidery & supreme comfort',
      comment: 'The craftsmanship on this suit is breathtaking! The lawn fabric is so soft and featherlight in warm weather, and the organza dupatta with scalloped borders is truly royal. Delivered promptly in premium packaging.',
      isVerifiedPurchase: true,
      status: 'approved',
      adminReply: 'Thank you so much Saira! We are delighted that the fabric and hand-finished scallops brought you joy.',
      createdAt: '2026-02-18T14:22:00.000Z',
    },
    {
      id: 'rev_02',
      productId: 'prod_rose_lawn_01',
      productName: 'Rose Embroidered Lawn Suit',
      productSlug: 'rose-embroidered-lawn-suit',
      customerId: customer2Id,
      customerName: 'Amira Khan',
      customerEmail: 'amira.khan@example.com',
      orderNumber: 'COM-2026-000102',
      rating: 5,
      title: 'Fits true to size with magnificent drape',
      comment: 'I ordered size Medium based on the size guide and it fit like a dream. The resham embroidery does not scratch at all. Will definitely be ordering from COMFORT again.',
      isVerifiedPurchase: true,
      status: 'approved',
      createdAt: '2026-02-22T09:15:00.000Z',
    },
    {
      id: 'rev_03',
      productId: 'prod_mauve_linen_02',
      productName: 'Mauve Linen Co-Ord Set',
      productSlug: 'mauve-linen-co-ord-set',
      customerId: customerId,
      customerName: 'Saira Saeed',
      customerEmail: 'sairasaeed575@gmail.com',
      orderNumber: 'COM-2026-000101',
      rating: 5,
      title: 'The ultimate airport & brunch set',
      comment: 'Pure linen that doesn’t feel stiff! The mauve color is even more sophisticated in person. I wore this to a weekend brunch and received numerous compliments.',
      isVerifiedPurchase: true,
      status: 'approved',
      createdAt: '2026-02-24T18:40:00.000Z',
    },
    {
      id: 'rev_04',
      productId: 'prod_ivory_pearl_03',
      productName: 'Ivory Pearl Embellished Maxi Dress',
      productSlug: 'ivory-pearl-embellished-dress',
      customerId: customer2Id,
      customerName: 'Amira Khan',
      customerEmail: 'amira.khan@example.com',
      orderNumber: 'COM-2026-000102',
      rating: 5,
      title: 'Felt like royalty at my sister’s engagement',
      comment: 'The pearls are securely attached by hand and catch the evening light delicately. Very flattering cut around the waist.',
      isVerifiedPurchase: true,
      status: 'approved',
      createdAt: '2026-02-28T16:10:00.000Z',
    }
  ];

  const orders: Order[] = [
    {
      id: 'ord_001',
      orderNumber: 'COM-2026-000101',
      customerId: customerId,
      customerName: 'Saira Saeed',
      customerEmail: 'sairasaeed575@gmail.com',
      customerPhone: '+1 (555) 892-1244',
      shippingAddress: {
        id: 'addr_order_1',
        fullName: 'Saira Saeed',
        phone: '+1 (555) 892-1244',
        addressLine: '742 Rosewood Crescent',
        city: 'Beverly Hills',
        state: 'CA',
        postalCode: '90210',
        country: 'United States',
      },
      deliveryMethod: 'Express Delivery (2-3 Business Days)',
      shippingFee: 0,
      paymentMethod: 'Online Payment',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      items: [
        {
          productId: 'prod_rose_lawn_01',
          productName: 'Rose Embroidered Lawn Suit',
          productSlug: 'rose-embroidered-lawn-suit',
          productImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
          variantId: 'v_rose_m',
          sku: 'COM-LNW-001-M',
          size: 'M',
          color: 'Dusty Rose',
          price: 155,
          quantity: 1,
          total: 155,
        },
        {
          productId: 'prod_mauve_linen_02',
          productName: 'Mauve Linen Co-Ord Set',
          productSlug: 'mauve-linen-co-ord-set',
          productImage: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=400&q=80',
          variantId: 'v_mauve_m',
          sku: 'COM-CRD-002-M',
          size: 'M',
          color: 'Mauve Whisper',
          price: 125,
          quantity: 1,
          total: 125,
        }
      ],
      subtotal: 280,
      discountAmount: 28,
      couponCode: 'WELCOME10',
      taxAmount: 12.6,
      grandTotal: 264.6,
      carrier: 'DHL Express',
      trackingNumber: 'TRK-983411',
      notes: 'Customer requested signature on delivery.',
      statusHistory: [
        { timestamp: '2026-02-14T11:00:00.000Z', status: 'Pending', note: 'Order placed by customer via credit card.' },
        { timestamp: '2026-02-14T11:02:00.000Z', status: 'Confirmed', note: 'Payment verified and inventory allocated.' },
        { timestamp: '2026-02-14T15:30:00.000Z', status: 'Processing', note: 'Passed to warehouse packaging team.' },
        { timestamp: '2026-02-15T09:00:00.000Z', status: 'Packed', note: 'Custom garment box & silk ribbon wrapped.' },
        { timestamp: '2026-02-15T14:00:00.000Z', status: 'Shipped', note: 'Picked up by DHL Express. Tracking # TRK-983411' },
        { timestamp: '2026-02-17T08:30:00.000Z', status: 'Out for Delivery', note: 'On courier van for destination address.' },
        { timestamp: '2026-02-17T13:45:00.000Z', status: 'Delivered', note: 'Signed for by Saira Saeed.' }
      ],
      createdAt: '2026-02-14T11:00:00.000Z',
      updatedAt: '2026-02-17T13:45:00.000Z',
      isReturnEligible: true,
    },
    {
      id: 'ord_002',
      orderNumber: 'COM-2026-000102',
      customerId: customer2Id,
      customerName: 'Amira Khan',
      customerEmail: 'amira.khan@example.com',
      customerPhone: '+1 (555) 431-7788',
      shippingAddress: {
        id: 'addr_order_2',
        fullName: 'Amira Khan',
        phone: '+1 (555) 431-7788',
        addressLine: '128 Kensington Way',
        city: 'London',
        state: 'Greater London',
        postalCode: 'SW7 2AZ',
        country: 'United Kingdom',
      },
      deliveryMethod: 'Express Delivery (2-3 Business Days)',
      shippingFee: 0,
      paymentMethod: 'Online Payment',
      paymentStatus: 'Paid',
      orderStatus: 'Shipped',
      items: [
        {
          productId: 'prod_ivory_pearl_03',
          productName: 'Ivory Pearl Embellished Maxi Dress',
          productSlug: 'ivory-pearl-embellished-dress',
          productImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80',
          variantId: 'v_ivory_s',
          sku: 'COM-EVN-003-S',
          size: 'S',
          color: 'Ivory Pearl',
          price: 220,
          quantity: 1,
          total: 220,
        }
      ],
      subtotal: 220,
      discountAmount: 44,
      couponCode: 'ELEGANCE20',
      taxAmount: 8.8,
      grandTotal: 184.8,
      carrier: 'FedEx International',
      trackingNumber: 'TRK-983422',
      statusHistory: [
        { timestamp: '2026-02-20T14:00:00.000Z', status: 'Pending', note: 'Order placed by customer.' },
        { timestamp: '2026-02-20T14:05:00.000Z', status: 'Confirmed', note: 'Payment captured.' },
        { timestamp: '2026-02-21T10:00:00.000Z', status: 'Processing', note: 'Quality check and steaming.' },
        { timestamp: '2026-02-21T16:00:00.000Z', status: 'Shipped', note: 'Dispatched via FedEx International. Tracking: TRK-983422' }
      ],
      createdAt: '2026-02-20T14:00:00.000Z',
      updatedAt: '2026-02-21T16:00:00.000Z',
      isReturnEligible: true,
    }
  ];

  const inventoryMovements: InventoryMovement[] = [
    {
      id: 'mov_01',
      variantId: 'v_rose_m',
      sku: 'COM-LNW-001-M',
      productName: 'Rose Embroidered Lawn Suit',
      changeType: 'stock_in',
      quantityChange: 25,
      previousQuantity: 0,
      newQuantity: 25,
      reason: 'Spring Batch Initial Inward',
      reference: 'PO-2026-001',
      user: 'Victoria Vance',
      timestamp: '2026-02-01T09:00:00.000Z',
    },
    {
      id: 'mov_02',
      variantId: 'v_rose_m',
      sku: 'COM-LNW-001-M',
      productName: 'Rose Embroidered Lawn Suit',
      changeType: 'sold',
      quantityChange: -1,
      previousQuantity: 25,
      newQuantity: 24,
      reason: 'Order fulfilled',
      reference: 'COM-2026-000101',
      user: 'System Checkout',
      timestamp: '2026-02-14T11:00:00.000Z',
    }
  ];

  const storeSettings: StoreSettings = {
    storeName: 'COMFORT',
    tagline: 'Ladies Garments',
    currencyCode: 'USD',
    currencySymbol: '$',
    taxRatePercent: 5,
    isTaxInclusive: false,
    freeShippingThreshold: 50,
    standardShippingFee: 10,
    expressShippingFee: 20,
    supportEmail: 'care@comfortgarments.com',
    supportPhone: '+1 (800) 450-COZY',
    announcementBarText: 'Complimentary Express Delivery on Orders Over $50  •  Hassle-Free 14-Day Returns  •  100% Certified Fabrics',
    announcementBarEnabled: true,
  };

  const cms: HomepageCMS = {
    announcementBar: {
      enabled: true,
      text: 'Complimentary Express Delivery on Orders Over $50  •  Hassle-Free 14-Day Returns  •  100% Certified Fabrics',
      link: '/shop',
    },
    hero: {
      badge: 'SPRING / SUMMER 2026',
      title: 'Elegance in Every Stitch',
      description: 'Discover timeless women’s wear crafted from pure botanical lawn, European flax linen, and handcrafted zardozi silks. Designed for comfort, confidence, and every radiant moment.',
      primaryCtaText: 'Shop New Arrivals',
      primaryCtaLink: '/shop/new-arrivals',
      secondaryCtaText: 'Explore Collection',
      secondaryCtaLink: '/shop',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1400&q=85',
      secondaryBannerImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=85',
      secondaryBadge: 'NEW COLLECTION',
      secondaryTitle: 'Fresh Styles • Soft Fabrics',
      secondarySubtitle: 'Everyday Elegance Tailored For You',
    },
    trustBar: [
      {
        title: 'Fast & Free Shipping',
        subtitle: 'On all orders above $50',
        icon: 'Truck',
      },
      {
        title: 'Easy 14-Day Returns',
        subtitle: 'Complimentary return pickups',
        icon: 'RotateCcw',
      },
      {
        title: '100% Secure Checkout',
        subtitle: 'Encrypted multi-currency payments',
        icon: 'ShieldCheck',
      },
      {
        title: 'Bespoke Customer Care',
        subtitle: 'Personal styling & concierge',
        icon: 'Sparkles',
      }
    ]
  };

  const auditLogs: AuditLog[] = [
    {
      id: 'aud_01',
      user: 'Victoria Vance',
      action: 'Initial System Boot',
      entity: 'StoreSettings',
      entityId: 'settings',
      details: 'Bootstrapped COMFORT store catalog and inventory tables.',
      timestamp: '2026-02-01T08:00:00.000Z',
    }
  ];

  return {
    users,
    passwords,
    products,
    categories,
    collections,
    orders,
    coupons,
    reviews,
    returns: [],
    inventoryMovements,
    storeSettings,
    cms,
    auditLogs,
    contactMessages: [
      {
        id: 'msg_01',
        name: 'Fatima Zahra',
        email: 'fatima@example.com',
        phone: '+1 (555) 777-8899',
        subject: 'Custom Sizing Question for Rose Lawn Suit',
        message: 'Hello, could you let me know if custom alterations on sleeve length are available for bridal orders?',
        status: 'new',
        createdAt: '2026-02-26T10:15:00.000Z',
      }
    ],
    newsletterSubscribers: [
      {
        id: 'sub_01',
        email: 'sairasaeed575@gmail.com',
        subscribedAt: '2026-02-14T10:35:00.000Z',
      }
    ]
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed reading DB file, re-seeding:', err);
    }
    const seed = generateInitialSeed();
    this.save(seed);
    return seed;
  }

  private save(dataToSave?: DatabaseSchema) {
    const toWrite = dataToSave || this.data;
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(toWrite, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  // --- Users & Auth ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'status'>, passwordPlain: string): User {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(passwordPlain, salt);

    const newUser: User = {
      ...userData,
      id,
      createdAt: new Date().toISOString(),
      status: 'active',
      addresses: userData.addresses || [],
    };

    this.data.users.push(newUser);
    this.data.passwords[id] = { salt, hash };
    this.save();
    this.logAudit(newUser.name, 'Create User', 'User', id, `Registered user ${newUser.email}`);
    return newUser;
  }

  verifyPassword(userId: string, passwordPlain: string): boolean {
    const creds = this.data.passwords[userId];
    if (!creds) return false;
    const computed = hashPassword(passwordPlain, creds.salt);
    return computed === creds.hash;
  }

  updateUserPassword(userId: string, newPasswordPlain: string): boolean {
    const creds = this.data.passwords[userId];
    if (!creds) return false;
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(newPasswordPlain, salt);
    this.data.passwords[userId] = { salt, hash };
    this.save();
    return true;
  }

  updateUserProfile(userId: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- Products ---
  getProducts(): Product[] {
    // Enrich with dynamic review calculations
    return this.data.products.map(p => {
      const prodReviews = this.data.reviews.filter(r => r.productId === p.id && r.status === 'approved');
      const reviewCount = prodReviews.length;
      const rating = reviewCount > 0 
        ? Number((prodReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 0;
      return {
        ...p,
        rating,
        reviewCount,
      };
    });
  }

  getProductById(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    const products = this.getProducts();
    return products.find(p => p.slug === slug);
  }

  createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'totalSold'>, authorName: string): Product {
    const id = `prod_${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id,
      createdAt: new Date().toISOString(),
      totalSold: 0,
    };
    this.data.products.unshift(newProduct);
    this.save();
    this.logAudit(authorName, 'Create Product', 'Product', id, `Created product ${newProduct.name} (${newProduct.sku})`);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>, authorName: string): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.save();
    this.logAudit(authorName, 'Update Product', 'Product', id, `Updated product details for ${this.data.products[idx].name}`);
    return this.data.products[idx];
  }

  deleteProduct(id: string, authorName: string): boolean {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    const name = this.data.products[idx].name;
    this.data.products.splice(idx, 1);
    this.save();
    this.logAudit(authorName, 'Delete Product', 'Product', id, `Deleted product ${name}`);
    return true;
  }

  // --- Inventory & Stock ---
  adjustInventory(
    variantId: string, 
    change: number, 
    reason: string, 
    changeType: InventoryMovement['changeType'], 
    user: string, 
    reference?: string
  ): { success: boolean; newStock: number; message?: string } {
    let targetVariant: any = null;
    let targetProduct: Product | null = null;

    for (const p of this.data.products) {
      const v = p.variants.find(item => item.id === variantId);
      if (v) {
        targetVariant = v;
        targetProduct = p;
        break;
      }
    }

    if (!targetVariant || !targetProduct) {
      return { success: false, newStock: 0, message: 'Variant not found' };
    }

    const previousQuantity = targetVariant.stock;
    const newQuantity = previousQuantity + change;
    if (newQuantity < 0) {
      return { success: false, newStock: previousQuantity, message: 'Insufficient stock' };
    }

    targetVariant.stock = newQuantity;

    const movement: InventoryMovement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      variantId,
      sku: targetVariant.sku,
      productName: targetProduct.name,
      changeType,
      quantityChange: change,
      previousQuantity,
      newQuantity,
      reason,
      reference,
      user,
      timestamp: new Date().toISOString(),
    };

    this.data.inventoryMovements.unshift(movement);
    this.save();

    this.logAudit(user, 'Adjust Inventory', 'Inventory', variantId, `${reason}: ${targetVariant.sku} from ${previousQuantity} to ${newQuantity}`);

    return { success: true, newStock: newQuantity };
  }

  getInventoryMovements(): InventoryMovement[] {
    return this.data.inventoryMovements;
  }

  // --- Categories & Collections ---
  getCategories(): Category[] {
    return this.data.categories;
  }

  saveCategory(cat: Category, user: string): Category {
    const idx = this.data.categories.findIndex(c => c.id === cat.id);
    if (idx >= 0) {
      this.data.categories[idx] = cat;
    } else {
      this.data.categories.push(cat);
    }
    this.save();
    this.logAudit(user, 'Save Category', 'Category', cat.id, `Saved category ${cat.name}`);
    return cat;
  }

  getCollections(): Collection[] {
    return this.data.collections;
  }

  // --- Coupons ---
  getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  getCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  }

  saveCoupon(coupon: Coupon, user: string): Coupon {
    const idx = this.data.coupons.findIndex(c => c.id === coupon.id);
    if (idx >= 0) {
      this.data.coupons[idx] = coupon;
    } else {
      this.data.coupons.unshift(coupon);
    }
    this.save();
    this.logAudit(user, 'Save Coupon', 'Coupon', coupon.id, `Saved coupon code ${coupon.code}`);
    return coupon;
  }

  // --- Orders ---
  getOrders(): Order[] {
    return this.data.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  getOrderByNumber(orderNumber: string): Order | undefined {
    return this.data.orders.find(o => o.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase());
  }

  createOrder(orderInput: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Order {
    const count = this.data.orders.length + 101;
    const orderNumber = `COM-2026-${String(count).padStart(6, '0')}`;
    const id = `ord_${Date.now()}`;
    const now = new Date().toISOString();

    // 1. Check & Decrement Inventory atomically
    for (const item of orderInput.items) {
      const res = this.adjustInventory(
        item.variantId, 
        -item.quantity, 
        `Order ${orderNumber} placed`, 
        'sold', 
        'System Checkout', 
        orderNumber
      );
      if (!res.success) {
        throw new Error(`Insufficient inventory for item ${item.productName} (${item.sku}): ${res.message}`);
      }
    }

    // 2. Increment product totalSold counts
    for (const item of orderInput.items) {
      const p = this.data.products.find(x => x.id === item.productId);
      if (p) {
        p.totalSold = (p.totalSold || 0) + item.quantity;
      }
    }

    // 3. Increment coupon usage if used
    if (orderInput.couponCode) {
      const c = this.getCouponByCode(orderInput.couponCode);
      if (c) {
        c.usageCount = (c.usageCount || 0) + 1;
      }
    }

    const newOrder: Order = {
      ...orderInput,
      id,
      orderNumber,
      statusHistory: [
        {
          timestamp: now,
          status: 'Pending',
          note: `Order placed via ${orderInput.paymentMethod}. Total: $${orderInput.grandTotal.toFixed(2)}`,
        },
        {
          timestamp: now,
          status: 'Confirmed',
          note: 'Order confirmed and inventory allocated to customer.',
        }
      ],
      createdAt: now,
      updatedAt: now,
      isReturnEligible: true,
    };

    this.data.orders.unshift(newOrder);
    this.save();

    this.logAudit(
      orderInput.customerName || 'Customer', 
      'Place Order', 
      'Order', 
      orderNumber, 
      `Placed order for $${orderInput.grandTotal.toFixed(2)} (${orderInput.items.length} items)`
    );

    return newOrder;
  }

  updateOrderStatus(orderId: string, newStatus: Order['orderStatus'], note: string, updatedBy: string, trackingNumber?: string, carrier?: string): Order | null {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;

    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;

    if (newStatus === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    order.statusHistory.push({
      timestamp: new Date().toISOString(),
      status: newStatus,
      note,
      updatedBy,
    });

    this.save();
    this.logAudit(updatedBy, 'Update Order Status', 'Order', order.orderNumber, `Changed status to ${newStatus}. Note: ${note}`);
    return order;
  }

  refundOrder(orderId: string, amount: number, reason: string, user: string): Order | null {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;

    order.paymentStatus = amount >= order.grandTotal ? 'Refunded' : 'Partially Refunded';
    order.orderStatus = 'Refunded';
    order.updatedAt = new Date().toISOString();

    order.statusHistory.push({
      timestamp: new Date().toISOString(),
      status: 'Refunded',
      note: `Refund of $${amount.toFixed(2)} processed. Reason: ${reason}`,
      updatedBy: user,
    });

    this.save();
    this.logAudit(user, 'Refund Order', 'Order', order.orderNumber, `Processed refund of $${amount.toFixed(2)} for ${reason}`);
    return order;
  }

  // --- Reviews ---
  getReviews(productId?: string): Review[] {
    if (productId) {
      return this.data.reviews.filter(r => r.productId === productId);
    }
    return this.data.reviews;
  }

  addReview(reviewInput: Omit<Review, 'id' | 'createdAt' | 'status' | 'isVerifiedPurchase'>): Review {
    const id = `rev_${Date.now()}`;
    // Check if customer actually placed an order for this product
    const verified = this.data.orders.some(o => 
      o.customerEmail.toLowerCase() === reviewInput.customerEmail.toLowerCase() &&
      o.items.some(item => item.productId === reviewInput.productId) &&
      (o.orderStatus === 'Delivered' || o.orderStatus === 'Shipped')
    );

    const newReview: Review = {
      ...reviewInput,
      id,
      isVerifiedPurchase: verified,
      status: 'approved', // Seed/Storefront direct publication or pending
      createdAt: new Date().toISOString(),
    };

    this.data.reviews.unshift(newReview);
    this.save();
    this.logAudit(reviewInput.customerName, 'Add Review', 'Review', id, `Submitted review for ${reviewInput.productName}`);
    return newReview;
  }

  moderateReview(reviewId: string, status: Review['status'], adminReply?: string, user?: string): Review | null {
    const r = this.data.reviews.find(x => x.id === reviewId);
    if (!r) return null;
    r.status = status;
    if (adminReply !== undefined) r.adminReply = adminReply;
    this.save();
    if (user) {
      this.logAudit(user, 'Moderate Review', 'Review', reviewId, `Set status to ${status}`);
    }
    return r;
  }

  // --- Returns ---
  getReturns(): ReturnRequest[] {
    return this.data.returns;
  }

  createReturn(returnInput: Omit<ReturnRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): ReturnRequest {
    const id = `ret_${Date.now()}`;
    const newReturn: ReturnRequest = {
      ...returnInput,
      id,
      status: 'Requested',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.returns.unshift(newReturn);
    this.save();
    this.logAudit(returnInput.customerName, 'Request Return', 'Return', id, `Return requested for order ${returnInput.orderNumber}`);
    return newReturn;
  }

  updateReturnStatus(returnId: string, status: ReturnRequest['status'], adminNotes: string, user: string): ReturnRequest | null {
    const r = this.data.returns.find(x => x.id === returnId);
    if (!r) return null;
    r.status = status;
    r.adminNotes = adminNotes;
    r.updatedAt = new Date().toISOString();
    this.save();
    this.logAudit(user, 'Update Return', 'Return', returnId, `Set return status to ${status}`);
    return r;
  }

  // --- Store Settings & CMS ---
  getSettings(): StoreSettings {
    return this.data.storeSettings;
  }

  updateSettings(settings: Partial<StoreSettings>, user: string): StoreSettings {
    this.data.storeSettings = { ...this.data.storeSettings, ...settings };
    this.save();
    this.logAudit(user, 'Update Store Settings', 'StoreSettings', 'settings', 'Updated store configuration');
    return this.data.storeSettings;
  }

  getCMS(): HomepageCMS {
    return this.data.cms;
  }

  updateCMS(cms: HomepageCMS, user: string): HomepageCMS {
    this.data.cms = cms;
    this.save();
    this.logAudit(user, 'Update Homepage CMS', 'CMS', 'homepage', 'Updated homepage banner and trust bar');
    return this.data.cms;
  }

  // --- Contact & Newsletter ---
  addContactMessage(msg: { name: string; email: string; phone?: string; subject: string; message: string }) {
    const record = {
      id: `msg_${Date.now()}`,
      ...msg,
      status: 'new' as const,
      createdAt: new Date().toISOString(),
    };
    this.data.contactMessages.unshift(record);
    this.save();
    return record;
  }

  getContactMessages() {
    return this.data.contactMessages;
  }

  addNewsletterSubscriber(email: string) {
    const exists = this.data.newsletterSubscribers.some(s => s.email.toLowerCase() === email.toLowerCase());
    if (exists) return { success: true, message: 'Already subscribed' };
    this.data.newsletterSubscribers.unshift({
      id: `sub_${Date.now()}`,
      email,
      subscribedAt: new Date().toISOString(),
    });
    this.save();
    return { success: true, message: 'Subscribed successfully' };
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  logAudit(user: string, action: string, entity: string, entityId: string, details: string) {
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      user,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs.pop();
    }
  }
}

export const db = new Database();
