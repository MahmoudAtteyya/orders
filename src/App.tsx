import React, { useState } from 'react';
import { ShoppingCart, User, Phone, FileText, MapPin, Building2 } from 'lucide-react';

// Toast component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  return (
    <div className={`fixed top-8 left-1/2 z-50 -translate-x-1/2 px-6 py-4 rounded-xl shadow-lg text-white text-lg font-semibold flex items-center gap-3 transition-all animate-fade-in ${
      type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-700' : type === 'error' ? 'bg-gradient-to-r from-rose-700 to-rose-900' : 'bg-gradient-to-r from-purple-500 to-purple-700'
    }`}>
      {type === 'success' && <span>✔️</span>}
      {type === 'error' && <span>⚠️</span>}
      {type === 'info' && <span>ℹ️</span>}
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white text-xl">×</button>
    </div>
  );
}

function App() {
  const [formData, setFormData] = useState({
    Customer_Name: '',
    Mobile_No: '',
    Description: '',
    Street: '',
    City: '',
    Alternative_Contact: '',
    totalWeight: 1500 // Hidden field with default value
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const cities = [
    { value: "CAIRO", label: "القاهرة" },
    { value: "GIZA", label: "الجيزة" },
    { value: "ALEXANDRIA", label: "الإسكندرية" },
    { value: "BEHIRA", label: "البحيرة" },
    { value: "QALIUBIA", label: "القليوبية" },
    { value: "GHARBIA", label: "الغربية" },
    { value: "MONOUFIA", label: "المنوفية" },
    { value: "DOMITTA", label: "دمياط" },
    { value: "DAKAHLIA", label: "الدقهلية" },
    { value: "KAFR EL SHEIKH", label: "كفر الشيخ" },
    { value: "MARSA MATROUH", label: "مرسى مطروح" },
    { value: "ISMAILIA", label: "الإسماعيلية" },
    { value: "SUEZ", label: "السويس" },
    { value: "PORT SAID", label: "بورسعيد" },
    { value: "SHARKIA", label: "الشرقية" },
    { value: "FAYOUM", label: "الفيوم" },
    { value: "BANI SWEIF", label: "بني سويف" },
    { value: "MENIA", label: "المنيا" },
    { value: "ASSIUT", label: "أسيوط" },
    { value: "SOUHAGE", label: "سوهاج" },
    { value: "QENA", label: "قنا" },
    { value: "ASWAN", label: "أسوان" },
    { value: "LOUXOR", label: "الأقصر" },
    { value: "RED SEA", label: "البحر الأحمر" },
    { value: "NEW VALLEY", label: "الوادي الجديد" },
    { value: "NOURTH SINAI", label: "شمال سيناء" },
    { value: "SOUTH SINAI", label: "جنوب سيناء" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-prepend Arabic text for order description
    if (name === 'Description') {
      const prefix = 'أدوات مكتبية :';
      let newValue = value;
      
      if (value && !value.startsWith(prefix)) {
        newValue = prefix + ' ' + value;
      } else if (!value) {
        newValue = '';
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderData = {
        ...formData,
        Item_Special_Notes: `يسلم في محل الإقامة ودون الإطلاع على الرقم القومي - رقم آخر للتواصل ${formData.Alternative_Contact} - في حالة عدم رد المرسل إليه يرجى التواصل مع الراسل`,
        Total_Weight: formData.totalWeight
      };

      const response = await fetch('/api/add-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        showToast('تم إضافة الطلب بنجاح', 'success');
        setFormData({
          Customer_Name: '',
          Mobile_No: '',
          Description: '',
          Street: '',
          City: '',
          Alternative_Contact: '',
          totalWeight: 1500
        });
      } else {
        showToast('حدث خطأ أثناء إضافة الطلب', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('حدث خطأ أثناء إضافة الطلب', 'error');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/download');
      if (!response.ok) {
        showToast('لا يوجد طلبات في الوقت الحالي', 'info');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Orders.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      showToast('لا يوجد طلبات في الوقت الحالي', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <ShoppingCart className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">طلب جديد</h1>
          <p className="text-gray-600">املأ البيانات التالية لإنشاء طلب جديد</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FileText className="w-5 h-5 mr-3" />
              تفاصيل الطلب
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Customer Name */}
            <div className="group">
              <label htmlFor="Customer_Name" className="block text-sm font-semibold text-gray-700 mb-2">
                اسم العميل
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                  type="text"
                  id="Customer_Name"
                  name="Customer_Name"
                  value={formData.Customer_Name}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="أدخل اسم العميل"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="group">
              <label htmlFor="Mobile_No" className="block text-sm font-semibold text-gray-700 mb-2">
                رقم الهاتف المحمول
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                  type="tel"
                  id="Mobile_No"
                  name="Mobile_No"
                  value={formData.Mobile_No}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="01xxxxxxxxx"
                  required
                />
              </div>
            </div>

            {/* Alternative Contact */}
            <div className="group">
              <label htmlFor="Alternative_Contact" className="block text-sm font-semibold text-gray-700 mb-2">
                رقم آخر للتواصل
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                  type="tel"
                  id="Alternative_Contact"
                  name="Alternative_Contact"
                  value={formData.Alternative_Contact}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="رقم آخر للتواصل"
                  required
                />
              </div>
            </div>

            {/* Order Description */}
            <div className="group">
              <label htmlFor="Description" className="block text-sm font-semibold text-gray-700 mb-2">
                وصف الطلب
              </label>
              <div className="relative">
                <textarea
                  id="Description"
                  name="Description"
                  rows={4}
                  value={formData.Description}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
                  placeholder="أدخل تفاصيل الطلب..."
                  required
                />
                <div className="absolute top-3 left-3">
                  <FileText className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                سيتم إضافة "أدوات مكتبية :" تلقائياً في بداية الوصف
              </p>
            </div>

            {/* Address Details */}
            <div className="group">
              <label htmlFor="Street" className="block text-sm font-semibold text-gray-700 mb-2">
                تفاصيل العنوان
              </label>
              <div className="relative">
                <textarea
                  id="Street"
                  name="Street"
                  rows={3}
                  value={formData.Street}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
                  placeholder="أدخل العنوان التفصيلي..."
                  required
                />
                <div className="absolute top-3 left-3">
                  <MapPin className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
              </div>
            </div>

            {/* City */}
            <div className="group">
              <label htmlFor="City" className="block text-sm font-semibold text-gray-700 mb-2">
                المحافظة
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <select
                  id="City"
                  name="City"
                  value={formData.City}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white appearance-none cursor-pointer"
                  required
                >
                  <option value="">اختر المحافظة</option>
                  {cities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  إضافة الطلب
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Toast Notification */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Footer */}
        <footer className="mt-16 flex flex-col items-center justify-center text-gray-500 text-sm select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-700">Elliaa</span>
            <span className="text-gray-400">|</span>
            {/* Animated SVG Heart - burgundy color, improved shape & animation */}
            <span className="inline-block">
              <svg
                className="w-7 h-7 animate-heartbeat drop-shadow-lg"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <radialGradient id="heartGradient2" cx="50%" cy="50%" r="80%">
                    <stop offset="0%" stopColor="#a8324a" />
                    <stop offset="100%" stopColor="#7b1e2e" />
                  </radialGradient>
                </defs>
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="url(#heartGradient2)"
                  stroke="#7b1e2e"
                  strokeWidth="1"
                />
              </svg>
            </span>
            <span>Made with</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">All rights reserved © {new Date().getFullYear()}</div>
        </footer>
        <style>{`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px #a8324a44); }
            10% { transform: scale(1.18); filter: drop-shadow(0 0 16px #a8324a88); }
            20% { transform: scale(0.95); }
            30% { transform: scale(1.12); }
            50% { transform: scale(0.97); }
            70% { transform: scale(1.15); }
            80% { transform: scale(0.98); }
          }
          .animate-heartbeat {
            animation: heartbeat 1.3s infinite cubic-bezier(.4,0,.6,1);
            transition: filter 0.2s;
          }
          .animate-fade-in {
            animation: fade-in 0.5s;
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default App;