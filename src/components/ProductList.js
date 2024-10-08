import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import UserSidebar from './UserSidebar';  // Import the UserSidebar component
import UserHeader from './UserHeader';    // Import the UserHeader component
           // Assuming you have some custom CSS for this page

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar toggle state

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen); // Toggle sidebar visibility
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const productSnapshot = await getDocs(collection(db, "products"));
      const productList = productSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    };
    fetchProducts();
  }, []);

  return (
    <div className={`product-list-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Include the sidebar and header */}
      <UserSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div className="product-list-content">
        <UserHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />

        <h2>Product List</h2>
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <p>Price: ${product.price}</p>
            </div>
          ))
        ) : (
          <p>No products available</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;
