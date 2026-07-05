import React, { useState, useEffect, useRef } from "react";
import { 
  Search, ShoppingCart, Heart, User, Phone, Facebook, Instagram, Youtube, 
  MapPin, Menu, X, Mic, MicOff, LogOut, LayoutDashboard, ShoppingBag, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User as UserType, CartItem, Product } from "../types";
import { api } from "../lib/api";

interface HeaderProps {
  user: UserType | null;
  onLogout: () => void;
  onNavigate: (page: string, params?: any) => void;
  cart: CartItem[];
  wishlist: Product[];
  onOpenCart: () => void;
  activePage: string;
}

export default function Header({
  user,
  onLogout,
  onNavigate,
  cart,
  wishlist,
  onOpenCart,
  activePage
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Categories list
  const categories = [
    "Clay Tea Pot",
    "Clay Flower Pot",
    "Clay Lamp",
    "Clay Cup",
    "Clay Plate",
    "Clay Vase",
    "Decoration",
    "Kitchen Items",
    "Gift Items"
  ];

  // Voice Search Web Speech API
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("দুঃখিত, আপনার ব্রাউজারটি ভয়েস সার্চ সাপোর্ট করে না (Voice search is not supported in this browser)");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "bn-BD"; // Search in Bangla
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setSearchQuery(speechToText);
      setIsListening(false);
      onNavigate("shop", { search: speechToText });
    };

    recognition.onerror = (err: any) => {
      console.error(err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch live search suggestions
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timer = setTimeout(async () => {
        try {
          const res = await api.products.list({ search: searchQuery, limit: 5 });
          setSuggestions(res.products);
          setShowSuggestions(true);
        } catch (e) {
          console.error(e);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate("shop", { search: searchQuery });
      setShowSuggestions(false);
    }
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFF8F2] clay-shadow border-b border-clay-secondary/10" id="main-header">
      {/* Top Bar */}
      <div className="w-full bg-clay-primary text-white py-1.5 px-4 text-xs md:text-sm font-bangla transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-clay-accent text-clay-text px-2 py-0.5 rounded-full text-[10px] uppercase font-bold animate-pulse-slow">অফার</span>
            <span>ঢাকা সিটির ভেতরে ডেলিভারি চার্জ মাত্র ৬০ টাকা! যেকোনো তথ্য বা অর্ডারের জন্য: <strong>০১৭৫৬৫১১৪৫৫</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 border-r border-white/20 pr-4">
              <Phone className="w-3.5 h-3.5" />
              <a href="tel:01756511455" className="hover:text-clay-accent transition-colors">01756511455</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-clay-accent transition-all hover:scale-115">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-clay-accent transition-all hover:scale-115">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-clay-accent transition-all hover:scale-115">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Mobile Toggle & Logo */}
        <div className="flex items-center gap-2">
          <button 
            className="md:hidden p-2 text-clay-primary hover:bg-clay-secondary/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div 
            onClick={() => onNavigate("home")} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-clay-primary flex items-center justify-center text-[#FFF8F2] font-bold text-xl clay-shadow-sm group-hover:rotate-12 transition-transform duration-300">
              উ
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-bold font-bangla text-clay-primary leading-tight tracking-wide">
                উর্মি মৃৎশিল্প
              </h1>
              <span className="text-[10px] md:text-xs font-sans tracking-widest uppercase text-clay-secondary font-semibold">
                Urmi Mrityoshilpo
              </span>
            </div>
          </div>
        </div>

        {/* Large Search Bar with voice option */}
        <div className="hidden md:block flex-1 max-w-2xl relative" ref={suggestionRef}>
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <input
              type="text"
              placeholder="মাটির পাত্র, টব, ল্যাম্প খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-[#FFF8F2] border-2 border-clay-secondary/20 hover:border-clay-secondary/40 focus:border-clay-primary outline-none py-2.5 pl-4 pr-20 rounded-full text-sm text-clay-text font-bangla transition-all shadow-inner"
            />
            <div className="absolute right-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-1.5 rounded-full transition-colors ${isListening ? "bg-red-500 text-white animate-pulse" : "text-clay-secondary hover:text-clay-primary hover:bg-clay-secondary/10"}`}
                title="ভয়েস দিয়ে সার্চ করুন (Bangla Speech to Text)"
              >
                {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button 
                type="submit" 
                className="bg-clay-primary hover:bg-clay-secondary text-white p-2 rounded-full transition-all hover:scale-105 active:scale-95"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 right-0 mt-2 bg-[#FFF8F2] rounded-2xl clay-shadow border border-clay-secondary/10 overflow-hidden z-50 p-2"
              >
                {suggestions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onNavigate("product", { id: p.id });
                      setShowSuggestions(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-clay-secondary/5 rounded-xl cursor-pointer transition-colors"
                  >
                    <img 
                      src={p.images[0]} 
                      alt={p.nameEnglish} 
                      className="w-12 h-12 object-cover rounded-lg border border-clay-secondary/10"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bangla font-semibold text-sm text-clay-text truncate">{p.nameBangla}</p>
                      <p className="text-xs text-clay-secondary truncate">{p.category} | SKU: {p.SKU}</p>
                    </div>
                    <div className="text-right">
                      {p.discountPrice ? (
                        <div>
                          <p className="font-bold text-sm text-clay-primary">৳{p.discountPrice}</p>
                          <p className="text-[10px] text-gray-400 line-through">৳{p.price}</p>
                        </div>
                      ) : (
                        <p className="font-bold text-sm text-clay-primary">৳{p.price}</p>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wishlist, Cart & Profile actions */}
        <div className="flex items-center gap-3">
          {/* Wishlist Icon */}
          <button 
            onClick={() => onNavigate("wishlist")}
            className="relative p-2.5 text-clay-secondary hover:text-clay-primary hover:bg-clay-secondary/10 rounded-full transition-all hover:scale-105"
            title="পছন্দের তালিকা (Wishlist)"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-clay-accent text-clay-text text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#FFF8F2]">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button 
            onClick={onOpenCart}
            className="relative p-2.5 text-clay-secondary hover:text-clay-primary hover:bg-clay-secondary/10 rounded-full transition-all hover:scale-105"
            title="কার্ট (Shopping Cart)"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalCartItems > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-clay-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#FFF8F2]">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* User Account / Admin Area */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 border border-clay-secondary/20 hover:border-clay-primary/40 bg-clay-secondary/5 hover:bg-clay-secondary/10 rounded-full transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-clay-secondary text-white flex items-center justify-center font-bold text-sm capitalize">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-clay-text font-bangla capitalize truncate max-w-[80px]">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-[#FFF8F2] rounded-2xl clay-shadow border border-clay-secondary/10 overflow-hidden z-50 py-1"
                    >
                      <div className="px-4 py-2 border-b border-clay-secondary/5">
                        <p className="text-xs text-clay-secondary">স্বাগতম</p>
                        <p className="text-sm font-bold font-bangla text-clay-text capitalize truncate">{user.name}</p>
                      </div>

                      {user.role === "admin" && (
                        <button
                          onClick={() => {
                            onNavigate("admin");
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bangla font-semibold text-clay-primary hover:bg-clay-secondary/5 flex items-center gap-2 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          এডমিন প্যানেল
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onNavigate("dashboard");
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bangla text-clay-text hover:bg-clay-secondary/5 flex items-center gap-2 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        আমার প্রোফাইল
                      </button>

                      <button
                        onClick={() => {
                          onNavigate("dashboard", { tab: "orders" });
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bangla text-clay-text hover:bg-clay-secondary/5 flex items-center gap-2 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        আমার অর্ডারসমূহ
                      </button>

                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bangla text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-clay-secondary/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        লগআউট (Logout)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => onNavigate("login")}
                className="bg-clay-primary hover:bg-clay-secondary text-white text-xs font-bangla font-semibold px-4 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm"
              >
                <User className="w-4 h-4" />
                লগইন / রেজিস্টার
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <nav className="border-t border-clay-secondary/5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between font-bangla text-sm">
          <div className="flex items-center gap-6 py-3 font-semibold">
            <button 
              onClick={() => onNavigate("home")} 
              className={`hover:text-clay-primary transition-colors py-1 relative ${activePage === "home" ? "text-clay-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-clay-primary" : "text-clay-text"}`}
            >
              হোম (Home)
            </button>
            
            <button 
              onClick={() => onNavigate("shop")} 
              className={`hover:text-clay-primary transition-colors py-1 relative ${activePage === "shop" ? "text-clay-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-clay-primary" : "text-clay-text"}`}
            >
              শপ (Shop)
            </button>

            {/* Categories Mega Menu Popover */}
            <div className="relative group/menu py-1">
              <button className="text-clay-text hover:text-clay-primary cursor-pointer flex items-center gap-1">
                ক্যাটাগরি সমূহ
                <span className="text-[10px] transition-transform group-hover/menu:rotate-180">▼</span>
              </button>
              <div className="absolute left-0 mt-3 w-64 bg-[#FFF8F2] rounded-2xl clay-shadow border border-clay-secondary/10 hidden group-hover/menu:block z-50 p-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onNavigate("shop", { category: cat })}
                    className="w-full text-left px-4 py-2.5 hover:bg-clay-secondary/5 hover:text-clay-primary rounded-xl text-xs font-semibold text-clay-text transition-colors flex items-center justify-between"
                  >
                    <span>
                      {cat === "Clay Tea Pot" && "মাটির চা কেতলি (Tea Pots)"}
                      {cat === "Clay Flower Pot" && "মাটির ফুলের টব (Flower Pots)"}
                      {cat === "Clay Lamp" && "মাটির ল্যাম্প (Lamps)"}
                      {cat === "Clay Cup" && "মাটির কাপ ও মগ (Cups)"}
                      {cat === "Clay Plate" && "মাটির থালা ও প্লেট (Plates)"}
                      {cat === "Clay Vase" && "মাটির নান্দনিক ফুলদানি (Vases)"}
                      {cat === "Decoration" && "দেয়াল ও ঘর সাজানো (Decoration)"}
                      {cat === "Kitchen Items" && "রান্নাঘরের হাঁড়ি পাতিল (Kitchen)"}
                      {cat === "Gift Items" && "উপহার সামগ্রী (Gift Items)"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => onNavigate("gallery")} 
              className={`hover:text-clay-primary transition-colors py-1 relative ${activePage === "gallery" ? "text-clay-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-clay-primary" : "text-clay-text"}`}
            >
              গ্যালারি (Gallery)
            </button>
            <button 
              onClick={() => onNavigate("about")} 
              className={`hover:text-clay-primary transition-colors py-1 relative ${activePage === "about" ? "text-clay-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-clay-primary" : "text-clay-text"}`}
            >
              আমাদের কথা (About Us)
            </button>
            <button 
              onClick={() => onNavigate("contact")} 
              className={`hover:text-clay-primary transition-colors py-1 relative ${activePage === "contact" ? "text-clay-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-clay-primary" : "text-clay-text"}`}
            >
              যোগাযোগ (Contact)
            </button>
          </div>
          
          <button
            onClick={() => onNavigate("dashboard", { tab: "track" })}
            className="flex items-center gap-1.5 text-xs font-semibold text-clay-secondary hover:text-clay-primary bg-clay-secondary/5 hover:bg-clay-secondary/10 px-3.5 py-1.5 rounded-full border border-clay-secondary/10 transition-all hover:scale-105"
          >
            <MapPin className="w-3.5 h-3.5" />
            অর্ডার ট্র্যাকিং (Track Order)
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden w-full bg-[#FFF8F2] border-t border-clay-secondary/10 shadow-lg px-4 py-4 font-bangla text-sm overflow-hidden"
          >
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full mb-4">
              <input
                type="text"
                placeholder="মৃৎশিল্প সামগ্রী খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFF8F2] border border-clay-secondary/20 outline-none py-2 pl-4 pr-12 rounded-full text-xs text-clay-text"
              />
              <button type="submit" className="absolute right-3 text-clay-secondary hover:text-clay-primary">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-col gap-3 font-semibold text-clay-text">
              <button 
                onClick={() => { onNavigate("home"); setIsMobileMenuOpen(false); }}
                className="text-left py-1 hover:text-clay-primary border-b border-clay-secondary/5"
              >
                হোম (Home)
              </button>
              <button 
                onClick={() => { onNavigate("shop"); setIsMobileMenuOpen(false); }}
                className="text-left py-1 hover:text-clay-primary border-b border-clay-secondary/5"
              >
                শপ (Shop)
              </button>
              
              {/* Category expansion */}
              <div className="flex flex-col pl-2 border-l border-clay-secondary/15">
                <p className="text-xs text-clay-secondary font-medium mb-1">ক্যাটাগরি সমূহ</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { onNavigate("shop", { category: cat }); setIsMobileMenuOpen(false); }}
                      className="text-left py-1 text-clay-text hover:text-clay-primary truncate font-medium"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => { onNavigate("gallery"); setIsMobileMenuOpen(false); }}
                className="text-left py-1 hover:text-clay-primary border-b border-clay-secondary/5"
              >
                গ্যালারি (Gallery)
              </button>
              <button 
                onClick={() => { onNavigate("about"); setIsMobileMenuOpen(false); }}
                className="text-left py-1 hover:text-clay-primary border-b border-clay-secondary/5"
              >
                আমাদের কথা (About Us)
              </button>
              <button 
                onClick={() => { onNavigate("contact"); setIsMobileMenuOpen(false); }}
                className="text-left py-1 hover:text-clay-primary border-b border-clay-secondary/5"
              >
                যোগাযোগ (Contact)
              </button>
              <button 
                onClick={() => { onNavigate("dashboard", { tab: "track" }); setIsMobileMenuOpen(false); }}
                className="text-left py-1 text-clay-secondary hover:text-clay-primary flex items-center gap-1"
              >
                <MapPin className="w-4 h-4" />
                অর্ডার ট্র্যাক করুন
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
