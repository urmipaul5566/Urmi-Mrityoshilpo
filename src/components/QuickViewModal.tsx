import React, { useState, useEffect } from "react";
import { X, Star, Heart, ShoppingCart, Share2, Shield, Truck, Sparkles } from "lucide-react";
import { Product, Review } from "../types";
import { api } from "../lib/api";

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  allProducts?: Product[]; // For related products
  onNavigateToRelated?: (id: string) => void;
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  allProducts = [],
  onNavigateToRelated
}: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  useEffect(() => {
    setSelectedImage(product.images[0]);
    setQuantity(1);
    // Load reviews
    api.reviews.get(product.id)
      .then((data) => setReviews(data))
      .catch((e) => console.error("Error loading reviews:", e));
  }, [product]);

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + "/product/" + product.id);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const added = await api.reviews.create(product.id, newRating, newComment);
      setReviews([added, ...reviews]);
      setNewComment("");
      setNewRating(5);
      alert("রিভিউ যোগ করার জন্য আপনাকে ধন্যবাদ!");
    } catch (err: any) {
      alert(err.message || "রিভিউ জমা দেওয়া সম্ভব হয়নি। অনুগ্রহ করে আগে লগইন করুন।");
    } finally {
      setSubmittingReview(false);
    }
  };

  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-[#FFF8F2] w-full max-w-5xl rounded-3xl clay-shadow-lg overflow-hidden border border-clay-secondary/15 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/80 text-clay-text p-2 rounded-full hover:bg-clay-primary hover:text-white transition-colors z-10 shadow"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
          
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white border border-clay-secondary/5 relative group">
              <img
                src={selectedImage || "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&auto=format&fit=crop&q=80"}
                alt={product.nameEnglish}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&auto=format&fit=crop&q=80";
                }}
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-clay-accent text-clay-text text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  ডিসকাউন্ট অফার!
                </span>
              )}
            </div>
            
            {/* Gallery Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? "border-clay-primary shadow-sm" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img 
                      src={img} 
                      alt="thumbnail" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&auto=format&fit=crop&q=80";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Clay Craftsmanship Guarantees */}
            <div className="bg-clay-secondary/5 rounded-2xl p-4 mt-2 border border-clay-secondary/10 grid grid-cols-2 gap-3 text-xs text-clay-text">
              <div className="flex items-center gap-2 font-bangla font-semibold">
                <Shield className="w-4 h-4 text-clay-primary shrink-0" />
                <span>১০০% পরিবেশবান্ধব</span>
              </div>
              <div className="flex items-center gap-2 font-bangla font-semibold">
                <Truck className="w-4 h-4 text-clay-primary shrink-0" />
                <span>নিরাপদ প্যাকেজিং ও ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2 font-bangla font-semibold">
                <Sparkles className="w-4 h-4 text-clay-primary shrink-0" />
                <span>ঐতিহ্যবাহী হাতের তৈরি</span>
              </div>
              <div className="flex items-center gap-2 font-bangla font-semibold">
                <Star className="w-4 h-4 text-clay-primary shrink-0" />
                <span>মৃৎশিল্প ঐতিহ্য</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Operations */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="border-b border-clay-secondary/10 pb-4 mb-4">
                <span className="text-xs uppercase font-extrabold text-clay-secondary bg-clay-secondary/5 px-3 py-1 rounded-full tracking-wider">
                  {product.category}
                </span>
                
                {/* Product Name */}
                <h2 className="text-xl md:text-2xl font-bold font-bangla text-clay-primary mt-2">
                  {product.nameBangla}
                </h2>
                <p className="text-xs text-gray-500 font-sans italic mt-0.5">
                  {product.nameEnglish}
                </p>

                {/* Rating Bar */}
                <div className="flex items-center gap-2 mt-2.5">
                  <div className="flex text-clay-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-current" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-clay-text">{product.rating} / ৫.০</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-clay-secondary">({product.reviewsCount} কাস্টমার রিভিউ)</span>
                </div>
              </div>

              {/* Price Details */}
              <div className="flex items-baseline gap-3 mb-4">
                {hasDiscount ? (
                  <>
                    <span className="text-2xl font-black text-clay-primary">৳{product.discountPrice}</span>
                    <span className="text-sm text-gray-400 line-through">৳{product.price}</span>
                  </>
                ) : (
                  <span className="text-2xl font-black text-clay-primary">৳{product.price}</span>
                )}
              </div>

              {/* Descriptions */}
              <div className="mb-4">
                <h4 className="text-xs font-bold text-clay-secondary uppercase tracking-wider mb-1 font-bangla">সংক্ষিপ্ত বিবরণ</h4>
                <p className="text-sm text-clay-text font-bangla font-medium leading-relaxed bg-clay-secondary/5 p-3 rounded-xl border border-clay-secondary/5">
                  {product.shortDescription || product.description.slice(0, 80) + "..."}
                </p>
              </div>

              {/* Detailed Specs Grid */}
              <div className="bg-[#FFF8F2] border border-clay-secondary/10 rounded-2xl p-4 mb-5 text-xs">
                <h4 className="text-xs font-bold text-clay-secondary uppercase tracking-wider mb-2 font-bangla">স্পেসিফিকেশন</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <p className="text-gray-500">স্টক স্ট্যাটাস:</p>
                  <p className={`font-semibold ${product.stock > 0 ? "text-green-700" : "text-red-600"}`}>
                    {product.stock > 0 ? `স্টকে আছে (${product.stock} টি)` : "স্টক শেষ"}
                  </p>
                  <p className="text-gray-500">প্রডাক্ট কোড (SKU):</p>
                  <p className="font-semibold text-clay-text">{product.SKU}</p>
                  <p className="text-gray-500">ওজন (Weight):</p>
                  <p className="font-semibold text-clay-text">{product.weight}</p>
                  <p className="text-gray-500">সাইজ (Size):</p>
                  <p className="font-semibold text-clay-text">{product.size}</p>
                  <p className="text-gray-500">মেটেরিয়াল:</p>
                  <p className="font-semibold text-clay-text">{product.material}</p>
                </div>
              </div>
            </div>

            {/* Operations Panel */}
            <div>
              {/* Quantity counter & Core buttons */}
              {product.stock > 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-clay-secondary/20 rounded-xl bg-[#FFF8F2] overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3.5 py-2 text-clay-secondary hover:bg-clay-secondary/10 font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 text-sm font-bold text-clay-text min-w-[40px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3.5 py-2 text-clay-secondary hover:bg-clay-secondary/10 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onAddToCart(product, quantity)}
                      className="flex-1 bg-clay-secondary hover:bg-clay-primary text-white font-bangla font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      কার্ট-এ যোগ করুন
                    </button>
                  </div>

                  <button
                    onClick={() => onBuyNow(product, quantity)}
                    className="w-full bg-clay-primary hover:bg-clay-secondary text-white font-bangla font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    সরাসরি অর্ডার করুন (Buy Now)
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 font-bangla text-xs border border-red-100">
                  <span>এই পণ্যটির স্টক এই মুহূর্তে শেষ। শীঘ্রই নতুন স্টক আনা হবে।</span>
                </div>
              )}

              {/* Wishlist & Share buttons */}
              <div className="flex items-center justify-between border-t border-clay-secondary/10 pt-4 mt-5">
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`flex items-center gap-1.5 text-xs font-semibold ${isWishlisted ? "text-red-500" : "text-clay-secondary hover:text-red-500"} transition-colors`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`} />
                  {isWishlisted ? "পছন্দের তালিকায় আছে" : "পছন্দের তালিকায় রাখুন"}
                </button>

                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-xs font-semibold text-clay-secondary hover:text-clay-primary transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    লিঙ্ক কপি করুন (Share)
                  </button>
                  {showShareTooltip && (
                    <span className="absolute bottom-full right-0 mb-2 bg-[#222222] text-white text-[10px] py-1 px-2.5 rounded shadow z-10 font-bangla whitespace-nowrap">
                      লিঙ্ক কপি করা হয়েছে!
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Description and Customer Reviews tabs */}
        <div className="bg-clay-secondary/3 px-6 md:px-8 py-6 border-t border-clay-secondary/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full description */}
            <div>
              <h3 className="text-base font-bold font-bangla text-clay-primary mb-2">বিস্তারিত বর্ণনা (Product Description)</h3>
              <p className="text-sm text-clay-text font-bangla font-medium leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Review system */}
            <div>
              <h3 className="text-base font-bold font-bangla text-clay-primary mb-3">কাস্টমার মতামত ({reviews.length})</h3>
              
              {/* Form to submit review */}
              <form onSubmit={handleReviewSubmit} className="bg-[#FFF8F2] border border-clay-secondary/15 rounded-2xl p-4 mb-4 shadow-inner">
                <h4 className="text-xs font-bold text-clay-secondary uppercase mb-2 font-bangla">আপনার মতামত দিন</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500 font-bangla">আপনার রেটিং:</span>
                  <div className="flex text-clay-accent">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <Star
                        key={stars}
                        className="w-4 h-4 cursor-pointer"
                        fill={stars <= newRating ? "currentColor" : "none"}
                        onClick={() => setNewRating(stars)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <textarea
                    rows={2}
                    placeholder="পণ্যটি সম্পর্কে আপনার বাস্তব অভিজ্ঞতা লিখুন..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full text-xs bg-[#FFF8F2] border border-clay-secondary/20 focus:border-clay-primary p-2.5 rounded-xl outline-none font-bangla"
                    required
                  ></textarea>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="self-end bg-clay-primary text-white text-[11px] font-bold py-1.5 px-4 rounded-lg hover:bg-clay-secondary transition-colors"
                  >
                    {submittingReview ? "প্রক্রিয়াধীন..." : "মতামত পাঠান"}
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-[#FFF8F2] p-3 rounded-2xl border border-clay-secondary/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-clay-text font-bangla capitalize">{rev.userName}</span>
                        <div className="flex text-clay-accent">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "fill-current" : "text-gray-200"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-clay-text/90 font-bangla">{rev.comment}</p>
                      
                      {/* Admin Reply */}
                      {rev.reply && (
                        <div className="mt-2 bg-clay-secondary/5 border-l-2 border-clay-primary p-2 rounded-r-xl text-[11px]">
                          <p className="font-bold text-clay-primary font-bangla">উর্মি মৃৎশিল্প টিম উত্তর:</p>
                          <p className="text-clay-text font-bangla">{rev.reply}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic text-center py-4 font-bangla">এই প্রডাক্টে এখনো কোনো রিভিউ দেয়া হয়নি।</p>
                )}
              </div>
            </div>
          </div>

          {/* Related products recommendation row */}
          {related.length > 0 && (
            <div className="border-t border-clay-secondary/10 mt-8 pt-6">
              <h3 className="text-base font-bold font-bangla text-clay-primary mb-4">অনুরূপ আরও মাটির সামগ্রী (Related Products)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {related.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onNavigateToRelated?.(p.id)}
                    className="bg-[#FFF8F2] p-3 rounded-2xl border border-clay-secondary/5 clay-shadow-sm hover:clay-shadow hover:-translate-y-1 transition-all cursor-pointer flex gap-3 items-center"
                  >
                    <img src={p.images[0]} alt={p.nameEnglish} className="w-12 h-12 object-cover rounded-xl border border-clay-secondary/5 shrink-0" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold font-bangla text-clay-text truncate">{p.nameBangla}</h4>
                      <p className="text-xs font-black text-clay-primary">৳{p.discountPrice || p.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
