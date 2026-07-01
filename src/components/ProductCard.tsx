import React from "react";
import { Heart, ShoppingCart, Eye, Star, Check, AlertCircle, Edit, Trash2 } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: any;
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onQuickView: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  isAdmin?: boolean;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
  onQuickView,
  isWishlisted,
  onToggleWishlist,
  isAdmin,
  onEditProduct,
  onDeleteProduct
}: ProductCardProps) {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - (product.discountPrice || product.price)) / product.price) * 100) 
    : 0;

  return (
    <div className="group relative bg-[#FFF8F2] rounded-3xl border border-clay-secondary/10 overflow-hidden clay-shadow-sm hover:clay-shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
      {/* Product Badges & Image */}
      <div className="relative aspect-square overflow-hidden bg-white/20">
        
        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3.5 left-3.5 bg-clay-accent text-clay-text text-[10px] font-bold px-2.5 py-1 rounded-full z-10 shadow-sm animate-pulse-slow">
            {discountPercent}% ছাড় (OFF)
          </span>
        )}

        {/* Stock Status Badge */}
        <span className={`absolute top-3.5 right-3.5 text-[10px] font-bold px-2.5 py-1 rounded-full z-10 shadow-sm ${product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {product.stock > 0 ? "স্টকে আছে" : "স্টক শেষ"}
        </span>

        {/* Product Image with Hover Zoom */}
        <img
          src={product.images[0]}
          alt={product.nameEnglish}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Quick View Button hover overlay */}
        <div className="absolute inset-0 bg-clay-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onQuickView(product)}
            className="bg-[#FFF8F2] hover:bg-clay-primary hover:text-white text-clay-primary p-3 rounded-full shadow-lg transition-all scale-75 group-hover:scale-100"
            title="চটজলদি দেখুন (Quick View)"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Floating Trigger */}
        <button
          onClick={() => onToggleWishlist(product)}
          className={`absolute bottom-3.5 right-3.5 p-2 rounded-full shadow-md z-10 transition-all hover:scale-110 active:scale-95 ${isWishlisted ? "bg-red-500 text-white" : "bg-[#FFF8F2] text-clay-secondary hover:text-red-500"}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`} />
        </button>

        {/* Admin Quick Action Controls */}
        {isAdmin && (
          <div className="absolute top-14 left-3.5 flex flex-col gap-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditProduct?.(product);
              }}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
              title="পণ্য এডিট করুন"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteProduct?.(product.id);
              }}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
              title="পণ্য ডিলিট করুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="mb-3">
          {/* Category */}
          <span className="text-[10px] uppercase font-bold text-clay-secondary/80 tracking-wider">
            {product.category}
          </span>

          {/* Product Names */}
          <h4 className="text-sm md:text-base font-bold font-bangla text-clay-text mt-1 group-hover:text-clay-primary line-clamp-1 transition-colors">
            {product.nameBangla}
          </h4>
          <p className="text-[11px] text-gray-500 line-clamp-1 italic font-sans">
            {product.nameEnglish}
          </p>

          {/* Rating and Stock volume */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-clay-accent">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold text-clay-text ml-0.5">{product.rating}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-[10px] text-gray-500">({product.reviewsCount} রিভিউ)</span>
          </div>
        </div>

        <div>
          {/* Price details */}
          <div className="flex items-baseline gap-2 mb-3.5">
            {hasDiscount ? (
              <>
                <span className="text-base md:text-lg font-bold text-clay-primary">৳{product.discountPrice}</span>
                <span className="text-xs text-gray-400 line-through">৳{product.price}</span>
              </>
            ) : (
              <span className="text-base md:text-lg font-bold text-clay-primary">৳{product.price}</span>
            )}
          </div>

          {/* Quick action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddToCart(product, 1)}
              disabled={product.stock <= 0}
              className="flex items-center justify-center gap-1 border border-clay-primary text-clay-primary hover:bg-clay-primary hover:text-white font-bangla text-xs font-semibold py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              কার্ট
            </button>
            <button
              onClick={() => onBuyNow(product)}
              disabled={product.stock <= 0}
              className="bg-clay-primary hover:bg-clay-secondary text-white font-bangla text-xs font-bold py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-clay-primary/10"
            >
              কিনুন (Buy)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
