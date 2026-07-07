import React, { useState, useEffect } from "react";
import { 
  Phone, Mail, MapPin, Facebook, Instagram, Youtube, Send, 
  MessageCircle, Heart, ShieldCheck, CheckCircle
} from "lucide-react";

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("urmi_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => {
        setShowCookieConsent(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem("urmi_cookie_consent", "accepted");
    setShowCookieConsent(false);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative bg-[#222222] text-[#FFF8F2]/80 font-bangla pt-16 pb-8 border-t-4 border-clay-secondary" id="main-footer">
      {/* Wave decor/Traditional pattern */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-clay-accent to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        
        {/* Column 1: About Business */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-clay-secondary text-white flex items-center justify-center font-bold text-lg">
              উ
            </div>
            <h3 className="text-xl font-bold text-white font-bangla">উর্মি মৃৎশিল্প</h3>
          </div>
          <p className="text-xs text-[#FFF8F2]/60 font-medium leading-relaxed font-bangla">
            উর্মি মৃৎশিল্প বাংলাদেশের ঐতিহ্যবাহী মৃৎশিল্পের এক বিশ্বস্ত ঠিকানা। আমরা আমাদের দক্ষ কারিগরদের নিপুণ হাতের ছোঁয়ায় নদীমাতৃক বাংলার খাঁটি পলিমাটি দিয়ে ঐতিহ্যবাহী ও আধুনিক নান্দনিক নকশার মাটির পণ্য তৈরি করে থাকি। আমাদের লক্ষ্য দেশীয় ঐতিহ্য রক্ষা ও প্রচার।
          </p>
          
          <div className="flex flex-col gap-2.5 text-xs font-semibold">
            <div className="flex items-center gap-2 text-[#FFF8F2]/80 hover:text-clay-accent transition-colors">
              <Phone className="w-4 h-4 text-clay-secondary" />
              <a href="tel:01756511455">০১৭৫৬৫১১৪৫৫</a>
            </div>
            <div className="flex items-start gap-2 text-[#FFF8F2]/80">
              <MapPin className="w-4 h-4 text-clay-secondary mt-0.5 flex-shrink-0" />
              <span>জয়পুরহাট, নতুনহাট গরুহাটি, জয়পুরহাট সদর।</span>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-bold text-white border-b border-clay-secondary/20 pb-2">গুরুত্বপূর্ণ লিঙ্ক</h4>
          <ul className="flex flex-col gap-2.5 text-xs font-medium font-bangla">
            <li>
              <button onClick={() => onNavigate("home")} className="hover:text-clay-accent transition-colors text-left">মাটির সামগ্রী</button>
            </li>
            <li>
              <button onClick={() => onNavigate("shop")} className="hover:text-clay-accent transition-colors text-left">আমাদের দোকান (Shop)</button>
            </li>
            <li>
              <button onClick={() => onNavigate("gallery")} className="hover:text-clay-accent transition-colors text-left">পণ্য গ্যালারি (Gallery)</button>
            </li>
            <li>
              <button onClick={() => onNavigate("about")} className="hover:text-clay-accent transition-colors text-left">আমাদের সম্পর্কে (About Us)</button>
            </li>
            <li>
              <button onClick={() => onNavigate("dashboard", { tab: "track" })} className="hover:text-clay-accent transition-colors text-left">অর্ডার ট্র্যাক করুন (Track Order)</button>
            </li>
            <li>
              <button onClick={() => onNavigate("contact")} className="hover:text-clay-accent transition-colors text-left">যোগাযোগ করুন (Contact)</button>
            </li>
          </ul>
        </div>

        {/* Column 3: Google Map */}
        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-bold text-white border-b border-clay-secondary/20 pb-2">আমাদের অবস্থান (Google Map)</h4>
          <div className="w-full h-44 rounded-xl overflow-hidden shadow-md border border-clay-secondary/15">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14594.134267433296!2d90.21041933095368!3d23.906161245781324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m2!1s0x3755eed971842eb7%3A0xc3cf937402a46c1a!2sDhamrai!5e0!3m2!1sen!2sbd!4v1719330000000!5m2!1sen!2sbd"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Dhamrai Clay Pottery Village Map"
              id="gmap-iframe"
            ></iframe>
          </div>
          <p className="text-[10px] text-[#FFF8F2]/50 italic text-center">বাংলাদেশি ঐতিহ্যবাহী পাল পাড়া মৃৎশিল্প কেন্দ্র</p>
        </div>

        {/* Column 4: Newsletter */}
        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-bold text-white border-b border-clay-secondary/20 pb-2">খবর ও অফার (Newsletter)</h4>
          <p className="text-xs text-[#FFF8F2]/60 font-bangla leading-relaxed">
            আমাদের নতুন পণ্যের খবর এবং ডিসকাউন্ট অফার সবার আগে ইমেইলে পেতে সাবস্ক্রাইব করুন।
          </p>
          
          <form onSubmit={handleSubscribe} className="relative flex flex-col gap-2">
            <div className="relative">
              <input
                type="email"
                placeholder="আপনার ইমেইল দিন..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-lg py-2.5 pl-3 pr-10 text-xs focus:outline-none focus:border-clay-accent font-sans"
                required
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 p-1 text-clay-accent hover:text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {subscribed && (
              <p className="text-xs text-green-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                সফলভাবে সাবস্ক্রাইব করা হয়েছে!
              </p>
            )}
          </form>

          {/* Accept payments logo */}
          <div className="mt-2">
            <p className="text-[10px] text-[#FFF8F2]/40 mb-2 uppercase font-semibold font-sans tracking-wider">Accepted Payments</p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] bg-pink-600 text-white px-2 py-0.5 rounded font-bold">bKash</span>
              <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded font-bold">Nagad</span>
              <span className="text-[10px] bg-purple-700 text-white px-2 py-0.5 rounded font-bold">Rocket</span>
              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold">Cards / COD</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bangla text-[#FFF8F2]/50">
        <p>© ২০২৬ উর্মি মৃৎশিল্প। সর্বস্বত্ব সংরক্ষিত।</p>
        <div className="flex items-center gap-2">
          <span>নিপুণ কারিগরি ভালোবাসায় নির্মিত</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>সাভার, বাংলাদেশ</span>
        </div>
      </div>

      {/* WhatsApp & Messenger Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* Messenger Floating Shortcut */}
        <a 
          href="https://m.me/urmiclay" 
          target="_blank" 
          rel="noreferrer" 
          className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white"
          title="মেসেঞ্জারে চ্যাট করুন"
          id="messenger-float"
        >
          <MessageCircle className="w-6 h-6" />
        </a>

        {/* WhatsApp Floating Shortcut */}
        <a 
          href="https://wa.me/8801756511455?text=আসসালামু%20আলাইকুম,%20উর্মি%20মৃৎশিল্প%20থেকে%20মাটির%20পণ্য%20সম্পর্কে%20জানতে%20চাই।" 
          target="_blank" 
          rel="noreferrer" 
          className="bg-green-500 hover:bg-green-400 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white"
          title="হোয়াটসঅ্যাপে যোগাযোগ করুন"
          id="whatsapp-float"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 1.977 14.13 1.05 11.999 1.05 6.562 1.05 2.137 5.42 2.133 10.85c-.001 1.693.447 3.34 1.3 4.794l-1.074 3.92 4.022-1.055zm11.13-7.581c-.301-.151-1.785-.881-2.057-.981-.273-.099-.471-.148-.67.151-.197.297-.767.981-.94 1.181-.173.2-.347.225-.648.075-.301-.151-1.27-.468-2.42-1.494-.894-.798-1.5-.1.185-1.127-1.3-.235-.472-.347-.151-.198-.15.301.15.542.148.914-.075.372-.037 1.456.372 2.053.801.402.6 1.838 2.808 4.453 3.94 1.25.541 2.227.865 2.987 1.106.76.241 1.452.207 2.002.125.612-.091 1.785-.73 2.033-1.436.248-.706.248-1.312.173-1.438-.074-.124-.272-.198-.57-.347z"/>
          </svg>
        </a>
      </div>

      {/* Cookie Consent Banner */}
      {showCookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#222222]/95 border-t border-clay-secondary text-white text-xs font-bangla py-4 px-6 z-50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-clay-accent shrink-0" />
            <p className="leading-relaxed text-[#FFF8F2]/90">
              আমাদের ওয়েবসাইটে আপনার অভিজ্ঞতা উন্নত করতে এবং সাইট ভিজিটর বিশ্লেষণ করতে আমরা কুকি (Cookies) ব্যবহার করি। সম্মতি জানাতে বোতামে ক্লিক করুন।
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button 
              onClick={() => setShowCookieConsent(false)} 
              className="text-[#FFF8F2]/60 hover:text-white px-3 py-1.5 hover:underline"
            >
              প্রত্যাখ্যান করুন
            </button>
            <button 
              onClick={handleAcceptCookies} 
              className="bg-clay-accent hover:bg-clay-accent/80 text-clay-text font-bold px-5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-md"
            >
              সম্মত আছি (Accept)
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
