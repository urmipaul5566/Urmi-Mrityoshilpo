import { User, Product, Order, Review, Coupon, SliderItem, BannerItem } from "../types";

const getHeaders = () => {
  const token = localStorage.getItem("urmi_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export const api = {
  // Authentication
  auth: {
    login: async (usernameOrEmail: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password })
      });
      if (!res.ok) {
        let errMsg = "লগইন ব্যর্থ হয়েছে";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch (e) {
          errMsg = `সার্ভারে সমস্যা হয়েছে (Status: ${res.status})`;
        }
        throw new Error(errMsg);
      }
      const data = await res.json();
      if (data && data.token) {
        localStorage.setItem("urmi_token", data.token);
      }
      return data as { token: string; user: User };
    },

    register: async (data: any) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        let errMsg = "নিবন্ধন ব্যর্থ হয়েছে";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch (e) {
          errMsg = `সার্ভারে সমস্যা হয়েছে (Status: ${res.status})`;
        }
        throw new Error(errMsg);
      }
      const responseData = await res.json();
      if (responseData && responseData.token) {
        localStorage.setItem("urmi_token", responseData.token);
      }
      return responseData as { token: string; user: User };
    },

    me: async () => {
      const res = await fetch("/api/auth/me", {
        headers: getHeaders()
      });
      if (!res.ok) {
        throw new Error("সেশন মেয়াদোত্তীর্ণ");
      }
      return res.json() as Promise<User>;
    },

    logout: async () => {
      localStorage.removeItem("urmi_token");
    },

    changePassword: async (currentPassword?: string, newPassword?: string) => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে");
      }
      return res.json();
    },

    updateProfile: async (profileData: Partial<User>) => {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "প্রোফাইল আপডেট ব্যর্থ হয়েছে");
      }
      return res.json() as Promise<User>;
    }
  },

  // Products
  products: {
    list: async (filters: {
      category?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
      page?: number;
      limit?: number;
    }) => {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.minPrice) params.append("minPrice", String(filters.minPrice));
      if (filters.maxPrice) params.append("maxPrice", String(filters.maxPrice));
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("পণ্য তালিকা লোড করা যায়নি");
      return res.json() as Promise<{
        products: Product[];
        total: number;
        pages: number;
        currentPage: number;
      }>;
    },

    get: async (id: string) => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("পণ্যটি পাওয়া যায়নি");
      return res.json() as Promise<Product>;
    },

    create: async (data: any) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "পণ্য যোগ করা যায়নি");
      }
      return res.json() as Promise<Product>;
    },

    update: async (id: string, data: any) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "পণ্য এডিট করা যায়নি");
      }
      return res.json() as Promise<Product>;
    },

    delete: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "পণ্য মুছা যায়নি");
      }
      return res.json();
    }
  },

  // Reviews
  reviews: {
    get: async (productId: string) => {
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (!res.ok) throw new Error("রিভিউ লোড করা যায়নি");
      return res.json() as Promise<Review[]>;
    },

    create: async (productId: string, rating: number, comment: string) => {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ rating, comment })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "রিভিউ যোগ করা যায়নি");
      }
      return res.json() as Promise<Review>;
    },

    reply: async (reviewId: string, reply: string) => {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ reply })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "রিভিউ এর উত্তর দেওয়া যায়নি");
      }
      return res.json() as Promise<Review>;
    }
  },

  // Orders
  orders: {
    create: async (orderData: any) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "অর্ডারটি সম্পন্ন করা যায়নি");
      }
      return res.json() as Promise<Order>;
    },

    track: async (trackingNumber: string) => {
      const res = await fetch(`/api/orders/track/${trackingNumber}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "অর্ডারটি পাওয়া যায়নি");
      }
      return res.json() as Promise<Order>;
    },

    myOrders: async () => {
      const res = await fetch("/api/orders/my-orders", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("আমার অর্ডারসমূহ লোড করা যায়নি");
      return res.json() as Promise<Order[]>;
    },

    listAll: async () => {
      const res = await fetch("/api/orders", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("অর্ডারসমূহ লোড করা যায়নি");
      return res.json() as Promise<Order[]>;
    },

    updateStatus: async (id: string, orderStatus?: string, paymentStatus?: string) => {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ orderStatus, paymentStatus })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "অর্ডার স্ট্যাটাস আপডেট করা যায়নি");
      }
      return res.json() as Promise<Order>;
    }
  },

  // Coupons
  coupons: {
    validate: async (code: string, orderAmount: number = 0) => {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderAmount })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "কুপন কোডটি সঠিক নয়");
      }
      return res.json() as Promise<Coupon>;
    },

    listAll: async () => {
      const res = await fetch("/api/coupons", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("কুপনসমূহ লোড করা যায়নি");
      return res.json() as Promise<Coupon[]>;
    },

    create: async (data: any) => {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("কুপন যোগ করা যায়নি");
      return res.json() as Promise<Coupon>;
    },

    update: async (id: string, data: any) => {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("কুপন এডিট করা যায়নি");
      return res.json() as Promise<Coupon>;
    },

    delete: async (id: string) => {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("কুপন মুছা যায়নি");
      return res.json();
    }
  },

  // Slider and Banners
  home: {
    get: async () => {
      const res = await fetch("/api/home");
      if (!res.ok) throw new Error("হোমপেইজ ডাটা লোড করা যায়নি");
      return res.json() as Promise<{ sliders: SliderItem[]; banners: BannerItem[] }>;
    },

    updateSliders: async (sliders: SliderItem[]) => {
      const res = await fetch("/api/home/sliders", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(sliders)
      });
      if (!res.ok) throw new Error("স্লাইডার আপডেট করা যায়নি");
      return res.json() as Promise<SliderItem[]>;
    },

    updateBanners: async (banners: BannerItem[]) => {
      const res = await fetch("/api/home/banners", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(banners)
      });
      if (!res.ok) throw new Error("ব্যানার আপডেট করা যায়নি");
      return res.json() as Promise<BannerItem[]>;
    }
  },

  // Admin Stats
  admin: {
    getStats: async () => {
      const res = await fetch("/api/admin/stats", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("ড্যাশবোর্ড পরিসংখ্যান লোড করা যায়নি");
      return res.json() as Promise<{
        summary: {
          totalOrders: number;
          totalSales: number;
          activeProducts: number;
          totalCustomers: number;
        };
        recentOrders: Order[];
        categoryStats: { name: string; value: number }[];
        monthlySales: { month: string; sales: number; orders: number }[];
      }>;
    },
    uploadFile: async (fileName: string, base64Data: string) => {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ fileName, base64Data })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "ফাইল আপলোড করতে সমস্যা হয়েছে");
      }
      return res.json() as Promise<{ url: string }>;
    }
  }
};
