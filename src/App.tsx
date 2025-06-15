import React, { useState } from 'react';
import { ShoppingCart, User, Phone, FileText, MapPin, Building2 } from 'lucide-react';

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
        alert('تم إضافة الطلب بنجاح');
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
        alert('حدث خطأ أثناء إضافة الطلب');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ أثناء إضافة الطلب');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/download');
      if (!response.ok) {
        throw new Error('فشل تحميل الملف');
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
      alert('حدث خطأ أثناء تحميل الملف');
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

        {/* Footer */}
        <footer className="mt-16 flex flex-col items-center justify-center text-gray-500 text-sm select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-700">Elliaa</span>
            <span className="text-gray-400">|</span>
            <span className="mx-1 animate-pulse text-red-500 text-xl">❤</span>
            <span>Made with</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">All rights reserved © {new Date().getFullYear()}</div>
        </footer>
      </div>
    </div>
  );
}

export default App;