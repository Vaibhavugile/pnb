import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import UserSidebar from './UserSidebar'; // Import the UserSidebar component
import UserHeader from './UserHeader';   // Import the UserHeader component
             // Assuming you have some custom CSS for the form

const ProductForm = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar toggle state

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen); // Toggle sidebar visibility
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), {
        name: productName,
        price: price,
      });
      setProductName('');
      setPrice('');
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  return (
    <div className={`product-form-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Include the sidebar and header */}
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
          <button type="submit">Add Product</button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
