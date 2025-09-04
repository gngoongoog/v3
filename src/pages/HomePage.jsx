import React from 'react';
import googleSheetsService from '../services/GoogleSheetsService';

function Home() {
  const products = googleSheetsService.fetchProducts();
  return (
    <div>
      <h1>Home Page</h1>
      {/* Logic to display products will be added here later */}
    </div>
  );
}

export default Home;
