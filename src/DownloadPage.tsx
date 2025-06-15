import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'

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

function DownloadPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ordersCount, setOrdersCount] = useState<number | null>(null);
  const [stats, setStats] = useState({ dailyCount: 0, monthlyCount: 0, yearlyCount: 0, totalCount: 0 });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

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

  // جلب الإحصائيات
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/order-stats');
      const data = await response.json();
      setStats(data);
    } catch {
      setStats({ dailyCount: 0, monthlyCount: 0, yearlyCount: 0, totalCount: 0 });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrdersCount();
      fetchStats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    document.title = 'تحميل الطلبات - إيلياء';
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'GM262002') {
      setIsAuthenticated(true);
    } else {
      showToast('كلمة السر غير صحيحة', 'error');
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
      showToast('لا يوجد طلبات في الوقت الحالي', 'info');
      console.error('Error:', error);
    }
  };

  const handleReset = async () => {
    showToast('هل أنت متأكد أنك تريد مسح جميع الطلبات؟', 'info');
    setTimeout(async () => {
      if (!window.confirm('هل أنت متأكد أنك تريد مسح جميع الطلبات؟')) return;
      try {
        const response = await fetch('/api/reset-orders', { method: 'POST' });
        if (!response.ok) {
          throw new Error('فشل في إعادة الضبط');
        }
        await fetchOrdersCount(); // تحديث العدد من السيرفر
        await fetchStats(); // تحديث الإحصائيات من السيرفر
        showToast('تم مسح جميع الطلبات بنجاح', 'success');
      } catch (error) {
        showToast('حدث خطأ أثناء إعادة الضبط', 'error');
        console.error('Error:', error);
      }
    }, 500);
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

        {/* إحصائيات الطلبات */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow text-center">
            <div className="text-sm text-gray-500 mb-2">طلبات اليوم</div>
            <div className="text-3xl font-bold text-purple-700">{stats.dailyCount}</div>
          </div>
          <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow text-center">
            <div className="text-sm text-gray-500 mb-2">طلبات الشهر</div>
            <div className="text-3xl font-bold text-purple-700">{stats.monthlyCount}</div>
          </div>
          <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow text-center">
            <div className="text-sm text-gray-500 mb-2">طلبات السنة</div>
            <div className="text-3xl font-bold text-purple-700">{stats.yearlyCount}</div>
          </div>
          <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow text-center">
            <div className="text-sm text-gray-500 mb-2">إجمالي الطلبات</div>
            <div className="text-3xl font-bold text-purple-700">{stats.totalCount}</div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="mt-16 flex flex-col items-center justify-center text-gray-500 text-sm select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-purple-700">Elliaa</span>
          <span className="text-gray-400">|</span>
          {/* Animated SVG Heart - slower animation, red color */}
          <span className="inline-block">
            <svg
              className="w-5 h-5 animate-heartbeat drop-shadow-lg"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="#e53935"
                stroke="#e53935"
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
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px #e5393544); }
          10% { transform: scale(1.18); filter: drop-shadow(0 0 16px #e5393588); }
          20% { transform: scale(0.95); }
          30% { transform: scale(1.12); }
          50% { transform: scale(0.97); }
          70% { transform: scale(1.15); }
          80% { transform: scale(0.98); }
        }
        .animate-heartbeat {
          animation: heartbeat 2.2s infinite cubic-bezier(.4,0,.6,1);
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default DownloadPage;