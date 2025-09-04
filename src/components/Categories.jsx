import React from 'react';
import { Link } from 'react-router-dom';

// المكون يستقبل الأقسام كـ "prop" من ملف App.jsx
function Categories({ categories }) {
  // أيقونات افتراضية كمثال
  const categoryIcons = {
    'سماعات': '🎧',
    'شاحنات': '🔌',
    'كيبلات': '〰️',
    'لزقات حماية': '📱',
    'اكسسوارات': '🎒',
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-center">الأقسام</h2>
      {/* التحقق من وجود أقسام قبل محاولة عرضها */}
      {categories && categories.length > 0 ? (
        <div className="flex justify-center flex-wrap gap-4">
          {categories.map(category => (
            <Link 
              key={category} 
              to={`/products?category=${category}`} 
              className="flex flex-col items-center p-4 bg-gray-100 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-4xl mb-2">{categoryIcons[category] || '📦'}</span>
              <span className="font-semibold">{category}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">لا توجد أقسام لعرضها.</p>
      )}
    </div>
  );
}

export default Categories;
