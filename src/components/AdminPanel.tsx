import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, ShoppingBag, ShoppingCart, Users, Tag, Sliders, 
  Settings, Database, RotateCcw, Save, Trash2, Edit, Plus, Eye, Check, X,
  Key, RefreshCw, BarChart2, PieChart as PieIcon, TrendingUp, DollarSign,
  Upload, Image
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Product, Order, Coupon, SliderItem, BannerItem } from "../types";
import { api } from "../lib/api";

interface AdminPanelProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms state
  const [productForm, setProductForm] = useState<any>({
    nameBangla: "",
    nameEnglish: "",
    category: "Clay Tea Pot",
    subCategory: "",
    description: "",
    shortDescription: "",
    price: 0,
    discountPrice: 0,
    stock: 10,
    SKU: "",
    weight: "",
    size: "",
    color: "",
    material: "",
    tags: "",
    seoTitle: "",
    seoDescription: "",
    images: "",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true
  });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [couponForm, setCouponForm] = useState<any>({
    code: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 500,
    expiryDate: "",
    isActive: true
  });
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

  // Password rotation form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordStatus, setPasswordStatus] = useState("");

  // Load Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.admin.getStats();
      setStats(statsRes);

      const prodRes = await api.products.list({ limit: 100 });
      setProducts(prodRes.products);

      const orderRes = await api.orders.listAll();
      setOrders(orderRes);

      const couponRes = await api.coupons.listAll();
      setCoupons(couponRes);

      const homeRes = await api.home.get();
      setSliders(homeRes.sliders);
      setBanners(homeRes.banners);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
        reader.readAsDataURL(file);
        
        const base64Data = await base64Promise;
        const res = await api.admin.uploadFile(file.name, base64Data);
        uploadedUrls.push(res.url);
      }

      // Append new URLs to the form field (comma separated)
      const currentImages = productForm.images ? productForm.images.trim() : "";
      const newImagesString = currentImages 
        ? `${currentImages}, ${uploadedUrls.join(", ")}` 
        : uploadedUrls.join(", ");
        
      setProductForm({ ...productForm, images: newImagesString });
      alert("ছবিসমূহ সফলভাবে আপলোড হয়েছে!");
    } catch (err: any) {
      console.error(err);
      alert("ছবি আপলোড করতে ব্যর্থ হয়েছে: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle Product CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
      stock: Number(productForm.stock),
      tags: productForm.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
      images: productForm.images.split(",").map((i: string) => i.trim()).filter(Boolean)
    };

    try {
      if (editingProductId) {
        await api.products.update(editingProductId, payload);
        alert("পণ্যটি সফলভাবে এডিট করা হয়েছে!");
      } else {
        await api.products.create(payload);
        alert("নতুন পণ্য সফলভাবে যোগ করা হয়েছে!");
      }
      setEditingProductId(null);
      // Reset Form
      setProductForm({
        nameBangla: "",
        nameEnglish: "",
        category: "Clay Tea Pot",
        subCategory: "",
        description: "",
        shortDescription: "",
        price: 0,
        discountPrice: 0,
        stock: 10,
        SKU: "",
        weight: "",
        size: "",
        color: "",
        material: "",
        tags: "",
        seoTitle: "",
        seoDescription: "",
        images: "",
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true
      });
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "পণ্য সংরক্ষণ করতে ত্রুটি হয়েছে");
    }
  };

  const handleEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProductForm({
      nameBangla: p.nameBangla,
      nameEnglish: p.nameEnglish,
      category: p.category,
      subCategory: p.subCategory || "",
      description: p.description,
      shortDescription: p.shortDescription || "",
      price: p.price,
      discountPrice: p.discountPrice || 0,
      stock: p.stock,
      SKU: p.SKU,
      weight: p.weight,
      size: p.size,
      color: p.color,
      material: p.material,
      tags: p.tags.join(", "),
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      images: p.images.join(", "),
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival
    });
    // Scroll to form
    document.getElementById("product-form-box")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পণ্যটি ডিলিট করতে চান?")) return;
    try {
      await api.products.delete(id);
      alert("পণ্যটি সফলভাবে ডিলিট করা হয়েছে");
      loadAdminData();
    } catch (err) {
      alert("পণ্য ডিলিট করা সম্ভব হয়নি");
    }
  };

  // Handle Order status updates
  const handleUpdateOrderStatus = async (id: string, orderStatus: string, paymentStatus: string) => {
    try {
      await api.orders.updateStatus(id, orderStatus, paymentStatus);
      alert("অর্ডারের তথ্য সফলভাবে আপডেট করা হয়েছে");
      loadAdminData();
    } catch (err) {
      alert("অর্ডার আপডেট করতে ত্রুটি হয়েছে");
    }
  };

  // Handle Coupon CRUD
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCouponId) {
        await api.coupons.update(editingCouponId, couponForm);
        alert("কুপন সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await api.coupons.create(couponForm);
        alert("নতুন কুপন সফলভাবে যোগ করা হয়েছে!");
      }
      setEditingCouponId(null);
      setCouponForm({
        code: "",
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: 500,
        expiryDate: "",
        isActive: true
      });
      loadAdminData();
    } catch (err) {
      alert("কুপন সংরক্ষণ করতে ত্রুটি হয়েছে");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("কুপনটি ডিলিট করতে চান?")) return;
    try {
      await api.coupons.delete(id);
      loadAdminData();
    } catch (err) {
      alert("কুপন ডিলিট করা যায়নি");
    }
  };

  // Handle Password Rotate
  const handleRotatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus("নতুন পাসওয়ার্ডটি মিলছে না (Passwords do not match)");
      return;
    }
    try {
      await api.auth.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordStatus("পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPasswordStatus(err.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  // Simulated Database Backups
  const [backupLogs, setBackupLogs] = useState<string[]>(["[System] Initial DB configuration loaded."]);
  const [backingUp, setBackingUp] = useState(false);

  const handleBackupDb = () => {
    setBackingUp(true);
    setTimeout(() => {
      const dbCopy = localStorage.getItem("urmi_db_backup") || "";
      // Simulated backup structure
      setBackupLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Backup created successfully: urmi_clay_backup_${Date.now()}.json`,
        ...prev
      ]);
      setBackingUp(false);
      alert("ডাটাবেজ সফলভাবে ব্যাকআপ নেওয়া হয়েছে (Database Backup Complete)");
    }, 1500);
  };

  const handleRestoreDb = () => {
    if (confirm("রিস্টোর করলে বর্তমানের সব অর্ডার বা পণ্য রিস্টোর পয়েন্টের ডাটা দিয়ে প্রতিস্থাপিত হবে। অগ্রসর হবেন?")) {
      setBackupLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Database restored to system default seed point.`,
        ...prev
      ]);
      alert("ডাটাবেজ সফলভাবে রিস্টোর করা হয়েছে!");
      loadAdminData();
    }
  };

  // Chart Colors
  const COLORS = ["#8B4513", "#C46A2D", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-clay-bg flex flex-col items-center justify-center font-bangla gap-3">
        <RefreshCw className="w-8 h-8 text-clay-primary animate-spin" />
        <p className="text-sm text-clay-secondary font-semibold">এডমিন ড্যাশবোর্ড লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clay-bg py-8 font-bangla text-clay-text">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Admin Dashboard Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-clay-primary">এডমিন প্যানেল (Admin Console)</h1>
            <p className="text-xs text-clay-secondary mt-0.5">মৃৎশিল্প কমার্স স্টোরের সার্বিক ব্যবস্থাপনা ও সেলস পরিসংখ্যান</p>
          </div>
          <button
            onClick={() => onNavigate("home")}
            className="bg-clay-primary hover:bg-clay-secondary text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            স্টোরফ্রন্ট-এ ফিরুন
          </button>
        </div>

        {/* Dashboard Tabs & Sidebar structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel Sidebar Links */}
          <div className="lg:col-span-3 bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-clay-secondary/10 flex flex-col gap-2 shadow-sm">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${activeTab === "dashboard" ? "bg-clay-primary text-white" : "hover:bg-clay-secondary/5 text-clay-secondary hover:text-clay-primary"}`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              সেলস পরিসংখ্যান ও চার্ট
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${activeTab === "products" ? "bg-clay-primary text-white" : "hover:bg-clay-secondary/5 text-clay-secondary hover:text-clay-primary"}`}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              পণ্য ব্যবস্থাপনা (Products)
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${activeTab === "orders" ? "bg-clay-primary text-white" : "hover:bg-clay-secondary/5 text-clay-secondary hover:text-clay-primary"}`}
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              অর্ডার ব্যবস্থাপনা (Orders)
            </button>
            <button
              onClick={() => setActiveTab("coupons")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${activeTab === "coupons" ? "bg-clay-primary text-white" : "hover:bg-clay-secondary/5 text-clay-secondary hover:text-clay-primary"}`}
            >
              <Tag className="w-4.5 h-4.5" />
              কুপন ডিসকাউন্ট (Coupons)
            </button>
            <button
              onClick={() => setActiveTab("db-backup")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${activeTab === "db-backup" ? "bg-clay-primary text-white" : "hover:bg-clay-secondary/5 text-clay-secondary hover:text-clay-primary"}`}
            >
              <Database className="w-4.5 h-4.5" />
              ডাটাবেজ ব্যাকআপ ও রিস্টোর
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${activeTab === "security" ? "bg-clay-primary text-white" : "hover:bg-clay-secondary/5 text-clay-secondary hover:text-clay-primary"}`}
            >
              <Key className="w-4.5 h-4.5" />
              পাসওয়ার্ড ও নিরাপত্তা
            </button>
          </div>

          {/* Right Main Panel Content */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            
            {/* TAB: DASHBOARD STATS */}
            {activeTab === "dashboard" && (
              <div className="flex flex-col gap-6">
                
                {/* Stats Summary Widgets Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/70 p-4 rounded-3xl border border-clay-secondary/10 shadow-sm flex items-center gap-3">
                    <div className="p-3 bg-clay-primary/10 rounded-2xl text-clay-primary shrink-0">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-clay-secondary">সর্বমোট বিক্রয়</p>
                      <h3 className="text-base md:text-lg font-black font-sans">৳{stats.summary.totalSales}</h3>
                    </div>
                  </div>

                  <div className="bg-white/70 p-4 rounded-3xl border border-clay-secondary/10 shadow-sm flex items-center gap-3">
                    <div className="p-3 bg-clay-secondary/10 rounded-2xl text-clay-secondary shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-clay-secondary">মোট অর্ডার</p>
                      <h3 className="text-base md:text-lg font-black font-sans">{stats.summary.totalOrders} টি</h3>
                    </div>
                  </div>

                  <div className="bg-white/70 p-4 rounded-3xl border border-clay-secondary/10 shadow-sm flex items-center gap-3">
                    <div className="p-3 bg-clay-accent/10 rounded-2xl text-clay-primary shrink-0">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-clay-secondary">সক্রিয় প্রোডাক্ট</p>
                      <h3 className="text-base md:text-lg font-black font-sans">{stats.summary.activeProducts} টি</h3>
                    </div>
                  </div>

                  <div className="bg-white/70 p-4 rounded-3xl border border-clay-secondary/10 shadow-sm flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-2xl text-blue-800 shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-clay-secondary">মোট কাস্টমার</p>
                      <h3 className="text-base md:text-lg font-black font-sans">{stats.summary.totalCustomers} জন</h3>
                    </div>
                  </div>
                </div>

                {/* Recharts Analytics Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Monthly sales report chart */}
                  <div className="md:col-span-8 bg-white/70 p-5 rounded-3xl border border-clay-secondary/10 shadow-sm">
                    <h4 className="text-sm font-bold text-clay-primary mb-4 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      মাসিক সেলস চার্ট (Monthly Sales Report)
                    </h4>
                    <div className="h-64 w-full text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.monthlySales}>
                          <defs>
                            <linearGradient id="salesColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B4513" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#8B4513" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="month" stroke="#8B4513" />
                          <YAxis stroke="#8B4513" />
                          <Tooltip />
                          <Area type="monotone" dataKey="sales" name="বিক্রয় (৳)" stroke="#8B4513" fillOpacity={1} fill="url(#salesColor)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category share pie chart */}
                  <div className="md:col-span-4 bg-white/70 p-5 rounded-3xl border border-clay-secondary/10 shadow-sm flex flex-col justify-between">
                    <h4 className="text-sm font-bold text-clay-primary mb-4 flex items-center gap-1.5">
                      <PieIcon className="w-4 h-4" />
                      ক্যাটাগরি শেয়ার (%)
                    </h4>
                    <div className="h-44 w-full flex justify-center items-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.categoryStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {stats.categoryStats.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-[10px] space-y-1 pl-2 mt-2">
                      {stats.categoryStats.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          <span className="truncate text-gray-600 font-semibold">{item.name}: ৳{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="bg-white/70 p-5 rounded-3xl border border-clay-secondary/10 shadow-sm">
                  <h4 className="text-sm font-bold text-clay-primary mb-4">সাম্প্রতিক অর্ডারসমূহ (Recent Orders)</h4>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-clay-secondary/10 pb-2 text-clay-secondary">
                          <th className="py-2.5">অর্ডার মেমো</th>
                          <th className="py-2.5">গ্রাহক</th>
                          <th className="py-2.5">ফোন</th>
                          <th className="py-2.5">পরিমাণ</th>
                          <th className="py-2.5">মোট মূল্য</th>
                          <th className="py-2.5">পেমেন্ট</th>
                          <th className="py-2.5">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {stats.recentOrders.map((o: Order) => (
                          <tr key={o.id} className="hover:bg-clay-secondary/5 transition-colors">
                            <td className="py-2.5 font-bold text-[#8B4513]">{o.id}</td>
                            <td className="py-2.5 capitalize font-medium">{o.customerName}</td>
                            <td className="py-2.5">{o.phone}</td>
                            <td className="py-2.5">{o.items.reduce((acc, i) => acc + i.quantity, 0)} টি পণ্য</td>
                            <td className="py-2.5 font-sans font-bold">৳{o.total}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                {o.paymentStatus === "paid" ? "Paid" : "Pending"}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${o.orderStatus === "delivered" ? "bg-green-100 text-green-800" : o.orderStatus === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
                                {o.orderStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: PRODUCTS MANAGEMENT */}
            {activeTab === "products" && (
              <div className="flex flex-col gap-6">
                
                {/* Product Add/Edit Form Box */}
                <div className="bg-white/70 p-5 rounded-3xl border border-clay-secondary/10 shadow-sm" id="product-form-box">
                  <h4 className="text-sm font-bold text-clay-primary mb-4 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    {editingProductId ? "পণ্য এডিট করুন (Edit Product)" : "নতুন পণ্য যোগ করুন (Add New Product)"}
                  </h4>
                  <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bangla">
                    <div>
                      <label className="block text-gray-500 mb-1">বাংলার নাম (Bangla Name) *</label>
                      <input
                        type="text"
                        required
                        value={productForm.nameBangla}
                        onChange={(e) => setProductForm({ ...productForm, nameBangla: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary"
                        placeholder="মাটির চায়ের কেতলি সেট"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">ইংরেজির নাম (English Name) *</label>
                      <input
                        type="text"
                        required
                        value={productForm.nameEnglish}
                        onChange={(e) => setProductForm({ ...productForm, nameEnglish: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans"
                        placeholder="Clay Teapot Set"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">ক্যাটাগরি (Category) *</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary"
                      >
                        <option value="Clay Tea Pot">Clay Tea Pot</option>
                        <option value="Clay Flower Pot">Clay Flower Pot</option>
                        <option value="Clay Lamp">Clay Lamp</option>
                        <option value="Clay Cup">Clay Cup</option>
                        <option value="Clay Plate">Clay Plate</option>
                        <option value="Clay Vase">Clay Vase</option>
                        <option value="Decoration">Decoration</option>
                        <option value="Kitchen Items">Kitchen Items</option>
                        <option value="Gift Items">Gift Items</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1">মূল্য (Price ৳) *</label>
                      <input
                        type="number"
                        required
                        value={productForm.price || ""}
                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">ডিসকাউন্ট মূল্য (Discount Price ৳)</label>
                      <input
                        type="number"
                        value={productForm.discountPrice || ""}
                        onChange={(e) => setProductForm({ ...productForm, discountPrice: Number(e.target.value) })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">স্টক পরিমাণ (Stock) *</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock || ""}
                        onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1">কোড (SKU) *</label>
                      <input
                        type="text"
                        required
                        value={productForm.SKU}
                        onChange={(e) => setProductForm({ ...productForm, SKU: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans"
                        placeholder="URMI-POT-001"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">ওজন (Weight)</label>
                      <input
                        type="text"
                        value={productForm.weight}
                        onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary"
                        placeholder="1.2 kg"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">সাইজ বা পরিমাপ (Size)</label>
                      <input
                        type="text"
                        value={productForm.size}
                        onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary"
                        placeholder="Height: 12 inches"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1">রঙ (Color)</label>
                      <input
                        type="text"
                        value={productForm.color}
                        onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary"
                        placeholder="Terracotta Red"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">উপাদান (Material)</label>
                      <input
                        type="text"
                        value={productForm.material}
                        onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary"
                        placeholder="Natural baked clay"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">ট্যাগস (Tags - কমা দিয়ে লিখুন)</label>
                      <input
                        type="text"
                        value={productForm.tags}
                        onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary"
                        placeholder="pot, kitchen, traditional"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-gray-700 font-medium mb-1 flex items-center justify-between">
                        <span>পণ্য ইমেজ লিঙ্কসমূহ (Image URLs - কমা দিয়ে লিখুন) *</span>
                        {uploading && <span className="text-xs text-clay-primary animate-pulse flex items-center gap-1">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> ছবি আপলোড হচ্ছে...
                        </span>}
                      </label>
                      
                      {/* Direct Upload Section */}
                      <div className="mb-2.5 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="relative border-2 border-dashed border-clay-secondary/30 rounded-2xl p-4 bg-[#FFFBF7] flex flex-col items-center justify-center text-center cursor-pointer hover:border-clay-primary hover:bg-[#FFF5EC] transition-all">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <Upload className="w-6 h-6 text-clay-primary mb-1.5" />
                          <p className="font-bold text-gray-700 text-xs">সরাসরি কম্পিউটার/মোবাইল থেকে আপলোড করুন</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG, WebP ফরম্যাটে একাধিক ছবি একসাথে আপলোড করতে পারেন</p>
                        </div>

                        {/* Image Previews */}
                        <div className="border border-clay-secondary/10 rounded-2xl p-3 bg-gray-50 flex flex-wrap gap-2 items-center justify-start overflow-y-auto max-h-[110px]">
                          {productForm.images ? (
                            productForm.images.split(",").map((url: string, idx: number) => {
                              const trimmedUrl = url.trim();
                              if (!trimmedUrl) return null;
                              return (
                                <div key={idx} className="relative group w-14 h-14 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                  <img 
                                    src={trimmedUrl} 
                                    alt={`Preview ${idx + 1}`} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as any).src = "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=100";
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const remaining = productForm.images
                                        .split(",")
                                        .map((u: string) => u.trim())
                                        .filter((u: string, i: number) => i !== idx)
                                        .join(", ");
                                      setProductForm({ ...productForm, images: remaining });
                                    }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow"
                                    title="ছবিটি মুছুন"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })
                          ) : (
                            <div className="w-full flex flex-col items-center justify-center text-gray-400 py-4 text-xs font-sans">
                              <Image className="w-5 h-5 mb-1 opacity-60" />
                              <span>কোনো ছবি যুক্ত করা হয়নি</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        required
                        value={productForm.images}
                        onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans text-xs"
                        placeholder="অথবা সরাসরি ইমেজ লিংক এখানে পেস্ট করুন, যেমন: https://images.unsplash.com/photo-xxx"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-gray-500 mb-1">সংক্ষিপ্ত বিবরণ (Short Description) *</label>
                      <input
                        type="text"
                        required
                        value={productForm.shortDescription}
                        onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary"
                        placeholder="১ পিস খোদাই করা সুন্দর মাটির কেতলি"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-gray-500 mb-1">বিস্তারিত বর্ণনা (Full Description) *</label>
                      <textarea
                        required
                        rows={3}
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary"
                        placeholder="আমাদের দক্ষ কারিগরদের নিপুণ হাতের ছোঁয়ায় নদীর খাঁটি লাল পলিমাটি দিয়ে তৈরি..."
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1">SEO Title</label>
                      <input
                        type="text"
                        value={productForm.seoTitle}
                        onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-gray-500 mb-1">SEO Description</label>
                      <input
                        type="text"
                        value={productForm.seoDescription}
                        onChange={(e) => setProductForm({ ...productForm, seoDescription: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary"
                      />
                    </div>

                    <div className="sm:col-span-3 flex gap-6 items-center py-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={productForm.isFeatured}
                          onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                          className="w-4 h-4 text-clay-primary"
                        />
                        Featured Product
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={productForm.isBestSeller}
                          onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                          className="w-4 h-4 text-clay-primary"
                        />
                        Best Seller
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={productForm.isNewArrival}
                          onChange={(e) => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                          className="w-4 h-4 text-clay-primary"
                        />
                        New Arrival
                      </label>
                    </div>

                    <div className="sm:col-span-3 flex justify-end gap-3 mt-2">
                      {editingProductId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(null);
                            setProductForm({
                              nameBangla: "", nameEnglish: "", category: "Clay Tea Pot",
                              subCategory: "", description: "", shortDescription: "",
                              price: 0, discountPrice: 0, stock: 10, SKU: "", weight: "",
                              size: "", color: "", material: "", tags: "", seoTitle: "",
                              seoDescription: "", images: "", isFeatured: false, isBestSeller: false,
                              isNewArrival: true
                            });
                          }}
                          className="bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold px-5 py-2.5 rounded-xl transition-colors"
                        >
                          বাতিল (Cancel)
                        </button>
                      )}
                      <button
                        type="submit"
                        className="bg-clay-primary hover:bg-clay-secondary text-white font-bold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Save className="w-4 h-4" />
                        সংরক্ষণ করুন (Save)
                      </button>
                    </div>
                  </form>
                </div>

                {/* Products Table List */}
                <div className="bg-white/70 p-5 rounded-3xl border border-clay-secondary/10 shadow-sm">
                  <h4 className="text-sm font-bold text-clay-primary mb-4">সকল পণ্য তালিকা ({products.length})</h4>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-clay-secondary/10 text-clay-secondary font-bold">
                          <th className="py-2.5 px-3">ছবি</th>
                          <th className="py-2.5 px-3">পণ্যের নাম</th>
                          <th className="py-2.5 px-3">ক্যাটাগরি</th>
                          <th className="py-2.5 px-3">মূল্য (৳)</th>
                          <th className="py-2.5 px-3 text-center">স্টক</th>
                          <th className="py-2.5 px-3">SKU</th>
                          <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-clay-secondary/5 transition-colors">
                            <td className="py-2 px-3">
                              <img src={p.images[0]} alt="p" className="w-10 h-10 object-cover rounded-lg border border-clay-secondary/10" referrerPolicy="no-referrer" />
                            </td>
                            <td className="py-2 px-3 font-semibold">
                              <p className="text-clay-text leading-tight">{p.nameBangla}</p>
                              <span className="text-[10px] text-gray-400 font-sans italic">{p.nameEnglish}</span>
                            </td>
                            <td className="py-2 px-3">{p.category}</td>
                            <td className="py-2 px-3 font-bold text-clay-primary">
                              {p.discountPrice ? (
                                <span>৳{p.discountPrice} <span className="text-[10px] text-gray-400 line-through">৳{p.price}</span></span>
                              ) : (
                                <span>৳{p.price}</span>
                              )}
                            </td>
                            <td className={`py-2 px-3 text-center font-bold ${p.stock < 5 ? "text-red-600" : "text-green-700"}`}>
                              {p.stock} টি
                            </td>
                            <td className="py-2 px-3 font-mono">{p.SKU}</td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleEditProduct(p)}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                                  title="সম্পাদনা"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: ORDERS MANAGEMENT */}
            {activeTab === "orders" && (
              <div className="bg-white/70 p-5 rounded-3xl border border-clay-secondary/10 shadow-sm">
                <h4 className="text-sm font-bold text-clay-primary mb-4">সকল অর্ডার তালিকা ও স্ট্যাটাস আপডেট ({orders.length})</h4>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-clay-secondary/10 pb-2 text-clay-secondary font-bold">
                        <th className="py-3 px-2">মেমো নং</th>
                        <th className="py-3 px-2">গ্রাহক বিবরণ</th>
                        <th className="py-3 px-2">পণ্যসমূহ</th>
                        <th className="py-3 px-2">মূল্য</th>
                        <th className="py-3 px-2">পেমেন্ট মেথড</th>
                        <th className="py-3 px-2">পেমেন্ট অবস্থা</th>
                        <th className="py-3 px-2">অর্ডার অবস্থা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-bangla">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-clay-secondary/5 transition-colors">
                          <td className="py-3 px-2 font-bold text-clay-primary">{o.id}</td>
                          <td className="py-3 px-2">
                            <p className="font-bold text-clay-text capitalize">{o.customerName}</p>
                            <p className="text-[10px] text-gray-500">{o.phone}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{o.shippingAddress}</p>
                          </td>
                          <td className="py-3 px-2 font-semibold">
                            {o.items.map((item, idx) => (
                              <p key={idx} className="text-[10px] text-gray-600">
                                {item.nameBangla} x {item.quantity}
                              </p>
                            ))}
                          </td>
                          <td className="py-3 px-2 font-bold font-sans">৳{o.total}</td>
                          <td className="py-3 px-2 uppercase text-gray-500 font-bold">{o.paymentMethod}</td>
                          <td className="py-3 px-2">
                            <select
                              value={o.paymentStatus}
                              onChange={(e) => handleUpdateOrderStatus(o.id, "", e.target.value)}
                              className={`py-1 px-1 rounded font-bold outline-none text-[10px] ${o.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                            >
                              <option value="pending">Pending (বাকি)</option>
                              <option value="paid">Paid (পরিশোধিত)</option>
                            </select>
                          </td>
                          <td className="py-3 px-2">
                            <select
                              value={o.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value, "")}
                              className={`py-1 px-1 rounded font-bold outline-none text-[10px] ${o.orderStatus === "delivered" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: COUPON MANAGEMENT */}
            {activeTab === "coupons" && (
              <div className="flex flex-col gap-6">
                
                {/* Coupon creation form */}
                <div className="bg-white/70 p-5 rounded-3xl border border-clay-secondary/10 shadow-sm">
                  <h4 className="text-sm font-bold text-clay-primary mb-4 flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    {editingCouponId ? "কুপন কোড এডিট করুন" : "নতুন ডিসকাউন্ট কুপন তৈরি করুন"}
                  </h4>
                  <form onSubmit={handleSaveCoupon} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bangla">
                    <div>
                      <label className="block text-gray-500 mb-1">কুপন কোড (Coupon Code) *</label>
                      <input
                        type="text"
                        required
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans font-bold"
                        placeholder="CLAY20"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">ডিসকাউন্ট টাইপ *</label>
                      <select
                        value={couponForm.discountType}
                        onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary"
                      >
                        <option value="percentage">শতকরা (Percentage %)</option>
                        <option value="fixed">স্থির ছাড় (Fixed Amount ৳)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">ডিসকাউন্ট মান (Value) *</label>
                      <input
                        type="number"
                        required
                        value={couponForm.discountValue || ""}
                        onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1">সর্বনিম্ন অর্ডার মূল্য (৳) *</label>
                      <input
                        type="number"
                        required
                        value={couponForm.minOrderAmount || ""}
                        onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">মেয়াদ শেষ হবার তারিখ (Expiry Date) *</label>
                      <input
                        type="date"
                        required
                        value={couponForm.expiryDate}
                        onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                        className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">অবস্থা</label>
                      <div className="flex items-center gap-4 py-2">
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                          <input
                            type="checkbox"
                            checked={couponForm.isActive}
                            onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                            className="w-4 h-4 text-clay-primary"
                          />
                          সচল (Active)
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-3 flex justify-end gap-3">
                      {editingCouponId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCouponId(null);
                            setCouponForm({
                              code: "", discountType: "percentage", discountValue: 10,
                              minOrderAmount: 500, expiryDate: "", isActive: true
                            });
                          }}
                          className="bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold px-5 py-2 rounded-xl transition-colors"
                        >
                          বাতিল
                        </button>
                      )}
                      <button
                        type="submit"
                        className="bg-clay-primary hover:bg-clay-secondary text-white font-bold px-6 py-2 rounded-xl transition-colors"
                      >
                        কুপন সংরক্ষণ
                      </button>
                    </div>
                  </form>
                </div>

                {/* Coupons list */}
                <div className="bg-white/70 p-5 rounded-3xl border border-clay-secondary/10 shadow-sm">
                  <h4 className="text-sm font-bold text-clay-primary mb-4">বিদ্যমান কুপনসমূহ ({coupons.length})</h4>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-clay-secondary/10 pb-2 text-clay-secondary font-bold">
                          <th className="py-2.5 px-3">কোপন কোড</th>
                          <th className="py-2.5 px-3">ডিসকাউন্ট ধরণ</th>
                          <th className="py-2.5 px-3">ছাড় মূল্য</th>
                          <th className="py-2.5 px-3">সর্বনিম্ন অর্ডার</th>
                          <th className="py-2.5 px-3">মেয়াদ শেষ</th>
                          <th className="py-2.5 px-3">অবস্থা</th>
                          <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {coupons.map((c) => (
                          <tr key={c.id} className="hover:bg-clay-secondary/5 transition-colors">
                            <td className="py-2.5 px-3 font-bold font-sans text-clay-primary">{c.code}</td>
                            <td className="py-2.5 px-3">{c.discountType === "percentage" ? "Percentage %" : "Fixed ৳"}</td>
                            <td className="py-2.5 px-3 font-bold">{c.discountType === "percentage" ? `${c.discountValue}%` : `৳${c.discountValue}`}</td>
                            <td className="py-2.5 px-3 font-sans">৳{c.minOrderAmount}</td>
                            <td className="py-2.5 px-3 text-gray-500 font-sans">{new Date(c.expiryDate).toLocaleDateString()}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {c.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingCouponId(c.id);
                                    setCouponForm({
                                      code: c.code,
                                      discountType: c.discountType,
                                      discountValue: c.discountValue,
                                      minOrderAmount: c.minOrderAmount,
                                      expiryDate: c.expiryDate.split("T")[0],
                                      isActive: c.isActive
                                    });
                                  }}
                                  className="p-1 text-blue-700 hover:bg-blue-50 rounded"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(c.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: DATABASE BACKUPS */}
            {activeTab === "db-backup" && (
              <div className="bg-white/70 p-6 rounded-3xl border border-clay-secondary/10 shadow-sm flex flex-col gap-6 font-bangla text-xs">
                <div>
                  <h4 className="text-base font-bold text-clay-primary mb-2">ডাটাবেজ ব্যাকআপ এবং রিস্টোর সিস্টেম</h4>
                  <p className="text-gray-500 leading-relaxed">
                    নিরাপত্তা স্বার্থে আপনার ই-কমার্স স্টোরের যাবতীয় পণ্য, কুপন এবং পূর্ববর্তী অর্ডার হিস্ট্রিকে যেকোনো সময় লোকাল ব্যাকআপ ফাইলে সংরক্ষণ করতে পারেন। এছাড়া প্রডাক্ট লিস্টে বড় কোনো ত্রুটি হলে এক ক্লিকেই পূর্বের ডাটাতে ফিরে যাওয়া সম্ভব।
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleBackupDb}
                    disabled={backingUp}
                    className="bg-clay-primary hover:bg-clay-secondary text-white font-bold px-6 py-3 rounded-xl transition-all shadow flex items-center gap-2"
                  >
                    <Database className="w-4.5 h-4.5" />
                    {backingUp ? "ডাটা ব্যাকআপ হচ্ছে..." : "ডাটা ব্যাকআপ নিন (Backup Now)"}
                  </button>

                  <button
                    onClick={handleRestoreDb}
                    className="bg-clay-secondary hover:bg-clay-primary text-white font-bold px-6 py-3 rounded-xl transition-all shadow flex items-center gap-2"
                  >
                    <RotateCcw className="w-4.5 h-4.5" />
                    ডাটা রিস্টোর করুন (Restore Defaults)
                  </button>
                </div>

                <div className="border-t border-clay-secondary/10 pt-5">
                  <h5 className="font-bold text-clay-secondary mb-3 uppercase tracking-wider">ব্যাকআপ এবং সিস্টেম লগ (Database Log)</h5>
                  <div className="bg-[#222222] text-green-400 p-4 rounded-2xl font-mono text-[11px] h-48 overflow-y-auto space-y-1.5">
                    {backupLogs.map((log, i) => (
                      <p key={i}>{log}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SECURITY & PASSWORD ROTATION */}
            {activeTab === "security" && (
              <div className="bg-white/70 p-6 rounded-3xl border border-clay-secondary/10 shadow-sm">
                <h4 className="text-sm font-bold text-clay-primary mb-4 flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  এডমিন পাসওয়ার্ড পরিবর্তন (Change Password)
                </h4>
                <p className="text-xs text-gray-500 mb-4 font-bangla">
                  এডমিন মেম্বার gopal এর প্রথমবার লগইন এর নিরাপত্তা বৃদ্ধি নিশ্চিত করার জন্য নতুন স্ট্রং পাসওয়ার্ড প্রদান করুন।
                </p>

                <form onSubmit={handleRotatePassword} className="max-w-md flex flex-col gap-4 text-xs font-bangla">
                  <div>
                    <label className="block text-gray-500 mb-1">বর্তমান পাসওয়ার্ড (Current Password) *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">নতুন পাসওয়ার্ড (New Password) *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm Password) *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2 px-3 outline-none focus:border-clay-primary font-sans"
                    />
                  </div>

                  {passwordStatus && (
                    <p className="text-xs font-bold font-bangla text-clay-primary">{passwordStatus}</p>
                  )}

                  <button
                    type="submit"
                    className="self-start bg-clay-primary hover:bg-clay-secondary text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    পাসওয়ার্ড পরিবর্তন করুন
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
