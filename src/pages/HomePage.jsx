import React from 'react';
import ProductCard from '../components/ProductCard';

// المكون يستقبل المنتجات المميزة كـ "prop"
function Home({ products }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">المنتجات المميزة</h1>
      {/* التحقق من وجود منتجات قبل محاولة عرضها */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">لا توجد منتجات مميزة حالياً.</p>
      )}
    </div>
  );
}

export default Home;
