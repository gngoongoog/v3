import React, { useState, useEffect } from 'react';
import googleSheetsService from '../services/GoogleSheetsService';
import ProductCard from '../components/ProductCard';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const fetchedProducts = await googleSheetsService.fetchProducts();
      setProducts(fetchedProducts);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="text-center py-10">جاري تحميل المنتجات...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">المنتجات</h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">فشل تحميل المنتجات أو لا توجد منتجات لعرضها.</p>
      )}
    </div>
  );
}

export default Home;
