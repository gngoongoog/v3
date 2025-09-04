import axios from 'axios';

class GoogleSheetsService {
  constructor() {
    this.SHEET_ID = '1GaxEmX22jVOkplDN-QknKEgvPeSCUV2_nOkE1Oy3v5U';
    
    // --- الجزء الرئيسي لحل مشكلة الاتصال ---
    // 1. الرابط الأصلي لملف CSV
    const originalCsvUrl = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=0`;
    
    // 2. استخدام خدمة بروكسي لتجاوز مشكلة CORS
    this.PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalCsvUrl )}`;

    this.cache = {
      products: null,
      lastFetch: null,
      cacheTimeout: 5 * 60 * 1000 // 5 دقائق
    };
  }

  // دالة تحويل CSV إلى JSON (متوافقة مع أعمدة ملفك)
  csvToJson(csv) {
    const lines = csv.split('\n');
    if (lines.length < 1) return [];
    
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = this.parseCSVLine(lines[i]);
      const obj = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        value = value.replace(/"/g, '').trim();
        
        if (header === 'id' || header === 'price' || header === 'stock' || header === 'popularity') {
          obj[header] = parseInt(value) || 0;
        } else if (header === 'isFeatured') {
          obj['featured'] = value.toLowerCase() === 'true'; 
        } else if (header === 'image') {
          obj['image_url'] = value;
        } else {
          obj[header] = value;
        }
      });
      
      if (obj.id && obj.name) {
        result.push(obj);
      }
    }
    return result;
  }

  // دالة تحليل سطر CSV (بدون تغيير)
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  // دالة جلب المنتجات (معدلة لاستخدام البروكسي)
  async fetchProducts() {
    try {
      if (this.cache.products && this.cache.lastFetch) {
        const timeDiff = Date.now() - this.cache.lastFetch;
        if (timeDiff < this.cache.cacheTimeout) {
          console.log('استخدام البيانات من الكاش');
          return this.cache.products;
        }
      }

      console.log('جلب البيانات من Google Sheets عبر البروكسي...');
      
      const response = await axios.get(this.PROXY_URL, { timeout: 15000 });

      const products = this.csvToJson(response.data);
      
      if (products.length === 0) {
          console.warn("تم جلب 0 منتج. الرجاء التحقق من هيكل ملف CSV أو أنه ليس فارغاً.");
      }

      this.cache.products = products;
      this.cache.lastFetch = Date.now();
      localStorage.setItem('products_cache', JSON.stringify({ products, timestamp: Date.now() }));
      console.log(`تم جلب ${products.length} منتج بنجاح`);
      return products;
      
    } catch (error) {
      console.error('خطأ في جلب البيانات عبر البروكسي:', error);
      
      const cachedData = localStorage.getItem('products_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        console.log('استخدام البيانات المحفوظة محلياً');
        return parsed.products;
      }
      
      console.log('فشل الاتصال، سيتم استخدام البيانات الوهمية.');
      return this.getFallbackData();
    }
  }

  // دالة البيانات الوهمية (تبقى كخطة بديلة)
  getFallbackData() {
    console.log("إنشاء بيانات وهمية...");
    const products = [];
    const categories = ['سماعات', 'شاحنات', 'كيبلات', 'لزقات حماية', 'اكسسوارات'];
    for (let i = 1; i <= 20; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      products.push({
        id: i, name: `منتج وهمي ${i}`, category: category, price: 10000,
        description: `وصف منتج وهمي`, image_url: `https://via.placeholder.com/300`,
        stock: 10, featured: i <= 5
      } );
    }
    return products;
  }

  // بقية الدوال (بدون تغيير)
  async getProductsByCategory(category) { const products = await this.fetchProducts(); return products.filter(p => p.category === category); }
  async getProductById(id) { const products = await this.fetchProducts(); return products.find(p => p.id === parseInt(id)); }
  async getFeaturedProducts() { const products = await this.fetchProducts(); return products.filter(p => p.featured); }
  async getCategories() { const products = await this.fetchProducts(); return [...new Set(products.map(p => p.category))]; }
  async searchProducts(query) { const products = await this.fetchProducts(); const q = query.toLowerCase(); return products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)); }
  clearCache() { this.cache.products = null; this.cache.lastFetch = null; localStorage.removeItem('products_cache'); }
}

const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
