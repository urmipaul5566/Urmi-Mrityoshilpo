import { User, Product, Order, Review, Coupon, SliderItem, BannerItem } from "../types";

export const BACKEND_URL = "https://urmi-clay-studio.onrender.com";

export const getApiUrl = (endpoint: string): string => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // If we're on localhost or running on the backend host, use relative URL.
    // Otherwise (e.g. Netlify, custom domains), route to Render.com backend.
    if (
      hostname !== "localhost" &&
      !hostname.includes("127.0.0.1") &&
      !hostname.includes("onrender.com") &&
      !hostname.includes("run.app")
    ) {
      return `${BACKEND_URL}${endpoint}`;
    }
  }
  return endpoint;
};

export const formatImageUrl = (url: string | undefined): string => {
  if (!url) return "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&auto=format&fit=crop&q=80";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return getApiUrl(cleanUrl);
  }
  return url;
};

const formatOrderProductImage = (order: any) => {
  if (order && Array.isArray(order.items)) {
    order.items = order.items.map((item: any) => {
      if (item && item.product) {
        return {
          ...item,
          product: {
            ...item.product,
            images: item.product.images ? item.product.images.map(formatImageUrl) : []
          }
        };
      }
      return item;
    });
  }
  return order;
};

const originalFetch = typeof window !== "undefined" ? window.fetch : null;
const fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === "string" ? input : input.toString();
  if (originalFetch) {
    return originalFetch(getApiUrl(url), init);
  }
  return Promise.reject(new Error("Fetch is not available in this environment"));
};

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
      const data = await res.json();
      if (data && Array.isArray(data.products)) {
        data.products = data.products.map((p: any) => ({
          ...p,
          images: p.images ? p.images.map(formatImageUrl) : []
        }));
      }
      return data as {
        products: Product[];
        total: number;
        pages: number;
        currentPage: number;
      };
    },

    get: async (id: string) => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("পণ্যটি পাওয়া যায়নি");
      const p = await res.json();
      if (p) {
        p.images = p.images ? p.images.map(formatImageUrl) : [];
      }
      return p as Product;
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
      const p = await res.json();
      if (p) {
        p.images = p.images ? p.images.map(formatImageUrl) : [];
      }
      return p as Product;
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
      const p = await res.json();
      if (p) {
        p.images = p.images ? p.images.map(formatImageUrl) : [];
      }
      return p as Product;
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
      const order = await res.json();
      return formatOrderProductImage(order) as Order;
    },

    track: async (trackingNumber: string) => {
      const res = await fetch(`/api/orders/track/${trackingNumber}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "অর্ডারটি পাওয়া যায়নি");
      }
      const order = await res.json();
      return formatOrderProductImage(order) as Order;
    },

    myOrders: async () => {
      const res = await fetch("/api/orders/my-orders", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("আমার অর্ডারসমূহ লোড করা যায়নি");
      const orders = await res.json();
      if (Array.isArray(orders)) {
        return orders.map(formatOrderProductImage) as Order[];
      }
      return orders as Order[];
    },

    listAll: async () => {
      const res = await fetch("/api/orders", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("অর্ডারসমূহ লোড করা যায়নি");
      const orders = await res.json();
      if (Array.isArray(orders)) {
        return orders.map(formatOrderProductImage) as Order[];
      }
      return orders as Order[];
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
      const order = await res.json();
      return formatOrderProductImage(order) as Order;
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
      const data = await res.json();
      if (data) {
        if (Array.isArray(data.sliders)) {
          data.sliders = data.sliders.map((s: any) => ({
            ...s,
            image: formatImageUrl(s.image)
          }));
        }
        if (Array.isArray(data.banners)) {
          data.banners = data.banners.map((b: any) => ({
            ...b,
            image: formatImageUrl(b.image)
          }));
        }
      }
      return data as { sliders: SliderItem[]; banners: BannerItem[] };
    },

    updateSliders: async (sliders: SliderItem[]) => {
      const res = await fetch("/api/home/sliders", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(sliders)
      });
      if (!res.ok) throw new Error("স্লাইডার আপডেট করা যায়নি");
      const list = await res.json();
      if (Array.isArray(list)) {
        return list.map((s: any) => ({
          ...s,
          image: formatImageUrl(s.image)
        })) as SliderItem[];
      }
      return list as SliderItem[];
    },

    updateBanners: async (banners: BannerItem[]) => {
      const res = await fetch("/api/home/banners", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(banners)
      });
      if (!res.ok) throw new Error("ব্যানার আপডেট করা যায়নি");
      const list = await res.json();
      if (Array.isArray(list)) {
        return list.map((b: any) => ({
          ...b,
          image: formatImageUrl(b.image)
        })) as BannerItem[];
      }
      return list as BannerItem[];
    }
  },

  // Admin Stats
  admin: {
    getStats: async () => {
      const res = await fetch("/api/admin/stats", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("ড্যাশবোর্ড পরিসংখ্যান লোড করা যায়নি");
      const data = await res.json();
      if (data && Array.isArray(data.recentOrders)) {
        data.recentOrders = data.recentOrders.map(formatOrderProductImage);
      }
      return data as {
        summary: {
          totalOrders: number;
          totalSales: number;
          activeProducts: number;
          totalCustomers: number;
        };
        recentOrders: Order[];
        categoryStats: { name: string; value: number }[];
        monthlySales: { month: string; sales: number; orders: number }[];
      };
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
    },
    getDatabaseStatus: async () => {
      const res = await fetch("/api/admin/database/status", {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("ডাটাবেজ স্ট্যাটাস লোড করা যায়নি");
      return res.json() as Promise<{
        connected: boolean;
        provider: string;
        projectId: string;
        databaseId: string;
        syncStatus: string;
        collections: Record<string, number>;
        totalRecords: number;
        lastSynced: string;
        alternativeOptions: { name: string; type: string; status: string; desc: string }[];
      }>;
    },
    syncDatabase: async () => {
      const res = await fetch("/api/admin/database/sync", {
        method: "POST",
        headers: getHeaders()
      });
      if (!res.ok) {
        let errMsg = `ডাটাবেজ সিঙ্ক করা যায়নি (Status: ${res.status})`;
        if (res.status === 404) {
          errMsg = "Render.com-এ নতুন কোড আপডেট হয়নি (404 Not Found)। দয়া করে Render ড্যাশবোর্ডে গিয়ে 'Manual Deploy' > 'Clear build cache & deploy' করুন।";
        } else {
          const err = await res.json().catch(() => ({}));
          if (err.message) errMsg = err.message;
        }
        throw new Error(errMsg);
      }
      return res.json();
    },
    restoreDefaults: async () => {
      const res = await fetch("/api/admin/database/restore-defaults", {
        method: "POST",
        headers: getHeaders()
      });
      if (!res.ok) {
        let errMsg = `ডাটাবেজ রিস্টোর করা যায়নি (Status: ${res.status})`;
        if (res.status === 404) {
          errMsg = "Render.com-এ নতুন আপডেটটি পাওয়া যায়নি (404 Not Found)। দয়া করে Render-এ 'Clear build cache & deploy' করুন।";
        } else {
          const err = await res.json().catch(() => ({}));
          if (err.message) errMsg = err.message;
        }
        throw new Error(errMsg);
      }
      return res.json();
    },
    restoreBackup: async (backupData: any) => {
      const res = await fetch("/api/admin/database/restore", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ backupData })
      });
      if (!res.ok) {
        let errMsg = `ব্যাকআপ রিস্টোর করা যায়নি (Status: ${res.status})`;
        if (res.status === 404) {
          errMsg = "Render.com-এ নতুন আপডেটটি পাওয়া যায়নি (404 Not Found)। দয়া করে Render-এ 'Clear build cache & deploy' করুন।";
        } else {
          const err = await res.json().catch(() => ({}));
          if (err.message) errMsg = err.message;
        }
        throw new Error(errMsg);
      }
      return res.json();
    }
  }
};
