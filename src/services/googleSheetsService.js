import axios from 'axios';

class GoogleSheetsService {
  constructor() {
    // 1. تم وضع المعرّف الصحيح لملف Google Sheet الخاص بك
    this.SHEET_ID = '1GaxEmX22jVOkplDN-QknKEgvPeSCUV2_nOkE1Oy3v5U';
    
    const originalCsvUrl = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=0`;
    
    // 2. استخدام بروكسي لتجاوز أي مشاكل اتصال (CORS) محتملة
    this.PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalCsvUrl)}`;

    this.cache = {
      products: null,
      lastFetch: null,
      cacheTimeout: 5 * 60 * 1000 // 5 دقائق
    };
  }

  // 3. تعديل الدالة لتتوافق مع أسماء أعمدتك (image, isFeatured)
  csvToJson(csv) {
    const lines = csv.split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      const values = this.parseCSVLine(lines[i]);
      const obj = {};
      headers.forEach((header, index) => {
        let value = (values[index] || '').replace(/"/g, '').trim();
        if (['id', 'price', 'stock', 'popularity'].includes(header)) {
          obj[header] = parseInt(value) || 0;
        } else if (header === 'isFeatured') {
          obj['featured'] = value.toLowerCase() === 'true';
        } else if (header === 'image') {
          obj['image_url'] = value;
        } else {
          obj[header] = value;
        }
      });
      if (obj.id && obj.name) result.push(obj);
    }
    return result;
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else current += char;
    }
    result.push(current);
    return result;
  }

  async fetchProducts() {
    try {
      if (this.cache.products && Date.now() - this.cache.lastFetch < this.cache.cacheTimeout) {
        console.log('Using cached data');
        return this.cache.products;
      }
      console.log('Fetching data from Google Sheets via proxy...');
      const response = await axios.get(this.PROXY_URL, { timeout: 15000 });
      const products = this.csvToJson(response.data);
      if (products.length > 0) {
        this.cache.products = products;
        this.cache.lastFetch = Date.now();
        console.log(`Fetched and cached ${products.length} products.`);
      }
      return products;
    } catch (error) {
      console.error('Error fetching data:', error);
      // لا نرجع بيانات وهمية، بل مصفوفة فارغة حتى لا يختلط الأمر
      return []; 
    }
  }

  // بقية الدوال المساعدة التي قد يحتاجها تطبيقك
  async getCategories() {
    const products = await this.fetchProducts();
    if (!products || products.length === 0) return [];
    return [...new Set(products.map(p => p.category).filter(Boolean))];
  }

  async getProductById(id) {
    const products = await this.fetchProducts();
    return products.find(p => p.id === parseInt(id));
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
