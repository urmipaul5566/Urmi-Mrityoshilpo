import React, { useRef } from "react";
import { X, Printer, Download, CheckCircle, Percent } from "lucide-react";
import { Order } from "../types";

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    if (printContent) {
      const windowPrint = window.open("", "", "width=900,height=650");
      windowPrint?.document.write(`
        <html>
          <head>
            <title>ইনভয়েস - উর্মি মৃৎশিল্প #${order.id}</title>
            <style>
              body { font-family: 'Hind Siliguri', 'Poppins', sans-serif; padding: 20px; background-color: #ffffff; color: #222222; }
              .text-center { text-align: center; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .border-b { border-bottom: 1px solid #e2e8f0; }
              .pb-4 { padding-bottom: 16px; }
              .mt-4 { margin-top: 16px; }
              .w-full { width: 100%; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 13px; }
              th { background-color: #8B4513; color: #ffffff; }
              .font-bold { font-weight: bold; }
              .text-right { text-align: right; }
              .seal-box { border: 2px dashed #8B4513; color: #8B4513; width: 120px; padding: 10px; text-align: center; border-radius: 8px; margin-top: 40px; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      windowPrint?.document.close();
      windowPrint?.focus();
      setTimeout(() => {
        windowPrint?.print();
        windowPrint?.close();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFF8F2] w-full max-w-3xl rounded-3xl clay-shadow-lg overflow-hidden border border-clay-secondary/15">
        
        {/* Modal Toolbar Header */}
        <div className="bg-clay-primary text-[#FFF8F2] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-clay-accent" />
            <h3 className="text-base font-bold font-bangla">অর্ডার ইনভয়েস রশিদ (Order Invoice Receipt)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 text-[#FFF8F2] p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="প্রিন্ট করুন / পিডিএফ ডাউনলোড"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট বা পিডিএফ (Print/PDF)
            </button>
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto" ref={printAreaRef}>
          <div className="bg-white p-6 rounded-2xl border border-clay-secondary/10 shadow-sm text-[#222222]">
            
            {/* Invoice Top Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-[#8B4513] text-white flex items-center justify-center font-bold text-base">উ</div>
                  <h1 className="text-lg font-black font-bangla text-[#8B4513] tracking-wide">উর্মি মৃৎশিল্প</h1>
                </div>
                <p className="text-xs text-gray-500 font-bangla leading-relaxed">
                  জয়পুরহাট, নতুনহাট গরুহাটি, জয়পুরহাট সদর।<br />
                  ফোন: ০১৭৫৬৫১১৪৫৫
                </p>
              </div>
              
              <div className="text-left sm:text-right">
                <h2 className="text-xl font-black font-sans text-gray-800 uppercase tracking-widest">INVOICE</h2>
                <p className="text-xs font-mono text-gray-500">মেমো নং: <span className="font-bold text-[#8B4513]">{order.id}</span></p>
                <p className="text-xs text-gray-500 font-bangla">তারিখ: {new Date(order.orderDate).toLocaleDateString("bn-BD")}</p>
              </div>
            </div>

            {/* Bill To & Order tracking meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100 pb-5 mb-5 text-xs font-bangla">
              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-wide mb-1.5 text-[10px]">ক্রেতার বিবরণ (Bill To)</h4>
                <p className="font-bold text-sm text-gray-800 capitalize mb-1">{order.customerName}</p>
                <p className="text-gray-600 mb-0.5">মোবাইল: {order.phone}</p>
                {order.email && <p className="text-gray-600 mb-0.5">ইমেইল: {order.email}</p>}
                <p className="text-gray-600 leading-relaxed">
                  ঠিকানা: {order.shippingAddress}, {order.district}, {order.division}
                </p>
              </div>

              <div className="sm:text-right flex flex-col sm:items-end justify-between">
                <div>
                  <h4 className="font-bold text-gray-500 uppercase tracking-wide mb-1.5 text-[10px]">ডেলিভারি তথ্য</h4>
                  <p className="text-gray-600 mb-1">পদ্ধতি: <span className="font-bold">{order.paymentMethod === "cod" ? "ক্যাশ অন ডেলিভারি (COD)" : "মোবাইল ব্যাংকিং (bKash/Nagad)"}</span></p>
                  <p className="text-gray-600 mb-1">পেমেন্ট স্ট্যাটাস: <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${order.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{order.paymentStatus === "paid" ? "পরিশোধিত (PAID)" : "বাকি (PENDING)"}</span></p>
                  <p className="text-gray-600 mb-0.5">ট্র্যাকিং নম্বর: <span className="font-bold font-mono text-gray-800">{order.trackingNumber}</span></p>
                </div>

                {/* Simulated Barcode */}
                <div className="mt-3 inline-flex flex-col items-center">
                  <div className="h-6 w-32 bg-[repeating-linear-gradient(90deg,#222,#222_2px,#fff_2px,#fff_5px)]"></div>
                  <span className="text-[9px] font-mono tracking-widest text-gray-400 mt-1">{order.trackingNumber}</span>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-xs font-bangla border-collapse">
                <thead>
                  <tr className="bg-[#8B4513] text-white">
                    <th className="py-2.5 px-3 rounded-l-lg text-left">ক্রমিক</th>
                    <th className="py-2.5 px-3 text-left">পণ্যের নাম (Product Name)</th>
                    <th className="py-2.5 px-3 text-center">মূল্য</th>
                    <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                    <th className="py-2.5 px-3 rounded-r-lg text-right">মোট টাকা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 text-gray-500">{index + 1}</td>
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-gray-800">{item.nameBangla}</p>
                        <span className="text-[10px] text-gray-400 font-sans italic">{item.nameEnglish}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">৳{item.price}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-800">৳{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Totals */}
            <div className="flex justify-end font-bangla">
              <div className="w-full sm:w-72 space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>সাবটোটাল (Subtotal):</span>
                  <span className="font-bold">৳{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ (Shipping):</span>
                  <span className="font-bold">৳{order.shippingCharge}</span>
                </div>
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      কুপন ছাড় (Discount):
                    </span>
                    <span className="font-bold">- ৳{order.couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-2 text-sm text-[#8B4513]">
                  <span className="font-black">সর্বমোট মূল্য (Total Payable):</span>
                  <span className="font-black text-base">৳{order.total}</span>
                </div>
              </div>
            </div>

            {/* Seals and Footer note */}
            <div className="flex flex-col sm:flex-row justify-between items-end mt-12 border-t border-gray-100 pt-6 font-bangla text-xs">
              <div className="text-gray-400">
                <p className="italic mb-1">উর্মি মৃৎশিল্প থেকে কেনাকাটার জন্য আপনাকে আন্তরিক ধন্যবাদ!</p>
                <p className="text-[10px]">রশিদের কপিটি যত্ন সহকারে সংরক্ষণ করুন।</p>
              </div>
              
              {/* Authorized signature box and seal */}
              <div className="flex flex-col items-center">
                <div className="border-2 border-dashed border-[#8B4513] text-[#8B4513] text-[9px] font-bold px-4 py-2.5 rounded-xl uppercase tracking-wider rotate-[-5deg] mt-3">
                  উর্মি মৃৎশিল্প<br />
                  <span className="text-[7px]">সাভার, ঢাকা</span>
                </div>
                <span className="text-[10px] text-gray-400 mt-2">অফিসিয়াল সিল ও স্বাক্ষর</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
