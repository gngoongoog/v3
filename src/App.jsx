import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Categories from './components/Categories';
import googleSheetsService from './services/GoogleSheetsService';

function App() {
  // State لتخزين جميع البيانات في مكان واحد
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // State لتتبع حالة التحميل

  // useEffect لجلب البيانات مرة واحدة عند تحميل التطبيق
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await googleSheetsService.fetchProducts();
        const fetchedCategories = await googleSheetsService.getCategories();
        
        // التأكد من أن البيانات ليست فارغة قبل تحديث الـ state
        if (fetchedProducts && fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        }
        if (fetchedCategories && fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error("Failed to load data in App.jsx:", error);
      } finally {
        setLoading(false); // إيقاف التحميل بعد انتهاء العملية
      }
    };

    loadData();
  }, []); // المصفوفة الفارغة تضمن تشغيل هذا مرة واحدة فقط

  // عرض رسالة "جاري التحميل" أثناء جلب البيانات
  if (loading) {
    return <div className="flex justify-center items-center h-screen">جاري تحميل المنتجات...</div>;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {/* تمرير الأقسام إلى المكون الخاص بها */}
          <Categories categories={categories} />
          <Routes>
            {/* تمرير المنتجات المميزة إلى الصفحة الرئيسية */}
            <Route path="/" element={<Home products={products.filter(p => p.featured)} />} />
            {/* تمرير جميع المنتجات إلى صفحة المنتجات */}
            <Route path="/products" element={<Products products={products} />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
