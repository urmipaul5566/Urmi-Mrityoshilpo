import React, { useState, useEffect } from "react";
import { 
  ArrowRight, Heart, ShoppingBag, Eye, Trash2, Check, Sparkles, 
  ShieldCheck, Truck, Star, Filter, ChevronRight, MessageSquare, 
  AlertCircle, ChevronLeft, Calendar, HelpCircle, FileText, Plus, Edit
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Product, User, Order, Coupon, SliderItem, BannerItem } from "./types";
import { api } from "./lib/api";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import QuickViewModal from "./components/QuickViewModal";
import AdminPanel from "./components/AdminPanel";
import CustomerDashboard from "./components/CustomerDashboard";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState("home"); // home, shop, gallery, about, contact, dashboard, admin
  const [pageParams, setPageParams] = useState<any>({});

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [activeSliderIdx, setActiveSliderIdx] = useState(0);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Active Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Checkout State
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Shipping, 3: Payment, 4: Success
  const [shippingForm, setShippingForm] = useState({
    name: "",
    phone: "",
    email: "",
    division: "Dhaka",
    district: "Dhaka",
    address: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod, bkash, nagad
  const [paymentOtp, setPaymentOtp] = useState("");
  const [paymentPin, setPaymentPin] = useState("");
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  
  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Placed Order Success Meta
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Shop Filters State
  const [shopCategory, setShopCategory] = useState("All");
  const [shopSort, setShopSort] = useState("featured");
  const [shopSearch, setShopSearch] = useState("");
  const [shopPriceRange, setShopPriceRange] = useState(3000);
  const [shopInStockOnly, setShopInStockOnly] = useState(false);

  // Gallery Preview Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Auth Form State
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    usernameOrEmail: ""
  });
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const loadStoreData = () => {
    setLoading(true);
    return Promise.all([
      api.products.list({ limit: 100 }),
      api.home.get()
    ]).then(([prodRes, homeRes]) => {
      setProducts(prodRes.products);
      
      // Categorize products
      setFeaturedProducts(prodRes.products.filter(p => p.isFeatured));
      setNewArrivals(prodRes.products.filter(p => p.isNewArrival));
      setBestSellers(prodRes.products.filter(p => p.isBestSeller));

      setSliders(homeRes.sliders);
      setBanners(homeRes.banners);
    }).catch((err) => {
      console.error("Error loading products and metadata:", err);
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পণ্যটি ডিলিট করতে চান?")) return;
    try {
      await api.products.delete(id);
      alert("পণ্যটি সফলভাবে ডিলিট করা হয়েছে");
      loadStoreData();
    } catch (err) {
      alert("পণ্য ডিলিট করা সম্ভব হয়নি");
    }
  };

  const handleEditProduct = (product: Product) => {
    setCurrentPage("admin");
    alert("পণ্যটি এডিটের বিস্তারিত পরিবর্তনের জন্য নিচের এডমিন প্যানেলের 'পণ্যসমূহ' সেকশনে যান।");
  };

  // Initialize and check login session
  useEffect(() => {
    // Check if user is logged in
    api.auth.me()
      .then((userRes) => setCurrentUser(userRes))
      .catch(() => setCurrentUser(null));

    // Load storefront products and home sliders
    loadStoreData();

    // Read Cart and Wishlist from local storage
    const storedCart = localStorage.getItem("urmi_cart");
    if (storedCart) {
      try { setCart(JSON.parse(storedCart)); } catch (e) {}
    }

    const storedWish = localStorage.getItem("urmi_wishlist");
    if (storedWish) {
      try { setWishlist(JSON.parse(storedWish)); } catch (e) {}
    }
  }, []);

  // Sync cart to local storage
  const updateCartState = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("urmi_cart", JSON.stringify(newCart));
  };

  const updateWishlistState = (newWish: Product[]) => {
    setWishlist(newWish);
    localStorage.setItem("urmi_wishlist", JSON.stringify(newWish));
  };

  // Add item to cart
  const handleAddToCart = (product: Product, quantity = 1) => {
    const existingIdx = cart.findIndex(item => item.product.id === product.id);
    if (existingIdx > -1) {
      const updated = [...cart];
      updated[existingIdx].quantity += quantity;
      updateCartState(updated);
    } else {
      updateCartState([...cart, { product, quantity }]);
    }
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (id: string, qty: number) => {
    const updated = cart.map(item => {
      if (item.product.id === id) {
        return { ...item, quantity: Math.max(1, qty) };
      }
      return item;
    });
    updateCartState(updated);
  };

  const handleRemoveFromCart = (id: string) => {
    updateCartState(cart.filter(item => item.product.id !== id));
  };

  // Toggle Wishlist
  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some(p => p.id === product.id);
    if (exists) {
      updateWishlistState(wishlist.filter(p => p.id !== product.id));
    } else {
      updateWishlistState([...wishlist, product]);
    }
  };

  // Automated Hero Slider Transitions
  useEffect(() => {
    if (sliders.length === 0 || currentPage !== "home") return;
    const interval = setInterval(() => {
      setActiveSliderIdx((prev) => (prev + 1) % sliders.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [sliders, currentPage]);

  // Navigate function that syncs values
  const handleNavigation = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || {});
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Handle deep route category triggers
    if (page === "shop") {
      if (params?.category) {
        setShopCategory(params.category);
      }
      if (params?.search) {
        setShopSearch(params.search);
      }
    }
  };

  // Buy Now immediate checkout operation
  const handleBuyNow = (product: Product, quantity = 1) => {
    // Set checkout cart to just this item
    updateCartState([{ product, quantity }]);
    handleNavigation("checkout");
  };

  // Apply Coupon Code Validation
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    if (!couponCode.trim()) return;

    try {
      const subtotal = cart.reduce((acc, item) => acc + (item.product.discountPrice || item.product.price) * item.quantity, 0);
      const coupon = await api.coupons.validate(couponCode.trim(), subtotal);
      setActiveCoupon(coupon);
      setCouponSuccess(`কুপন '${coupon.code}' সফলভাবে প্রযোজ্য হয়েছে!`);
    } catch (err: any) {
      setCouponError(err.message || "কুপনটি অকার্যকর বা মেয়াদ শেষ");
      setActiveCoupon(null);
    }
  };

  // Submit Login/Registration
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);

    try {
      if (isRegisterMode) {
        if (!authForm.name || !authForm.email || !authForm.phone || !authForm.password) {
          throw new Error("সবগুলো ঘর পূরণ করুন (Please fill in all fields)");
        }
        const res = await api.auth.register({
          name: authForm.name,
          email: authForm.email,
          phone: authForm.phone,
          password: authForm.password
        });
        setCurrentUser(res.user);
        setAuthForm({ name: "", email: "", phone: "", password: "", usernameOrEmail: "" });
        handleNavigation("home");
      } else {
        if (!authForm.usernameOrEmail || !authForm.password) {
          throw new Error("ইউজারনেম/ইমেইল এবং পাসওয়ার্ড প্রদান করুন (Please provide credentials)");
        }
        const res = await api.auth.login(authForm.usernameOrEmail, authForm.password);
        setCurrentUser(res.user);
        setAuthForm({ name: "", email: "", phone: "", password: "", usernameOrEmail: "" });
        if (res.user.role === "admin") {
          handleNavigation("admin");
        } else {
          handleNavigation("home");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "কাজটি সম্পন্ন করা যায়নি");
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Placed Order Submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setSimulatingPayment(true);
    
    // Calculate values
    const subtotal = cart.reduce((acc, item) => acc + (item.product.discountPrice || item.product.price) * item.quantity, 0);
    const shippingCharge = shippingForm.division === "Dhaka" ? 60 : 120;
    
    let couponDiscount = 0;
    if (activeCoupon) {
      if (activeCoupon.discountType === "percentage") {
        couponDiscount = Math.round((subtotal * activeCoupon.discountValue) / 100);
      } else {
        couponDiscount = activeCoupon.discountValue;
      }
    }

    const total = subtotal + shippingCharge - couponDiscount;

    const orderPayload = {
      customerName: shippingForm.name,
      phone: shippingForm.phone,
      email: shippingForm.email || undefined,
      division: shippingForm.division,
      district: shippingForm.district,
      shippingAddress: shippingForm.address,
      paymentMethod,
      items: cart.map(i => ({
        productId: i.product.id,
        nameBangla: i.product.nameBangla,
        nameEnglish: i.product.nameEnglish,
        price: i.product.discountPrice || i.product.price,
        quantity: i.quantity
      })),
      subtotal,
      shippingCharge,
      couponCode: activeCoupon?.code || undefined,
      couponDiscount,
      total
    };

    try {
      // Create Order
      const res = await api.orders.create(orderPayload);
      setPlacedOrder(res);
      setCheckoutStep(4); // Success screen
      
      // Empty local cart
      updateCartState([]);
      setActiveCoupon(null);
      setCouponCode("");
    } catch (err: any) {
      alert(err.message || "অর্ডার প্লেস করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setSimulatingPayment(false);
    }
  };

  // Division/District lists mapping
  const bdDistricts: { [key: string]: string[] } = {
    Dhaka: ["Dhaka", "Gazipur", "Narayanganj", "Savar", "Tangail", "Manikganj", "Munshiganj", "Narsingdi", "Faridpur"],
    Chittagong: ["Chittagong", "Cox's Bazar", "Cumilla", "Feni", "Noakhali", "Rangamati", "Bandarban", "Khagrachhari", "Brahmanbaria"],
    Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
    Khulna: ["Khulna", "Jashore", "Satkhira", "Bagerhat", "Kushtia"],
    Barisal: ["Barisal", "Bhola", "Patuakhali", "Pirojpur", "Barguna", "Jhalokati"],
    Rajshahi: ["Rajshahi", "Bogura", "Pabna", "Sirajganj", "Naogaon", "Natore", "Joypurhat"],
    Rangpur: ["Rangpur", "Dinajpur", "Kurigram", "Gaibandha", "Lalmonirhat"],
    Mymensingh: ["Mymensingh", "Sherpur", "Jamalpur", "Netrokona"]
  };

  // Sync profile to shipping form on mount/change
  useEffect(() => {
    if (currentUser) {
      setShippingForm({
        name: currentUser.name,
        phone: currentUser.phone,
        email: currentUser.email || "",
        division: currentUser.division || "Dhaka",
        district: currentUser.district || "Dhaka",
        address: currentUser.address || ""
      });
    }
  }, [currentUser]);

  // Shop Filter Logic
  const filteredProducts = products.filter((p) => {
    // Search filter
    const matchesSearch = shopSearch.trim() === "" || 
      p.nameBangla.toLowerCase().includes(shopSearch.toLowerCase()) ||
      p.nameEnglish.toLowerCase().includes(shopSearch.toLowerCase()) ||
      p.SKU.toLowerCase().includes(shopSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(shopSearch.toLowerCase());

    // Category filter
    const matchesCategory = shopCategory === "All" || p.category === shopCategory;

    // Price filter
    const actualPrice = p.discountPrice || p.price;
    const matchesPrice = actualPrice <= shopPriceRange;

    // In stock filter
    const matchesStock = !shopInStockOnly || p.stock > 0;

    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  }).sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;

    if (shopSort === "price-low") return priceA - priceB;
    if (shopSort === "price-high") return priceB - priceA;
    if (shopSort === "rating") return b.rating - a.rating;
    return 0; // default featured
  });

  return (
    <div className="bg-[#FFF8F2] min-h-screen text-[#222222] font-bangla flex flex-col justify-between selection:bg-clay-accent/30 selection:text-clay-text">
      
      {/* Dynamic Header Component */}
      <Header
        user={currentUser}
        onLogout={() => {
          api.auth.logout();
          setCurrentUser(null);
          handleNavigation("home");
        }}
        onNavigate={handleNavigation}
        cart={cart}
        wishlist={wishlist}
        onOpenCart={() => setIsCartOpen(true)}
        activePage={currentPage}
      />

      {/* Main Container */}
      <main className="flex-grow pt-24 pb-12">
        <AnimatePresence mode="wait">
          
          {/* VIEW: HOME PAGE */}
          {currentPage === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-12"
            >
              {/* Luxury Hero Slider Row */}
              {sliders.length > 0 && (
                <div className="relative h-[420px] md:h-[500px] w-full overflow-hidden">
                  {sliders.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${idx === activeSliderIdx ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                    >
                      {/* background overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10"></div>
                      <img src={slide.image} alt={slide.titleBangla} className="absolute inset-0 w-full h-full object-cover" />
                      
                      {/* slide content */}
                      <div className="relative max-w-7xl mx-auto px-4 z-20 text-[#FFF8F2] flex flex-col gap-4 items-start">
                        <span className="bg-clay-accent text-clay-text text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                          {slide.tagline}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold font-bangla leading-tight text-white max-w-2xl drop-shadow">
                          {slide.titleBangla}
                        </h1>
                        <p className="text-xs md:text-sm font-sans italic opacity-80 max-w-xl">
                          {slide.titleEnglish}
                        </p>
                        <button
                          onClick={() => handleNavigation("shop")}
                          className="bg-clay-accent hover:bg-clay-accent/80 text-clay-text font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 mt-2"
                        >
                          আমাদের পণ্যসমূহ দেখুন (Shop Now)
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Manual Slider Dots */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {sliders.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSliderIdx(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${idx === activeSliderIdx ? "bg-clay-accent scale-125" : "bg-white/45"}`}
                      ></button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clay Bento Highlights / Why Us */}
              <div className="max-w-7xl mx-auto px-4 w-full">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <h2 className="text-2xl md:text-3xl font-black text-clay-primary font-bangla">খাঁটি ঐতিহ্য ও মাটির আভিজাত্য</h2>
                  <p className="text-xs text-clay-secondary mt-1">উর্মি মৃৎশিল্প থেকে কেনাকাটার বিশেষ সুবিধাসমূহ</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-clay-secondary/10 flex flex-col items-center text-center gap-3 clay-shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-clay-primary/10 text-clay-primary flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold font-bangla">১০০% হাতে তৈরি ঐতিহ্য</h4>
                    <p className="text-xs text-gray-500 font-bangla leading-relaxed">বাংলাদেশের প্রত্যন্ত অঞ্চলের দক্ষ মৃৎশিল্পীদের নিপুণ কারিগরিতে খোদাই করা অনন্য মাটির পণ্য।</p>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-clay-secondary/10 flex flex-col items-center text-center gap-3 clay-shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-clay-accent/10 text-clay-primary flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold font-bangla">পরিবেশবান্ধব ও সম্পূর্ণ ন্যাচারাল</h4>
                    <p className="text-xs text-gray-500 font-bangla leading-relaxed">নদীর খাঁটি পলিমাটি দিয়ে তৈরি, কোনো ক্ষতিকারক রাসায়নিক বা সীসা (lead) মুক্ত স্বাস্থ্যসম্মত সামগ্রী।</p>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-clay-secondary/10 flex flex-col items-center text-center gap-3 clay-shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                      <Truck className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold font-bangla">নিরাপদ ডাবল-কার্টন প্যাকেজিং</h4>
                    <p className="text-xs text-gray-500 font-bangla leading-relaxed">মাটির পণ্যগুলো যেন ভেঙে না যায় সেজন্য আমরা দিই সর্বোচ্চ থার্মোকল ও বাবল র্যাপ সম্বলিত ৫-লেয়ার প্যাকেজিং।</p>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-clay-secondary/10 flex flex-col items-center text-center gap-3 clay-shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center">
                      <Heart className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold font-bangla">সরাসরি কারিগরদের সহায়তা</h4>
                    <p className="text-xs text-gray-500 font-bangla leading-relaxed">আমাদের প্রতিটি ক্রয়ের একটি লভ্যাংশ সরাসরি তৃণমূলের কুমার পরিবারের জীবনমান উন্নয়নে অবদান রাখে।</p>
                  </div>
                </div>
              </div>

              {/* Best Sellers Showcase Grid */}
              <div className="max-w-7xl mx-auto px-4 w-full">
                <div className="flex justify-between items-end mb-6 border-b border-clay-secondary/10 pb-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold font-bangla text-clay-primary">বেস্ট সেলার সামগ্রী (Best Sellers)</h2>
                    <p className="text-xs text-clay-secondary">ক্রেতাদের পছন্দের তালিকায় শীর্ষে থাকা নান্দনিক মৃৎশিল্প</p>
                  </div>
                  <button
                    onClick={() => handleNavigation("shop")}
                    className="text-xs font-bold text-clay-primary hover:text-clay-accent flex items-center gap-1 transition-colors"
                  >
                    সবগুলো দেখুন (All)
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {loading ? (
                  <p className="text-xs text-gray-400">লোডিং...</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {bestSellers.slice(0, 4).map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        isWishlisted={wishlist.some(w => w.id === p.id)}
                        onToggleWishlist={handleToggleWishlist}
                        isAdmin={currentUser?.role === "admin"}
                        onDeleteProduct={handleDeleteProduct}
                        onEditProduct={handleEditProduct}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Heritage Clay Story banner */}
              <div className="bg-clay-primary/5 border-y border-clay-primary/10 py-12">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-5 aspect-video md:aspect-square rounded-3xl overflow-hidden border border-clay-secondary/15 relative">
                    <img
                      src="https://images.unsplash.com/photo-1595206133361-b1fe343e5e23?q=80&w=600&auto=format&fit=crop"
                      alt="Traditional Pottery"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                      <p className="text-white text-xs font-bangla italic">ধামরাই পাল পাড়ায় মাটি আকৃতির নিপুণ দৃশ্য</p>
                    </div>
                  </div>

                  <div className="md:col-span-7 flex flex-col gap-4 items-start">
                    <span className="bg-clay-secondary/10 text-clay-primary text-xs font-bold px-3 py-1 rounded-full uppercase">
                      বাংলাদেশী ঐতিহ্য
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-clay-primary font-bangla leading-snug">
                      মৃৎশিল্প: বাংলার হাজার বছরের আদি সংস্কৃতি
                    </h3>
                    <p className="text-xs md:text-sm text-clay-text/80 leading-relaxed font-bangla font-medium">
                      বাংলাদেশি মৃৎশিল্প শুধু গৃহস্থালির জিনিসপত্র বানানোর জন্য নয়, এটি আমাদের সংস্কৃতির গভীর শেকড়। ধামরাই, সাভার এবং কুমিল্লার পাল পাড়াগুলোর কুমার পরিবারগুলো যুগ যুগ ধরে এই ঐতিহ্যকে টিকিয়ে রেখেছে। নদীমাতৃক বাংলার দোআঁশ ও এঁটেল মাটি দিয়ে আগুনে পুড়িয়ে তৈরি লাল মাটির পাত্রগুলোর আভিজাত্য যেকোনো আধুনিক আসবাবকে হার মানায়।
                    </p>
                    <button
                      onClick={() => handleNavigation("about")}
                      className="bg-clay-primary hover:bg-clay-secondary text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      আমাদের ঐতিহ্য সম্পর্কে জানুন
                    </button>
                  </div>
                </div>
              </div>

              {/* New Arrivals Showcase Grid */}
              <div className="max-w-7xl mx-auto px-4 w-full">
                <div className="flex justify-between items-end mb-6 border-b border-clay-secondary/10 pb-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold font-bangla text-clay-primary">নতুন সংকলন (New Arrivals)</h2>
                    <p className="text-xs text-clay-secondary">আমাদের কারিগরদের তৈরি একদমই নতুন ডিজাইনের মাটির সামগ্রী</p>
                  </div>
                  <button
                    onClick={() => handleNavigation("shop")}
                    className="text-xs font-bold text-clay-primary hover:text-clay-accent flex items-center gap-1 transition-colors"
                  >
                    সবগুলো দেখুন (All)
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {loading ? (
                  <p className="text-xs text-gray-400">লোডিং...</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {newArrivals.slice(0, 4).map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        onQuickView={(p) => setQuickViewProduct(p)}
                        isWishlisted={wishlist.some(w => w.id === p.id)}
                        onToggleWishlist={handleToggleWishlist}
                        isAdmin={currentUser?.role === "admin"}
                        onDeleteProduct={handleDeleteProduct}
                        onEditProduct={handleEditProduct}
                      />
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {/* VIEW: SHOP PAGE */}
          {currentPage === "shop" && (
            <motion.div
              key="shop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 w-full"
            >
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-clay-primary font-bangla">আমাদের মাটির দোকান (Online Store)</h1>
                <p className="text-xs text-clay-secondary mt-1">সবচেয়ে নান্দনিক ক্যাটাগরির মাটির পণ্য কিনুন ঘরে বসেই</p>
              </div>

              {/* Shop Grid Structure: Filters + Product Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                
                {/* Filters Sidebar */}
                <div className="lg:col-span-3 flex flex-col gap-5 bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-clay-secondary/10 shadow-sm h-fit">
                  <div className="flex items-center justify-between border-b border-clay-secondary/10 pb-2 text-clay-primary">
                    <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Filter className="w-4 h-4" />
                      ফিল্টারসমূহ (Filters)
                    </h3>
                    <button
                      onClick={() => {
                        setShopCategory("All");
                        setShopSort("featured");
                        setShopPriceRange(3000);
                        setShopInStockOnly(false);
                      }}
                      className="text-[10px] font-bold text-clay-secondary hover:text-red-500 hover:underline"
                    >
                      ক্লিয়ার অল
                    </button>
                  </div>

                  {/* Categories Filters list */}
                  <div>
                    <h4 className="text-xs font-bold text-clay-secondary mb-2 uppercase tracking-wide">ক্যাটাগরি</h4>
                    <div className="flex flex-col gap-1.5 text-xs font-medium font-bangla">
                      {["All", "Clay Tea Pot", "Clay Flower Pot", "Clay Lamp", "Clay Cup", "Clay Plate", "Clay Vase", "Decoration", "Kitchen Items"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setShopCategory(cat)}
                          className={`text-left px-2.5 py-1.5 rounded-lg transition-colors ${shopCategory === cat ? "bg-clay-primary text-white font-bold" : "hover:bg-clay-secondary/5 text-gray-600"}`}
                        >
                          {cat === "All" ? "সব পণ্য (All Products)" : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort by selection dropdown */}
                  <div>
                    <h4 className="text-xs font-bold text-clay-secondary mb-2 uppercase tracking-wide">সাজানোর পদ্ধতি (Sort By)</h4>
                    <select
                      value={shopSort}
                      onChange={(e) => setShopSort(e.target.value)}
                      className="w-full text-xs bg-[#FFF8F2] border border-clay-secondary/20 rounded-lg p-2 outline-none font-bangla font-semibold"
                    >
                      <option value="featured">ফিচার্ড (Default)</option>
                      <option value="price-low">মূল্য: কম থেকে বেশি</option>
                      <option value="price-high">মূল্য: বেশি থেকে কম</option>
                      <option value="rating">সর্বোচ্চ রেটিং</option>
                    </select>
                  </div>

                  {/* Price Range Slider */}
                  <div>
                    <h4 className="text-xs font-bold text-clay-secondary mb-1.5 uppercase tracking-wide flex justify-between">
                      <span>সর্বোচ্চ মূল্য (Price)</span>
                      <span className="font-sans font-bold">৳{shopPriceRange}</span>
                    </h4>
                    <input
                      type="range"
                      min="50"
                      max="3000"
                      step="50"
                      value={shopPriceRange}
                      onChange={(e) => setShopPriceRange(Number(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-clay-primary"
                    />
                  </div>

                  {/* Stock Checkbox Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold mt-2">
                    <input
                      type="checkbox"
                      checked={shopInStockOnly}
                      onChange={(e) => setShopInStockOnly(e.target.checked)}
                      className="w-4 h-4 text-clay-primary"
                    />
                    শুধুমাত্র স্টকে আছে (In Stock)
                  </label>
                </div>

                {/* Product list grid */}
                <div className="lg:col-span-9 flex flex-col gap-6">
                  
                  {/* Active Filter display tags */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 font-bangla border-b border-clay-secondary/10 pb-3">
                    <p className="font-semibold">মোট <span className="font-sans font-bold text-clay-primary text-sm">{filteredProducts.length}টি</span> প্রডাক্ট পাওয়া গেছে</p>
                    {shopSearch && (
                      <span className="bg-clay-secondary/5 border border-clay-secondary/15 py-1 px-3 rounded-full text-[10px] text-clay-primary">
                        খোঁজা হচ্ছে: "{shopSearch}"
                      </span>
                    )}
                  </div>

                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {filteredProducts.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onAddToCart={handleAddToCart}
                          onBuyNow={handleBuyNow}
                          onQuickView={(p) => setQuickViewProduct(p)}
                          isWishlisted={wishlist.some(w => w.id === p.id)}
                          onToggleWishlist={handleToggleWishlist}
                          isAdmin={currentUser?.role === "admin"}
                          onDeleteProduct={handleDeleteProduct}
                          onEditProduct={handleEditProduct}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white/45 rounded-3xl border border-dashed border-clay-secondary/20">
                      <AlertCircle className="w-12 h-12 text-clay-secondary/40 mx-auto mb-3" />
                      <h4 className="text-base font-bold font-bangla text-clay-primary">কোনো মাটির পণ্য পাওয়া যায়নি</h4>
                      <p className="text-xs text-gray-500 mt-1">অনুগ্রহ করে ফিল্টারের মান পরিবর্তন করে আবার খুঁজুন।</p>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW: PRODUCT GALLERY PAGE */}
          {currentPage === "gallery" && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 w-full"
            >
              <div className="mb-8 text-center max-w-xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-clay-primary font-bangla">মৃৎশিল্প পণ্য গ্যালারি (Gallery Showcase)</h1>
                <p className="text-xs text-clay-secondary mt-1">আমাদের দক্ষ কারিগরদের তৈরি সেরা মাটির তৈজসপত্র ও নান্দনিক শোপিসগুলোর ছবির প্রদর্শনী</p>
              </div>

              {/* Responsive photo gallery with preview options */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((p, idx) => (
                  <div
                    key={p.id}
                    className="group relative rounded-3xl overflow-hidden border border-clay-secondary/10 clay-shadow-sm hover:clay-shadow transition-all aspect-square cursor-pointer"
                    onClick={() => setLightboxImg(p.images[0])}
                  >
                    <img src={p.images[0]} alt="gallery-item" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <p className="text-white text-xs font-bold font-bangla truncate leading-tight">{p.nameBangla}</p>
                      <span className="text-clay-accent text-[10px] uppercase font-bold mt-0.5 tracking-wider font-sans">{p.category}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lightbox full-size screen overlay */}
              {lightboxImg && (
                <div
                  className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-zoom-out"
                  onClick={() => setLightboxImg(null)}
                >
                  <img src={lightboxImg} alt="lightbox-preview" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" referrerPolicy="no-referrer" />
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: ABOUT US PAGE */}
          {currentPage === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 w-full"
            >
              <div className="flex flex-col gap-6 font-bangla text-clay-text text-sm">
                <div className="text-center mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-clay-primary">আমাদের সম্পর্কে (About Urmi Mrityoshilpo)</h1>
                  <p className="text-xs text-clay-secondary mt-1">মাটি ও মানুষের নিবিড় মেলবন্ধনের গল্প</p>
                </div>

                <div className="aspect-video rounded-3xl overflow-hidden border border-clay-secondary/15 relative">
                  <img
                    src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop"
                    alt="Artisan making pot"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 text-white text-xs italic">
                    মৃৎশিল্প ঐতিহ্য রক্ষায় নিবেদিত প্রাণ কারিগর
                  </div>
                </div>

                <div className="space-y-4 leading-relaxed font-medium text-gray-700 bg-white/50 p-6 rounded-3xl border border-clay-secondary/5 shadow-inner">
                  <p>
                    <span className="font-bold text-clay-primary text-base">উর্মি মৃৎশিল্প</span> বাংলাদেশের একটি ঐতিহ্যবাহী ই-কমার্স উদ্যোগ। আমাদের মূল লক্ষ্য ও স্বপ্ন হলো বাংলাদেশের প্রাচীন ও আদি মৃৎশিল্পের গৌরব পুনরুদ্ধার করা এবং এই শিল্পের মূল চালিকাশক্তি—তৃণমূলের মৃৎশিল্পী (কুমার) সমাজকে সরাসরি কাস্টমারদের সাথে সংযুক্ত করার মাধ্যমে তাদের জীবনমানের উন্নয়ন ঘটানো।
                  </p>
                  <p>
                    আমরা সরাসরি সাভারের পাল পাড়া এবং ঢাকার ধামরাই মৃৎশিল্প পল্লী থেকে পণ্য সংগ্রহ ও তৈরি করে থাকি। প্রতিটি পণ্য তৈরিতে কোনো প্রকার সীসা বা কৃত্রিম রাসায়নিক রঞ্জক ব্যবহার করা হয় না। নদীর খাঁটি লাল এঁটেল মাটি দিয়ে নিখুঁত খোদাই করা এই তৈজসপত্রগুলো সম্পূর্ণ পরিবেশবান্ধব ও স্বাস্থ্যসম্মত।
                  </p>
                  <p>
                    আমাদের পণ্যগুলো দেশের প্রতিটি প্রান্তে পৌঁছে দেওয়ার জন্য রয়েছে বিশেষ ট্র্যাকিং সুবিধা এবং নিরাপদ ডাবল-কার্টন বাবল প্যাকেজিং। মাটির পণ্য কোনো কারণে ভাঙা বা ত্রুটিপূর্ণ থাকলে আমরা দ্রুত এক্সচেঞ্জ বা সম্পূর্ণ রিফান্ডের নিশ্চয়তা দিয়ে থাকি।
                  </p>
                </div>

                {/* Key Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-clay-primary/5 p-4 rounded-2xl border border-clay-primary/10">
                    <h4 className="font-bold text-clay-primary mb-1 text-base">৫০০+</h4>
                    <p className="text-xs text-gray-500">তৃণমূল কুমার পরিবার সমর্থিত</p>
                  </div>
                  <div className="bg-clay-primary/5 p-4 rounded-2xl border border-clay-primary/10">
                    <h4 className="font-bold text-clay-primary mb-1 text-base">১০,০০০+</h4>
                    <p className="text-xs text-gray-500">সন্তুষ্ট বাংলাদেশি কাস্টমার</p>
                  </div>
                  <div className="bg-clay-primary/5 p-4 rounded-2xl border border-clay-primary/10">
                    <h4 className="font-bold text-clay-primary mb-1 text-base">১০০%</h4>
                    <p className="text-xs text-gray-500">পরিবেশবান্ধব ও কেমিক্যাল-মুক্ত</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: CONTACT US PAGE */}
          {currentPage === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 w-full"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-clay-primary font-bangla">যোগাযোগ করুন (Contact Us)</h1>
                <p className="text-xs text-clay-secondary mt-1">যেকোনো প্রশ্ন বা কাস্টম মাটির অর্ডার করতে আমাদের সাথে যোগাযোগ করুন</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 font-bangla text-xs">
                
                {/* Details side */}
                <div className="md:col-span-5 flex flex-col gap-4 bg-white/60 p-5 rounded-3xl border border-clay-secondary/10 shadow-sm font-medium">
                  <h4 className="text-sm font-bold text-clay-primary uppercase tracking-wide border-b border-clay-secondary/10 pb-2">আমাদের তথ্য</h4>
                  
                  <div className="space-y-3.5">
                    <div>
                      <p className="text-gray-400 font-semibold mb-0.5">অফিসিয়াল ঠিকানা:</p>
                      <p className="text-clay-text font-semibold">জয়পুরহাট, নতুনহাট গরুহাটি, জয়পুরহাট সদর।</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-semibold mb-0.5">সরাসরি ফোন করুন:</p>
                      <p className="text-clay-text font-bold font-sans text-sm hover:text-clay-primary transition-colors">
                        <a href="tel:01756511455">০১৭৫৬৫১১৪৫৫</a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulated message form */}
                <div className="md:col-span-7 bg-white/60 p-6 rounded-3xl border border-clay-secondary/10 shadow-sm">
                  <h4 className="text-sm font-bold text-clay-primary uppercase tracking-wide mb-4">আমাদের মেসেজ পাঠান</h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    alert("বার্তা পাঠানোর জন্য ধন্যবাদ! আমাদের সাপোর্ট টিম শীঘ্রই যোগাযোগ করবে।");
                    (e.target as HTMLFormElement).reset();
                  }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-500 mb-1">আপনার নাম *</label>
                        <input type="text" required className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-bangla font-semibold" />
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">মোবাইল নম্বর *</label>
                        <input type="text" required className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">ইমেইল</label>
                      <input type="email" className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans" />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">বার্তা (Your Message) *</label>
                      <textarea required rows={3} className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-bangla"></textarea>
                    </div>

                    <button type="submit" className="w-full bg-clay-primary hover:bg-clay-secondary text-white font-bold py-2.5 rounded-xl transition-all shadow-sm">
                      বার্তা পাঠান (Send Message)
                    </button>
                  </form>
                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW: CHECKOUT PAGE */}
          {currentPage === "checkout" && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 w-full"
            >
              {checkoutStep < 4 ? (
                <div>
                  <h1 className="text-2xl font-bold text-clay-primary font-bangla mb-1">অর্ডার নিশ্চিতকরণ ও পেমেন্ট (Checkout)</h1>
                  <p className="text-xs text-clay-secondary mb-6">নিরাপদে অর্ডার প্লেস করতে শিপিং ও পেমেন্ট তথ্য প্রদান করুন</p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs font-bangla">
                    
                    {/* Left Column: Form Info */}
                    <div className="md:col-span-7 space-y-6">
                      
                      {/* Shipping address form card */}
                      <div className="bg-white/60 p-5 rounded-3xl border border-clay-secondary/10 shadow-sm">
                        <h4 className="text-sm font-bold text-clay-primary border-b border-clay-secondary/10 pb-2 mb-4">১. শিপিং ঠিকানা (Delivery Details)</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-500 mb-1">সম্পূর্ণ নাম *</label>
                            <input
                              type="text"
                              required
                              value={shippingForm.name}
                              onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                              className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-3 outline-none focus:border-clay-primary capitalize font-medium"
                              placeholder="মোঃ রহিম আলী"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-500 mb-1">মোবাইল নম্বর *</label>
                              <input
                                type="text"
                                required
                                value={shippingForm.phone}
                                onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                                className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-3 outline-none focus:border-clay-primary font-sans"
                                placeholder="017xxxxxxxx"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-500 mb-1">ইমেইল ঠিকানা</label>
                              <input
                                type="email"
                                value={shippingForm.email}
                                onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                                className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-3 outline-none focus:border-clay-primary font-sans"
                                placeholder="rahim@example.com"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-500 mb-1">বিভাগ (Division) *</label>
                              <select
                                value={shippingForm.division}
                                onChange={(e) => {
                                  const div = e.target.value;
                                  setShippingForm({ 
                                    ...shippingForm, 
                                    division: div, 
                                    district: bdDistricts[div] ? bdDistricts[div][0] : "" 
                                  });
                                }}
                                className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-3 outline-none focus:border-clay-primary"
                              >
                                {Object.keys(bdDistricts).map((div) => (
                                  <option key={div} value={div}>{div}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-gray-500 mb-1">জেলা (District) *</label>
                              <select
                                value={shippingForm.district}
                                onChange={(e) => setShippingForm({ ...shippingForm, district: e.target.value })}
                                className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-3 outline-none focus:border-clay-primary"
                              >
                                {bdDistricts[shippingForm.division]?.map((dist) => (
                                  <option key={dist} value={dist}>{dist}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-gray-500 mb-1">বিস্তারিত ঠিকানা (রুম নং, সড়ক নং, এলাকা) *</label>
                            <textarea
                              required
                              rows={2}
                              value={shippingForm.address}
                              onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                              className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-3 outline-none focus:border-clay-primary"
                              placeholder="বাসা নং, রোড নং, থানা, জেলা..."
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      {/* Payment Method Select */}
                      <div className="bg-white/60 p-5 rounded-3xl border border-clay-secondary/10 shadow-sm">
                        <h4 className="text-sm font-bold text-clay-primary border-b border-clay-secondary/10 pb-2 mb-4">২. পেমেন্ট মেথড (Select Payment Method)</h4>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("cod")}
                            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center font-bold gap-1 transition-all ${paymentMethod === "cod" ? "border-clay-primary bg-clay-primary/5 text-clay-primary" : "border-gray-100 hover:border-gray-200"}`}
                          >
                            <Truck className="w-5 h-5" />
                            ক্যাশ অন ডেলিভারি
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("bkash")}
                            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center font-bold gap-1 transition-all ${paymentMethod === "bkash" ? "border-pink-600 bg-pink-50 text-pink-700" : "border-gray-100 hover:border-gray-200"}`}
                          >
                            <span className="text-xs px-2 py-0.5 rounded bg-pink-600 text-white uppercase tracking-wider">bKash</span>
                            বিকাশ ইনস্ট্যান্ট
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("nagad")}
                            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center text-center font-bold gap-1 transition-all ${paymentMethod === "nagad" ? "border-orange-600 bg-orange-50 text-orange-700" : "border-gray-100 hover:border-gray-200"}`}
                          >
                            <span className="text-xs px-2 py-0.5 rounded bg-orange-600 text-white uppercase tracking-wider">Nagad</span>
                            নগদ পেমেন্ট
                          </button>
                        </div>

                        {/* Interactive bKash / Nagad OTP Simulator */}
                        {["bkash", "nagad"].includes(paymentMethod) && (
                          <div className="mt-4 p-4 rounded-2xl bg-[#FFF8F2] border border-clay-secondary/10 space-y-3">
                            <p className="font-semibold text-gray-500">মোবাইল ব্যাংকিং গেটওয়ে সিমুলেশন:</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] text-gray-400 mb-1">বিকাশ/নগদ ওটিপি কোড (OTP Code)</label>
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={paymentOtp}
                                  onChange={(e) => setPaymentOtp(e.target.value.replace(/\D/g, ""))}
                                  placeholder="123456"
                                  className="w-full p-2 rounded-xl bg-white border border-clay-secondary/20 font-sans"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-gray-400 mb-1">পিন নম্বর (Secure Pin)</label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  value={paymentPin}
                                  onChange={(e) => setPaymentPin(e.target.value.replace(/\D/g, ""))}
                                  placeholder="xxxx"
                                  className="w-full p-2 rounded-xl bg-white border border-clay-secondary/20 font-sans"
                                />
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-400 italic block">নিরাপদ পেমেন্ট গেটওয়ে নিশ্চিত করতে পিন ও ওটিপি দিন (সিমুলেশন ওয়ান-টাইম পাসওয়ার্ড)</span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Right Column: Order Summary & Coupons */}
                    <div className="md:col-span-5 space-y-6">
                      
                      {/* Coupon validation code card */}
                      <div className="bg-white/60 p-5 rounded-3xl border border-clay-secondary/10 shadow-sm">
                        <h4 className="text-sm font-bold text-clay-primary mb-3">ডিসকাউন্ট কুপন (Promo Coupon)</h4>
                        
                        <form onSubmit={handleApplyCoupon} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="কুপন কোড (যেমন: CLAY10)..."
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 p-2 rounded-xl bg-[#FFF8F2] border border-clay-secondary/20 outline-none uppercase font-sans font-bold"
                          />
                          <button
                            type="submit"
                            className="bg-clay-primary hover:bg-clay-secondary text-white font-bold px-4 py-2 rounded-xl"
                          >
                            প্রয়োগ
                          </button>
                        </form>

                        {couponError && <p className="text-[10px] text-red-600 font-bold mt-1.5">{couponError}</p>}
                        {couponSuccess && <p className="text-[10px] text-green-700 font-bold mt-1.5">{couponSuccess}</p>}
                      </div>

                      {/* Summary calculations */}
                      <div className="bg-white/60 p-5 rounded-3xl border border-clay-secondary/10 shadow-sm space-y-3 font-bangla font-semibold">
                        <h4 className="text-sm font-bold text-clay-primary border-b border-clay-secondary/10 pb-2 mb-2">অর্ডার সারাংশ (Order Summary)</h4>
                        
                        <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                          {cart.length === 0 ? (
                            <div className="text-center py-4 text-gray-400 text-xs font-bangla">
                              কোনো পণ্য নেই। কেনাকাটা করতে হোমে যান।
                            </div>
                          ) : (
                            cart.map((item) => (
                              <div key={item.product.id} className="flex items-center justify-between gap-2 p-2 bg-white/40 rounded-2xl border border-clay-secondary/5 hover:border-clay-secondary/15 transition-all text-gray-600 text-[11px]">
                                <div className="flex-1 min-w-0 pr-1">
                                  <p className="font-bold text-clay-primary truncate max-w-[160px] text-xs">{item.product.nameBangla}</p>
                                  <p className="text-[10px] font-sans text-clay-secondary">
                                    ৳{(item.product.discountPrice || item.product.price)} / পিস
                                  </p>
                                </div>
                                
                                {/* Quantity Adjuster */}
                                <div className="flex items-center gap-1 bg-white border border-clay-secondary/10 rounded-xl px-1.5 py-0.5 shadow-sm">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateCartQty(item.product.id, item.quantity - 1)}
                                    className="w-5 h-5 rounded-lg hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-clay-primary transition-colors"
                                  >
                                    -
                                  </button>
                                  <span className="w-5 text-center font-sans font-bold text-xs">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateCartQty(item.product.id, item.quantity + 1)}
                                    className="w-5 h-5 rounded-lg hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-clay-primary transition-colors"
                                  >
                                    +
                                  </button>
                                </div>

                                <div className="text-right min-w-[60px]">
                                  <span className="font-sans font-bold text-clay-primary">৳{(item.product.discountPrice || item.product.price) * item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFromCart(item.product.id)}
                                    className="block ml-auto text-[9px] text-red-500 hover:text-red-700 hover:underline font-bold mt-0.5"
                                  >
                                    বাদ দিন
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>সাবটোটাল (Subtotal):</span>
                            <span className="font-sans">৳{cart.reduce((acc, item) => acc + (item.product.discountPrice || item.product.price) * item.quantity, 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ডেলিভারি চার্জ (Shipping):</span>
                            <span className="font-sans">৳{shippingForm.division === "Dhaka" ? 60 : 120}</span>
                          </div>
                          {activeCoupon && (
                            <div className="flex justify-between text-red-600 font-bold">
                              <span>কুপন ছাড় (Discount):</span>
                              <span className="font-sans">
                                - ৳{
                                  activeCoupon.discountType === "percentage"
                                    ? Math.round((cart.reduce((acc, item) => acc + (item.product.discountPrice || item.product.price) * item.quantity, 0) * activeCoupon.discountValue) / 100)
                                    : activeCoupon.discountValue
                                }
                              </span>
                            </div>
                          )}
                          
                          {/* Final Grand Total */}
                          <div className="flex justify-between border-t border-gray-100 pt-2 text-clay-primary font-bold text-sm">
                            <span className="font-black">সর্বমোট মূল্য:</span>
                            <span className="font-sans font-black text-base">
                              ৳{
                                cart.reduce((acc, item) => acc + (item.product.discountPrice || item.product.price) * item.quantity, 0) + 
                                (shippingForm.division === "Dhaka" ? 60 : 120) - 
                                (activeCoupon 
                                  ? (activeCoupon.discountType === "percentage" 
                                      ? Math.round((cart.reduce((acc, item) => acc + (item.product.discountPrice || item.product.price) * item.quantity, 0) * activeCoupon.discountValue) / 100) 
                                      : activeCoupon.discountValue) 
                                  : 0)
                              }
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handlePlaceOrder}
                          disabled={simulatingPayment || cart.length === 0 || !shippingForm.name || !shippingForm.phone || !shippingForm.address}
                          className="w-full bg-clay-primary hover:bg-clay-secondary text-white font-bold py-3 rounded-xl transition-all shadow-md mt-4 text-center block disabled:opacity-45 disabled:cursor-not-allowed"
                        >
                          {simulatingPayment ? "অর্ডার কনফার্ম হচ্ছে..." : "অর্ডার সম্পূর্ণ করুন (Place Order)"}
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                /* ORDER SUCCESS SCREEN SPLASH CARD */
                <div className="bg-white/70 border border-clay-secondary/15 rounded-3xl p-8 max-w-xl mx-auto text-center space-y-6 font-bangla text-xs">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto shadow-inner">
                    <Check className="w-10 h-10 stroke-[3px]" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl md:text-2xl font-black text-clay-primary">আলহামদুলিল্লাহ্‌, আপনার অর্ডারটি গৃহীত হয়েছে!</h2>
                    <p className="text-gray-500 font-semibold text-[11px]">উর্মি মৃৎশিল্প থেকে ঐতিহ্যবাহী মাটির সামগ্রী ক্রয়ের জন্য আপনাকে ধন্যবাদ।</p>
                  </div>

                  {placedOrder && (
                    <div className="bg-[#FFF8F2] border border-clay-secondary/10 p-5 rounded-2xl text-left space-y-2.5 font-medium text-gray-700">
                      <p className="font-bold text-clay-primary text-sm border-b border-clay-secondary/5 pb-1.5 mb-2">অর্ডার মেমো ভাউচার:</p>
                      <p>অর্ডার মেমো নং: <span className="font-bold text-clay-text">{placedOrder.id}</span></p>
                      <p>ডেলিভারি ট্র্যাকিং কোড: <span className="font-mono font-bold text-clay-text">{placedOrder.trackingNumber}</span></p>
                      <p>ক্রেতার নাম: <span className="font-bold text-clay-text capitalize">{placedOrder.customerName}</span></p>
                      <p>মোবাইল: <span className="font-sans font-semibold text-clay-text">{placedOrder.phone}</span></p>
                      <p>ডেলিভারি এড্রেস: <span className="font-semibold text-clay-text">{placedOrder.shippingAddress}, {placedOrder.district}, {placedOrder.division}</span></p>
                      <p>ডেলিভারি পদ্ধতি: <span className="font-bold text-clay-primary">{placedOrder.paymentMethod === "cod" ? "ক্যাশ অন ডেলিভারি (COD)" : "মোবাইল ব্যাংকিং"}</span></p>
                      <p className="font-bold border-t border-clay-secondary/5 pt-2 flex justify-between text-clay-primary text-sm">
                        <span>মোট পরিশোধিত মূল্য:</span>
                        <span className="font-sans text-base">৳{placedOrder.total}</span>
                      </p>
                    </div>
                  )}

                  <p className="text-gray-400 text-[10px] italic">নিরাপদ ডাবল-কার্টন বাবল প্যাকেজিং করে ২ থেকে ৩ কার্যদিবসের মধ্যে আপনার মাটির সামগ্রী পৌঁছে যাবে ইনশাআল্লাহ্‌।</p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setCheckoutStep(1);
                        handleNavigation("dashboard", { tab: "orders" });
                      }}
                      className="flex-1 bg-clay-secondary hover:bg-clay-primary text-white font-bold py-3 rounded-xl transition-all"
                    >
                      আমার অর্ডার লগ দেখুন
                    </button>
                    <button
                      onClick={() => {
                        setCheckoutStep(1);
                        handleNavigation("home");
                      }}
                      className="flex-1 bg-clay-primary hover:bg-clay-secondary text-white font-bold py-3 rounded-xl transition-all"
                    >
                      কেনাকাটা চালিয়ে যান
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: LOGIN & REGISTRATION */}
          {currentPage === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-md mx-auto px-4 py-8"
              id="login-view"
            >
              <div className="bg-[#FFF8F2] rounded-3xl border border-clay-secondary/10 p-6 sm:p-8 clay-shadow-lg text-clay-text">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-clay-primary font-bangla">
                    {isRegisterMode ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "লগইন করুন (Sign In)"}
                  </h2>
                  <p className="text-xs text-clay-secondary mt-1.5 font-bangla">
                    {isRegisterMode 
                      ? "উর্মি মৃৎশিল্পে আপনাকে স্বাগতম! কেনাকাটা ও ট্র্যাকিংয়ের জন্য যুক্ত হোন" 
                      : "আপনার অ্যাকাউন্ট দিয়ে লগইন করুন"}
                  </p>
                </div>

                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-bangla">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {isRegisterMode && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-clay-secondary mb-1.5 font-bangla">আপনার নাম (Full Name) *</label>
                        <input
                          type="text"
                          required
                          value={authForm.name}
                          onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                          placeholder="উদা: রিফাত হাসান"
                          className="w-full p-3 rounded-2xl bg-white border border-clay-secondary/15 focus:border-clay-primary outline-none text-xs font-bangla"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-clay-secondary mb-1.5 font-bangla">ইমেইল এড্রেস (Email) *</label>
                        <input
                          type="email"
                          required
                          value={authForm.email}
                          onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                          placeholder="rifat@example.com"
                          className="w-full p-3 rounded-2xl bg-white border border-clay-secondary/15 focus:border-clay-primary outline-none text-xs font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-clay-secondary mb-1.5 font-bangla">মোবাইল নম্বর (Phone) *</label>
                        <input
                          type="tel"
                          required
                          value={authForm.phone}
                          onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                          placeholder="উদা: 017xxxxxxxx"
                          className="w-full p-3 rounded-2xl bg-white border border-clay-secondary/15 focus:border-clay-primary outline-none text-xs font-sans"
                        />
                      </div>
                    </>
                  )}

                  {!isRegisterMode && (
                    <div>
                      <label className="block text-xs font-bold text-clay-secondary mb-1.5 font-bangla">ইউজারনেম / ইমেইল / মোবাইল নম্বর (Username, Email or Phone) *</label>
                      <input
                        type="text"
                        required
                        value={authForm.usernameOrEmail}
                        onChange={(e) => setAuthForm({ ...authForm, usernameOrEmail: e.target.value })}
                        placeholder="আপনার ইমেইল, ইউজারনেম বা মোবাইল নম্বর লিখুন"
                        className="w-full p-3 rounded-2xl bg-white border border-clay-secondary/15 focus:border-clay-primary outline-none text-xs font-bangla"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-clay-secondary mb-1.5 font-bangla">পাসওয়ার্ড (Password) *</label>
                    <input
                      type="password"
                      required
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      placeholder="******"
                      className="w-full p-3 rounded-2xl bg-white border border-clay-secondary/15 focus:border-clay-primary outline-none text-xs font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full py-3 rounded-2xl bg-clay-primary hover:bg-clay-secondary text-white text-xs font-bold font-bangla shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {authSubmitting ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : null}
                    {isRegisterMode ? "রেজিস্ট্রেশন করুন" : "লগইন করুন"}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-clay-secondary/5 text-center">
                  <p className="text-xs text-clay-secondary font-bangla">
                    {isRegisterMode ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "নতুন গ্রাহক?"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(!isRegisterMode);
                        setAuthError("");
                      }}
                      className="text-clay-primary font-bold hover:underline font-bangla"
                    >
                      {isRegisterMode ? "লগইন করুন (Login)" : "নতুন অ্যাকাউন্ট তৈরি করুন"}
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: DASHBOARD PANEL (CUSTOMER OR ADMIN) */}
          {currentPage === "dashboard" && currentUser && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CustomerDashboard
                user={currentUser}
                onUpdateProfile={(updatedUser) => setCurrentUser(updatedUser)}
                onNavigate={handleNavigation}
                wishlist={wishlist}
                onRemoveFromWishlist={handleToggleWishlist}
                initialTab={pageParams.tab || "profile"}
              />
            </motion.div>
          )}

          {/* VIEW: ADMIN PANEL */}
          {currentPage === "admin" && currentUser?.role === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel
                onNavigate={handleNavigation}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Slide-out Cart Drawer Panel Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end">
          {/* background close trigger */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsCartOpen(false)}></div>

          <div className="relative bg-[#FFF8F2] w-full max-w-md h-full flex flex-col justify-between border-l border-clay-secondary/10 shadow-2xl z-10 font-bangla">
            
            {/* Drawer Header */}
            <div className="bg-clay-primary text-white p-5 flex items-center justify-between border-b border-clay-secondary/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <h3 className="text-base font-bold">শপিং কার্ট (Shopping Cart - {cart.reduce((sum, item) => sum + item.quantity, 0)} টি)</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-white hover:text-clay-accent text-sm font-bold bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                বন্ধ করুন (Close)
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow p-5 overflow-y-auto space-y-4">
              {cart.length > 0 ? (
                cart.map((item) => {
                  const productPrice = item.product.discountPrice || item.product.price;
                  return (
                    <div key={item.product.id} className="flex gap-4 p-3 bg-white/45 rounded-2xl border border-clay-secondary/5 shadow-inner relative group text-xs font-bangla">
                      <img src={item.product.images[0]} alt="cart" className="w-14 h-14 object-cover rounded-xl border border-clay-secondary/10 shrink-0" referrerPolicy="no-referrer" />
                      <div className="flex-grow min-w-0 pr-6">
                        <h5 className="font-bold text-clay-text truncate">{item.product.nameBangla}</h5>
                        <p className="text-[10px] text-gray-400 font-sans italic mt-0.5 truncate">{item.product.nameEnglish}</p>
                        <p className="text-clay-primary font-black mt-1 font-sans">৳{productPrice}</p>
                        
                        {/* Quantity Counter */}
                        <div className="flex items-center mt-2 border border-clay-secondary/15 rounded-lg bg-[#FFF8F2] w-fit">
                          <button
                            onClick={() => handleUpdateCartQty(item.product.id, item.quantity - 1)}
                            className="px-2 py-1 text-clay-secondary font-bold"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-1 font-bold text-clay-text font-sans">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateCartQty(item.product.id, item.quantity + 1)}
                            className="px-2 py-1 text-clay-secondary font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Delete item click action */}
                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                        title="মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-400 font-bangla space-y-2">
                  <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto" />
                  <p className="text-xs">আপনার কার্টটি একদম খালি!</p>
                </div>
              )}
            </div>

            {/* Cart Footer Calculations & buttons */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-clay-secondary/10 bg-white/45 text-xs font-bangla space-y-4">
                <div className="flex justify-between font-bold text-gray-600">
                  <span>পণ্যের মূল্য (Subtotal):</span>
                  <span className="font-sans text-sm text-clay-primary">
                    ৳{cart.reduce((acc, item) => acc + (item.product.discountPrice || item.product.price) * item.quantity, 0)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 italic">ডেলিভারি চার্জ শিপিং ঠিকানার উপর ভিত্তি করে যোগ করা হবে।</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      updateCartState([]);
                    }}
                    className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2.5 rounded-xl transition-colors"
                  >
                    কার্ট মুছুন
                  </button>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      handleNavigation("checkout");
                    }}
                    className="flex-1 bg-clay-primary hover:bg-clay-secondary text-white font-bold py-2.5 rounded-xl transition-colors text-center block"
                  >
                    অর্ডার করুন (Checkout)
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Quick View Interactive Modal Overlay */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(p, qty) => {
            handleAddToCart(p, qty);
            setQuickViewProduct(null);
          }}
          onBuyNow={(p, qty) => {
            handleBuyNow(p, qty);
            setQuickViewProduct(null);
          }}
          isWishlisted={wishlist.some(w => w.id === quickViewProduct.id)}
          onToggleWishlist={handleToggleWishlist}
          allProducts={products}
          onNavigateToRelated={(id) => {
            const found = products.find(p => p.id === id);
            if (found) setQuickViewProduct(found);
          }}
        />
      )}

      {/* Admin Floating Quick Action Button */}
      {currentUser?.role === "admin" && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 font-bangla">
          <button
            onClick={() => {
              setCurrentPage("admin");
              alert("নতুন পণ্য যোগ করতে নিচের এডমিন প্যানেলের 'পণ্যসমূহ' সেকশনে যান।");
            }}
            className="flex items-center gap-2 bg-[#8B4513] hover:bg-[#5C2E0B] text-[#FFF8F2] font-black px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-xs border-2 border-[#FFF8F2]"
            title="নতুন পণ্য যোগ করুন"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>নতুন পণ্য যোগ করুন</span>
          </button>
        </div>
      )}

      {/* Global Clay Footer */}
      <Footer onNavigate={handleNavigation} />

    </div>
  );
}
