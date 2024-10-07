import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './TableDetail.css';

const TableDetail = () => {
  const { tableId } = useParams();
  const [table, setTable] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [editMode, setEditMode] = useState(false); // To toggle edit mode
  const [orderChanges, setOrderChanges] = useState([]); // To track changes to the order list

  // Fetch table details
  useEffect(() => {
    const fetchTable = async () => {
      const tableRef = doc(db, 'tables', tableId);
      const tableDoc = await getDoc(tableRef);
      if (tableDoc.exists()) {
        setTable({ id: tableDoc.id, ...tableDoc.data() });
        setOrderChanges(tableDoc.data().orders || []); // Initialize order changes with existing orders
      }
    };
    fetchTable();
  }, [tableId]);

  // Fetch available products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      const productList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productList);

      const initialQuantities = productList.reduce((acc, product) => {
        acc[product.id] = 0;
        return acc;
      }, {});
      setProductQuantities(initialQuantities);
    };
    fetchProducts();
  }, []);

  // Handle quantity adjustment for each product
  const handleQuantityChange = (productId, quantityChange) => {
    setProductQuantities(prevQuantities => ({
      ...prevQuantities,
      [productId]: Math.max(1, prevQuantities[productId] + quantityChange)
    }));
  };

  // Handle adding all selected products to the table's order
  const handleAddAllProducts = async () => {
    const selectedProducts = products.filter(product => productQuantities[product.id] > 0);
    
    if (selectedProducts.length === 0) {
      alert('No products selected.');
      return;
    }
  
    // Create a copy of the current orders
    const updatedOrders = [...orderChanges];
  
    selectedProducts.forEach(product => {
      const existingOrderIndex = updatedOrders.findIndex(order => order.name === product.name);
      
      if (existingOrderIndex !== -1) {
        // If the product already exists in the orders, update the quantity
        updatedOrders[existingOrderIndex].quantity += productQuantities[product.id];
      } else {
        // If the product doesn't exist in the orders, add a new order
        updatedOrders.push({
          name: product.name,
          price: product.price,
          quantity: productQuantities[product.id]
        });
      }
    });
  
    const tableRef = doc(db, 'tables', tableId);
    try {
      await updateDoc(tableRef, {
        orders: updatedOrders
      });
      alert('Products added/updated successfully.');
      const tableDoc = await getDoc(tableRef);
      if (tableDoc.exists()) {
        setTable({ id: tableDoc.id, ...tableDoc.data() });
        setOrderChanges(updatedOrders); // Update the local state with the updated orders
      }
    } catch (error) {
      console.error('Error adding products: ', error);
    }
  };
  

  // Toggle edit mode to modify the order
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Handle changes to the order during editing
  const handleOrderChange = (index, quantityChange) => {
    const updatedOrders = [...orderChanges];
    updatedOrders[index].quantity = Math.max(1, updatedOrders[index].quantity + quantityChange);
    setOrderChanges(updatedOrders);
  };

  // Save the updated order list
  const handleSaveChanges = async () => {
    const tableRef = doc(db, 'tables', tableId);
    try {
      await updateDoc(tableRef, {
        orders: orderChanges
      });
      alert('Orders updated successfully.');
      setEditMode(false); // Exit edit mode after saving
      const tableDoc = await getDoc(tableRef);
      if (tableDoc.exists()) {
        setTable({ id: tableDoc.id, ...tableDoc.data() });
      }
    } catch (error) {
      console.error('Error updating orders: ', error);
    }
  };

  return (
    <div>
      {table ? (
        <div>
          <h2>Table: {table.tableNumber}</h2>
          <h3>Orders</h3>
          <ul>
            {orderChanges.map((order, index) => (
              <li key={index}>
                {order.quantity} x {order.name} - ${order.price * order.quantity}
                {editMode && (
                  <div className="edit-controls">
                    <button onClick={() => handleOrderChange(index, -1)}>-</button>
                    <button onClick={() => handleOrderChange(index, +1)}>+</button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Button to toggle Edit Mode */}
          <button onClick={toggleEditMode}>
            {editMode ? 'Cancel Edit' : 'Edit Orders'}
          </button>

          {/* If in edit mode, show save button */}
          {editMode && <button onClick={handleSaveChanges}>Save Changes</button>}

          <h3>Add Products to Table</h3>
          <button onClick={() => setShowMenu(!showMenu)}>
            {showMenu ? 'Hide Menu' : '+ Show Menu'}
          </button>

          {showMenu && (
            <div className="product-menu">
              {products.map((product) => (
                <div key={product.id} className="product-item">
                  <span>
                    {product.name} - ${product.price}
                  </span>
                  <div className="quantity-controls">
                    <button onClick={() => handleQuantityChange(product.id, -1)}>-</button>
                    <span>{productQuantities[product.id]}</span>
                    <button onClick={() => handleQuantityChange(product.id, +1)}>+</button>
                  </div>
                </div>
              ))}
              <button className="add-all-btn" onClick={handleAddAllProducts}>
                Add to Table
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading table...</p>
      )}
    </div>
  );
};

export default TableDetail;
