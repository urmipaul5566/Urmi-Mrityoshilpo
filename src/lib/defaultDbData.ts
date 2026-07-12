// Guaranteed initial Bangladeshi clay store defaults (Cleaned of preloaded mockup items)
export const DEFAULT_INITIAL_DATABASE = {
  "users": [
    {
      "createdAt": "2026-06-25T20:00:00.000Z",
      "name": "gopal",
      "district": "Dhaka",
      "mustChangePassword": true,
      "id": "admin-gopal",
      "address": "Savar, Dhaka",
      "phone": "01756511455",
      "role": "admin",
      "division": "Dhaka",
      "email": "gopal@urmiclay.com",
      "passwordHash": "e10adc3949ba59abbe56e057f20f883e"
    },
    {
      "createdAt": "2026-06-25T20:10:00.000Z",
      "name": "Arif Rahman",
      "mustChangePassword": false,
      "district": "Dhaka",
      "address": "House 12, Road 5, Dhanmondi",
      "id": "customer-demo",
      "passwordHash": "e10adc3949ba59abbe56e057f20f883e",
      "division": "Dhaka",
      "role": "customer",
      "phone": "01812345678",
      "email": "arif@gmail.com"
    }
  ],
  "products": [],
  "reviews": [],
  "orders": [],
  "coupons": [
    {
      "discountType": "percentage",
      "discountValue": 10,
      "expiryDate": "2026-12-31T23:59:59.000Z",
      "isActive": true,
      "minOrderAmount": 500,
      "usageCount": 5,
      "code": "CLAY10",
      "id": "cp-1"
    }
  ],
  "sliders": [
    {
      "titleEnglish": "Traditional Touch of Pure Clay",
      "image": "/uploads/urmi_clay_logo_1783389748375.jpg",
      "id": "sl-1",
      "subtitle": "মাটির পাত্রে স্বাস্থ্যকর জীবনযাপন, প্রতিটি কোণায় দেশীয় কৃষ্টির ছোঁয়া।",
      "link": "/shop",
      "titleBangla": "খাঁটি মাটির ঐতিহ্যবাহী স্পর্শ"
    },
    {
      "subtitle": "আপনার ড্রইং রুম ও বাড়ীকে সাজিয়ে তুলুন মাটির অপূর্ব শিল্পকর্মে।",
      "link": "/shop?category=Clay%20Vase",
      "titleBangla": "হস্তশিল্প খোদাই করা নান্দনিক শো-পিস",
      "titleEnglish": "Aesthetic Handcrafted Pottery",
      "image": "/uploads/clay_tableware_1783389427826.jpg",
      "id": "sl-2"
    }
  ],
  "banners": []
};
