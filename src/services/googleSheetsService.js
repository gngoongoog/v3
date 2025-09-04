import axios from 'axios';

class GoogleSheetsService {
  constructor() {
    this.SHEET_ID = '1GaxEmX22jVOkplDN-QknKEgvPeSCUV2_nOkE1Oy3v5U';
    const originalCsvUrl = `https://docs.google.com/spreadsheets/d/${this.SHEET_ID}/export?format=csv&gid=0`;
    this.PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalCsvUrl )}`;
    this.cache = { products: null, lastFetch: null, cacheTimeout: 300000 };
  }

  csvToJson(csv) {
    const lines = csv.split('\n');
    if (lines.length < 1) return [];
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
        return this.cache.products;
      }
      const response = await axios.get(this.PROXY_URL, { timeout: 15000 });
      const products = this.csvToJson(response.data);
      if (products.length > 0) {
        this.cache.products = products;
        this.cache.lastFetch = Date.now();
      }
      console.log(`Fetched ${products.length} products successfully.`);
      return products;
    } catch (error) {
      console.error('Error fetching data:', error);
      return []; // Return empty array on error
    }
  }
}

const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
