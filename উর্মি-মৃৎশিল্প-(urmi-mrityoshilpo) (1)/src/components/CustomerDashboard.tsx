import React, { useState, useEffect } from "react";
import { 
  User, ShoppingBag, Heart, MapPin, Key, Truck, ShieldCheck, 
  ChevronRight, Calendar, Printer, Search, RefreshCw, Eye
} from "lucide-react";
import { User as UserType, Order, Product } from "../types";
import { api } from "../lib/api";
import InvoiceModal from "./InvoiceModal";

interface CustomerDashboardProps {
  user: UserType;
  onUpdateProfile: (updatedUser: UserType) => void;
  onNavigate: (page: string, params?: any) => void;
  wishlist: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  initialTab?: string;
}

const bdDivisions = [
  "Dhaka", "Chittagong", "Sylhet", "Khulna", "Barisal", "Rajshahi", "Rangpur", "Mymensingh"
];

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

export default function CustomerDashboard({
  user,
  onUpdateProfile,
  onNavigate,
  wishlist,
  onRemoveFromWishlist,
  initialTab = "profile"
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email || "",
    phone: user.phone,
    division: user.division || "Dhaka",
    district: user.district || "Dhaka",
    address: user.address || ""
  });
  const [profileStatus, setProfileStatus] = useState("");

  // Tracking Form state
  const [trackInput, setTrackInput] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackingError, setTrackingError] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Selected Invoice
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [passStatus, setPassStatus] = useState("");

  // Load orders
  useEffect(() => {
    if (activeTab === "orders") {
      setLoadingOrders(true);
      api.orders.myOrders()
        .then((data) => setOrders(data))
        .catch((e) => console.error(e))
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    setProfileForm({
      name: user.name,
      email: user.email || "",
      phone: user.phone,
      division: user.division || "Dhaka",
      district: user.district || "Dhaka",
      address: user.address || ""
    });
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus("");
    try {
      const updated = await api.auth.updateProfile(profileForm);
      onUpdateProfile(updated);
      setProfileStatus("প্রোফাইল সফলভাবে আপডেট করা হয়েছে!");
    } catch (err: any) {
      setProfileStatus(err.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে");
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError("");
    setTrackedOrder(null);
    if (!trackInput.trim()) return;
    setTrackingLoading(true);
    try {
      const order = await api.orders.track(trackInput.trim());
      setTrackedOrder(order);
    } catch (err: any) {
      setTrackingError("সঠিক অর্ডার আইডি বা ট্র্যাকিং নম্বরটি দিন");
    } finally {
      setTrackingLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus("");
    try {
      await api.auth.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPassStatus("পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err: any) {
      setPassStatus(err.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="min-h-screen bg-clay-bg py-8 font-bangla text-clay-text">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-clay-primary">আমার ড্যাশবোর্ড (My Dashboard)</h1>
          <p className="text-xs text-clay-secondary mt-1">প্রোফাইল সম্পাদন, অতীতের অর্ডার লগ, ট্র্যাকিং ও পছন্দের সামগ্রীর তালিকা</p>
        </div>

        {/* Dashboard Frame Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Menu Toggles */}
          <div className="lg:col-span-3 bg-white/60 backdrop-blur-md rounded-3xl p-5 border border-clay-secondary/10 flex flex-col gap-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${activeTab === "profile" ? "bg-clay-primary text-white" : "hover:bg-clay-secondary/5 text-clay-secondary hover:text-clay-primary"}`}
            >
              <User className="w-4.5 h-4.5" />
              আমার প্রোফাইল (Profile)
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${activeTab === "orders" ? "bg-clay-primary text-white" : "hover:bg-clay-secondary/5 text-clay-secondary hover:text-clay-primary"}`}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              আমার অর্ডারসমূহ (Orders)
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${activeTab === "wishlist" ? "bg-clay-primary text-white" : "hover:bg-clay-secondary/5 text-clay-secondary hover:text-clay-primary"}`}
            >
              <Heart className="w-4.5 h-4.5" />
              পছন্দের তালিকা (Wishlist)
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${activeTab === "track" ? "bg-clay-primary text-white" : "hover:bg-clay-secondary/5 text-clay-secondary hover:text-clay-primary"}`}
            >
              <Truck className="w-4.5 h-4.5" />
              অর্ডার ট্র্যাকিং (Track)
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${activeTab === "password" ? "bg-clay-primary text-white" : "hover:bg-clay-secondary/5 text-clay-secondary hover:text-clay-primary"}`}
            >
              <Key className="w-4.5 h-4.5" />
              পাসওয়ার্ড পরিবর্তন
            </button>
          </div>

          {/* Right Main Body Content Panel */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            
            {/* TAB: PROFILE */}
            {activeTab === "profile" && (
              <div className="bg-white/70 p-6 md:p-8 rounded-3xl border border-clay-secondary/10 shadow-sm">
                <h4 className="text-base font-bold text-clay-primary mb-5 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  ব্যক্তিগত তথ্য ও ঠিকানা সম্পাদন
                </h4>

                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-bangla">
                  <div>
                    <label className="block text-gray-500 mb-1.5">আপনার নাম *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-4 outline-none focus:border-clay-primary capitalize font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1.5">ইমেইল ঠিকানা *</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-4 outline-none focus:border-clay-primary font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 mb-1.5">মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-4 outline-none focus:border-clay-primary font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1.5">বিভাগ (Division) *</label>
                    <select
                      value={profileForm.division}
                      onChange={(e) => {
                        const div = e.target.value;
                        setProfileForm({ 
                          ...profileForm, 
                          division: div, 
                          district: bdDistricts[div] ? bdDistricts[div][0] : "" 
                        });
                      }}
                      className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-4 outline-none focus:border-clay-primary"
                    >
                      {bdDivisions.map((div) => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-500 mb-1.5">জেলা (District) *</label>
                    <select
                      value={profileForm.district}
                      onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                      className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-4 outline-none focus:border-clay-primary"
                    >
                      {bdDistricts[profileForm.division]?.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-gray-500 mb-1.5">বিস্তারিত ঠিকানা (রুম নং, সড়ক নং, এলাকা) *</label>
                    <textarea
                      required
                      rows={2.5}
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-4 outline-none focus:border-clay-primary font-bangla"
                      placeholder="বাসা নং-১২, রোড নং-৫, ধানমণ্ডি, ঢাকা"
                    ></textarea>
                  </div>

                  {profileStatus && (
                    <p className="sm:col-span-2 text-xs font-bold font-bangla text-clay-primary">{profileStatus}</p>
                  )}

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="bg-clay-primary hover:bg-clay-secondary text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      তথ্য সংরক্ষণ করুন
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: ORDERS HISTORY */}
            {activeTab === "orders" && (
              <div className="bg-white/70 p-6 md:p-8 rounded-3xl border border-clay-secondary/10 shadow-sm">
                <h4 className="text-base font-bold text-clay-primary mb-5 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  আমার অতীতের অর্ডার হিস্ট্রি
                </h4>

                {loadingOrders ? (
                  <div className="flex justify-center items-center py-10 gap-2 text-xs text-clay-secondary font-bold">
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    লোড হচ্ছে...
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((o) => (
                      <div key={o.id} className="bg-[#FFF8F2] p-5 rounded-3xl border border-clay-secondary/10 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#8B4513]">{o.id}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-[10px] text-gray-500 font-sans flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(o.orderDate).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="font-semibold text-clay-text leading-tight mt-1">
                            {o.items.map((i, idx) => (
                              <p key={idx}>{i.nameBangla} x {i.quantity}</p>
                            ))}
                          </div>

                          <p className="text-[10px] text-gray-400 mt-1">ট্র্যাকিং মেমো নং: <span className="font-mono font-bold text-gray-600">{o.trackingNumber}</span></p>
                        </div>

                        <div className="flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto gap-3 text-xs">
                          <div>
                            <p className="text-gray-500 text-[10px]">মোট মূল্য পরিশোধযোগ্য:</p>
                            <p className="font-sans font-bold text-base text-clay-primary">৳{o.total}</p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedInvoice(o)}
                              className="p-2 border border-clay-secondary/20 hover:border-clay-primary bg-[#FFF8F2] text-clay-secondary hover:text-clay-primary rounded-xl transition-colors flex items-center gap-1 font-semibold text-[10px]"
                              title="ইনভয়েস মেমো দেখুন"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              মেমো রশিদ
                            </button>
                            
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase ${o.orderStatus === "delivered" ? "bg-green-100 text-green-800" : o.orderStatus === "cancelled" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                              {o.orderStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 font-bangla text-xs text-gray-400">
                    <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    আপনি এখনো কোনো অর্ডার করেননি। এখনই আমাদের মৃৎশিল্প সামগ্রী থেকে কেনাকাটা শুরু করুন!
                  </div>
                )}
              </div>
            )}

            {/* TAB: WISHLIST */}
            {activeTab === "wishlist" && (
              <div className="bg-white/70 p-6 md:p-8 rounded-3xl border border-clay-secondary/10 shadow-sm">
                <h4 className="text-base font-bold text-clay-primary mb-5 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  পছন্দের মাটির জিনিসপত্রের তালিকা
                </h4>

                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlist.map((p) => (
                      <div key={p.id} className="bg-[#FFF8F2] p-4 rounded-3xl border border-clay-secondary/10 flex flex-col justify-between text-xs font-bangla shadow-sm">
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                          <img src={p.images[0]} alt="wishlist" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h5 className="font-bold text-clay-text line-clamp-1">{p.nameBangla}</h5>
                          <p className="text-xs text-clay-primary font-black mt-1">৳{p.discountPrice || p.price}</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => onNavigate("product", { id: p.id })}
                            className="flex-1 bg-clay-primary hover:bg-clay-secondary text-white text-[10px] font-bold py-1.5 rounded-lg text-center transition-all"
                          >
                            বিস্তারিত দেখুন
                          </button>
                          <button
                            onClick={() => onRemoveFromWishlist(p)}
                            className="p-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          >
                            মুছুন
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 font-bangla text-xs text-gray-400">
                    <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    আপনার পছন্দের তালিকাটি একদম খালি। পছন্দসই জিনিস রাখতে লাভ চিহ্নে চাপুন।
                  </div>
                )}
              </div>
            )}

            {/* TAB: ORDER TRACKING STATS */}
            {activeTab === "track" && (
              <div className="bg-white/70 p-6 md:p-8 rounded-3xl border border-clay-secondary/10 shadow-sm flex flex-col gap-6 font-bangla">
                <div>
                  <h4 className="text-base font-bold text-clay-primary mb-1.5 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    নিরাপদ ও দ্রুত ডেলিভারি ট্র্যাকিং
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    অর্ডারের সময় প্রাপ্ত অনন্য আইডি (যেমন: ORD-12345) অথবা ট্র্যাকিং মেমো নম্বরটি নিচে ইনপুট করে মুহূর্তেই আপনার ঐতিহ্যবাহী মাটির সামগ্রীর শিপমেন্ট ও ডেলিভারি স্ট্যাটাস চেক করুন।
                  </p>
                </div>

                <form onSubmit={handleTrackSubmit} className="flex gap-3 max-w-md">
                  <input
                    type="text"
                    required
                    placeholder="মেমো নং (যেমন: ORD-73921 বা ট্র্যাকিং কোড)..."
                    value={trackInput}
                    onChange={(e) => setTrackInput(e.target.value)}
                    className="flex-1 text-xs bg-[#FFF8F2] border border-clay-secondary/25 focus:border-clay-primary py-2.5 px-4 rounded-xl outline-none"
                  />
                  <button
                    type="submit"
                    disabled={trackingLoading}
                    className="bg-clay-primary hover:bg-clay-secondary text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow flex items-center gap-1.5 shrink-0"
                  >
                    {trackingLoading ? "লোডিং..." : "অর্ডার খুঁজুন"}
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                {trackingError && (
                  <p className="text-xs font-bold text-red-600">{trackingError}</p>
                )}

                {/* Tracking Stepper graphics */}
                {trackedOrder && (
                  <div className="bg-[#FFF8F2] border border-clay-secondary/10 rounded-3xl p-5 md:p-6 shadow-sm mt-4">
                    <div className="flex justify-between items-center border-b border-clay-secondary/10 pb-4 mb-5 text-xs text-gray-500">
                      <div>
                        <p className="font-bold text-clay-primary text-sm">অর্ডার আইডি: {trackedOrder.id}</p>
                        <p className="mt-0.5 font-mono">ট্র্যাকিং কোড: {trackedOrder.trackingNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-700 capitalize">ক্রেতা: {trackedOrder.customerName}</p>
                      </div>
                    </div>

                    {/* Delivery Status Stepper logic */}
                    {trackedOrder.orderStatus === "cancelled" ? (
                      <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs border border-red-100 font-semibold text-center">
                        দুঃখিত, এই অর্ডারটি কোনো ত্রুটির কারণে বাতিল করা হয়েছে (Cancelled)
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-4 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[3px] bg-gray-200 z-0"></div>

                        {/* STEP 1: Pending */}
                        <div className="flex flex-col items-center gap-2 z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            ["pending", "processing", "shipped", "delivered"].includes(trackedOrder.orderStatus)
                              ? "bg-clay-primary text-white" : "bg-gray-200 text-gray-400"
                          }`}>
                            ১
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-clay-text">গৃহীত (Pending)</p>
                            <span className="text-[9px] text-gray-400">অর্ডার কনফার্ম হয়েছে</span>
                          </div>
                        </div>

                        {/* STEP 2: Processing */}
                        <div className="flex flex-col items-center gap-2 z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            ["processing", "shipped", "delivered"].includes(trackedOrder.orderStatus)
                              ? "bg-clay-primary text-white" : "bg-gray-200 text-gray-400"
                          }`}>
                            ২
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-clay-text">প্যাকিং (Processing)</p>
                            <span className="text-[9px] text-gray-400">নিরাপদ কার্টন প্রস্তুত হচ্ছে</span>
                          </div>
                        </div>

                        {/* STEP 3: Shipped */}
                        <div className="flex flex-col items-center gap-2 z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            ["shipped", "delivered"].includes(trackedOrder.orderStatus)
                              ? "bg-clay-primary text-white" : "bg-gray-200 text-gray-400"
                          }`}>
                            ৩
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-clay-text">শিপিং (Shipped)</p>
                            <span className="text-[9px] text-gray-400">কুরিয়ারে হস্তান্তর করা হয়েছে</span>
                          </div>
                        </div>

                        {/* STEP 4: Delivered */}
                        <div className="flex flex-col items-center gap-2 z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            trackedOrder.orderStatus === "delivered"
                              ? "bg-green-600 text-white" : "bg-gray-200 text-gray-400"
                          }`}>
                            ৪
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-clay-text">পৌঁছেছে (Delivered)</p>
                            <span className="text-[9px] text-gray-400">হস্তান্তর করা হয়েছে</span>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: CHANGE PASSWORD */}
            {activeTab === "password" && (
              <div className="bg-white/70 p-6 md:p-8 rounded-3xl border border-clay-secondary/10 shadow-sm">
                <h4 className="text-base font-bold text-clay-primary mb-5 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  নিরাপদ পাসওয়ার্ড পরিবর্তন
                </h4>

                <form onSubmit={handlePasswordSubmit} className="max-w-md flex flex-col gap-4 text-xs font-bangla">
                  <div>
                    <label className="block text-gray-500 mb-1.5">বর্তমান পাসওয়ার্ড *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-4 outline-none focus:border-clay-primary font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1.5">নতুন পাসওয়ার্ড *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full bg-[#FFF8F2] border border-clay-secondary/20 rounded-xl py-2.5 px-4 outline-none focus:border-clay-primary font-sans"
                    />
                  </div>

                  {passStatus && (
                    <p className="text-xs font-bold font-bangla text-clay-primary">{passStatus}</p>
                  )}

                  <button
                    type="submit"
                    className="self-start bg-clay-primary hover:bg-clay-secondary text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm"
                  >
                    পাসওয়ার্ড আপডেট করুন
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Invoice modal overlay */}
      {selectedInvoice && (
        <InvoiceModal
          order={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
