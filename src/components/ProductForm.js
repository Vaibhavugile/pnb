import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import UserSidebar from './UserSidebar'; // Import the UserSidebar component
import UserHeader from './UserHeader';   // Import the UserHeader component

const ProductForm = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [subcategory, setSubcategory] = useState('');  // New state for subcategory
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), {
        name: productName,
        price: price,
        subcategory: subcategory  // Save the subcategory field
      });
      setProductName('');
      setPrice('');
      setSubcategory('');
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  return (
    <div className={`product-form-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <UserSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div className="product-form-content">
        <UserHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />

        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Product Name"
            required
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            required
          />
          <input
            type="text"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            placeholder="Subcategory"
            required
          />
          <button type="submit">Add Product</button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
