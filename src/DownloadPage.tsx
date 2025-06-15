import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'

function DownloadPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ordersCount, setOrdersCount] = useState<number | null>(null);

  // جلب عدد الطلبات من السيرفر
  const fetchOrdersCount = async () => {
    try {
      const response = await fetch('/orders');
      const data = await response.json();
      setOrdersCount(data.count);
    } catch {
      setOrdersCount(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchOrdersCount();
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'GM262002') {
      setIsAuthenticated(true);
    } else {
      alert('كلمة السر غير صحيحة');
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
      alert('حدث خطأ في تحميل الطلبات');
      console.error('Error:', error);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('هل أنت متأكد أنك تريد مسح جميع الطلبات؟')) return;
    try {
      const response = await fetch('/api/reset-orders', { method: 'POST' });
      if (!response.ok) {
        throw new Error('فشل في إعادة الضبط');
      }
      setOrdersCount(0); // تصفير العداد بعد إعادة الضبط
      alert('تم مسح جميع الطلبات بنجاح');
    } catch (error) {
      alert('حدث خطأ أثناء إعادة الضبط');
      console.error('Error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">تسجيل الدخول</h1>
            <p className="text-gray-600">أدخل كلمة السر للوصول إلى صفحة تحميل الطلبات</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  كلمة السر
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  style={{ height: '3.5rem' }} // زيادة الارتفاع للضعف تقريباً
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                دخول
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تحميل الطلبات</h1>
          <p className="text-gray-600">قم بتحميل ملف الطلبات</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-2 text-center">عدد الطلبات</label>
            <div className="w-full flex items-center justify-center">
              <div className="bg-purple-50 border border-purple-200 rounded-xl px-6 py-4 text-2xl font-bold text-purple-700 shadow-sm min-w-[120px] text-center">
                {ordersCount === null ? '...' : ordersCount}
              </div>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl mb-4"
          >
            <span className="flex items-center justify-center">
              <FileText className="w-5 h-5 mr-2" />
              تحميل الطلبات
            </span>
          </button>
          <button
            onClick={handleReset}
            className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center justify-center">
              إعادة الضبط
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DownloadPage;