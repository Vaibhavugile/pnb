import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './Report.css'; // Import your CSS file for report styles
import UserSidebar from './UserSidebar'; // Import the UserSidebar component
import UserHeader from './UserHeader'; // Import the UserHeader component

const OrdersReport = () => {
  const [tables, setTables] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar toggle state

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tables'));
        const tableData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTables(tableData);
      } catch (error) {
        console.error("Error fetching tables: ", error);
      }
    };

    fetchTables();
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen); // Toggle sidebar visibility
  };

  return (
    <div className={`report-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Include the sidebar and header */}
      <UserSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div className="report-content">
        <UserHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />
        
        <h2>Orders Report</h2>
        
        {tables.length > 0 ? (
          tables.map(table => (
            <div key={table.id} className="report-card">
              <h3>Table {table.tableNumber}</h3>

              {/* Current Orders */}
              {Array.isArray(table.orders) && table.orders.length > 0 && (
                <>
                  <h4>Current Orders</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Quantity</th>
                        <th>Item Name</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.orders.map((order, index) => {
                        const price = typeof order.price === 'number' ? order.price : parseFloat(order.price);
                        return (
                          <tr key={index}>
                            <td>{order.quantity}</td>
                            <td>{order.name}</td>
                            <td>${price.toFixed(2)}</td>
                            <td>${(price * order.quantity).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}

              {/* Order History */}
              {Array.isArray(table.orderHistory) && table.orderHistory.length > 0 && (
                <>
                  <h4>Order History</h4>
                  {table.orderHistory.map((historyEntry, index) => (
                    <div key={index}>
                      <p><strong>Order Timestamp:</strong> {historyEntry.payment?.timestamp || 'N/A'}</p>
                      <table>
                        <thead>
                          <tr>
                            <th>Quantity</th>
                            <th>Item Name</th>
                            <th>Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(historyEntry.orders) && historyEntry.orders.map((order, i) => {
                            const price = typeof order.price === 'number' ? order.price : parseFloat(order.price);
                            return (
                              <tr key={i}>
                                <td>{order.quantity}</td>
                                <td>{order.name}</td>
                                <td>${price.toFixed(2)}</td>
                                <td>${(price * order.quantity).toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </>
              )}

              {(!Array.isArray(table.orders) || table.orders.length === 0) &&
               (!Array.isArray(table.orderHistory) || table.orderHistory.length === 0) &&
               <p>No orders for this table yet.</p>}
            </div>
          ))
        ) : (
          <p>Loading tables...</p>
        )}
      </div>
    </div>
  );
};

export default OrdersReport;
