import React, { useState, useEffect } from 'react'; // 1. استيراد الخطافات
import googleSheetsService from '../services/GoogleSheetsService';
import ProductCard from '../components/ProductCard'; // 2. استيراد بطاقة المنتج

function Home() {
  // 3. إنشاء "حالة" لتخزين المنتجات
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // حالة لتتبع التحميل

  // 4. استخدام useEffect لجلب البيانات عند تحميل المكون
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await googleSheetsService.fetchProducts();
        setProducts(data); // 5. تحديث الحالة بالبيانات التي تم جلبها
      } catch (error) {
        console.error("Failed to load products in Home.jsx:", error);
      } finally {
        setLoading(false); // إيقاف التحميل في كل الحالات
      }
    };

    loadProducts();
  }, []); // المصفوفة الفارغة تضمن تشغيل هذا مرة واحدة فقط

  // 6. عرض رسالة تحميل أثناء جلب البيانات
  if (loading) {
    return <div className="text-center p-10">جاري تحميل المنتجات...</div>;
  }

  // 7. عرض المنتجات بعد تحميلها
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">المنتجات</h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">لا توجد منتجات لعرضها حالياً.</p>
      )}
    </div>
  );
}

export default Home;
