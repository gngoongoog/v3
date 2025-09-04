import axios from 'axios';

class GoogleSheetsService {
  constructor() {
    this.SHEET_ID = '1GaxEmX22jVOkplDN-QknKEgvPeSCUV2_nOkE1Oy3v5U';
    this.CSV_URL = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=0`;
    
    this.cache = {
      products: null,
      lastFetch: null,
      cacheTimeout: 5 * 60 * 1000 // 5 دقائق
    };
  }

  // --- تم تعديل هذه الدالة ---
  // تحويل CSV إلى JSON ليتوافق مع أعمدتك
  csvToJson(csv ) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = this.parseCSVLine(lines[i]);
      const obj = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        value = value.replace(/"/g, '').trim();
        
        // تحويل الأنواع بناءً على أسماء الأعمدة الجديدة
        if (header === 'id' || header === 'price' || header === 'stock' || header === 'popularity') {
          obj[header] = parseInt(value) || 0;
        } else if (header === 'isFeatured') { // تم التغيير من 'featured'
          // إعادة تسمية الحقل ليتوافق مع بقية الكود
          obj['featured'] = value.toLowerCase() === 'true'; 
        } else if (header === 'image') { // تم التغيير من 'image_url'
          // إعادة تسمية الحقل ليتوافق مع بقية الكود
          obj['image_url'] = value;
        } else {
          obj[header] = value;
        }
      });
      
      // التأكد من وجود البيانات الأساسية
      if (obj.id && obj.name) {
        result.push(obj);
      }
    }
    
    return result;
  }

  // تحليل سطر CSV (بدون تغيير)
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

  // جلب البيانات من Google Sheets (بدون تغيير)
  async fetchProducts() {
    try {
      if (this.cache.products && this.cache.lastFetch) {
        const timeDiff = Date.now() - this.cache.lastFetch;
        if (timeDiff < this.cache.cacheTimeout) {
          console.log('استخدام البيانات من الكاش');
          return this.cache.products;
        }
      }

      console.log('جلب البيانات من Google Sheets...');
      
      const response = await axios.get(this.CSV_URL, {
        timeout: 10000,
        headers: { 'Accept': 'text/csv' }
      });

      const products = this.csvToJson(response.data);
      
      this.cache.products = products;
      this.cache.lastFetch = Date.now();
      
      localStorage.setItem('products_cache', JSON.stringify({
        products,
        timestamp: Date.now()
      }));

      console.log(`تم جلب ${products.length} منتج بنجاح`);
      return products;
      
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      
      const cachedData = localStorage.getItem('products_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        console.log('استخدام البيانات المحفوظة محلياً');
        return parsed.products;
      }
      
      return []; // إرجاع مصفوفة فارغة بدلاً من البيانات التجريبية
    }
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
