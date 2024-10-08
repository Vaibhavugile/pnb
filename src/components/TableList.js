import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import UserSidebar from './UserSidebar';  // Import the UserSidebar component
import UserHeader from './UserHeader';    // Import the UserHeader component
import './TableList.css'; // Import your CSS file for styles

const TableList = () => {
  const [tables, setTables] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar toggle state

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen); // Toggle sidebar visibility
  };

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tables'));
        const tableData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          orderStatus: 'Running Order' // Set initial order status to "Running Order"
        }));
        setTables(tableData);
      } catch (error) {
        console.error("Error fetching tables: ", error);
      }
    };

    fetchTables();
  }, []);

  const calculateTotalPrice = (orders) => {
    return orders.reduce((total, order) => total + (order.price * order.quantity), 0);
  };

  const handleOpenPaymentModal = (table) => {
    setSelectedTable(table);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedTable(null);
    setPaymentMethod('');
    setPaymentStatus('');
    setResponsibleName('');
  };

  const handleSavePayment = async () => {
    if (selectedTable && paymentMethod && paymentStatus) {
      const tableRef = doc(db, 'tables', selectedTable.id);
      let updatedOrderStatus = '';
      let updatedOrders = selectedTable.orders;
      let previousOrders = selectedTable.orderHistory || [];

      const newHistoryEntry = {
        orders: selectedTable.orders,
        payment: {
          total: calculateTotalPrice(selectedTable.orders),
          status: paymentStatus,
          method: paymentMethod,
          responsible: paymentStatus === 'Due' ? responsibleName : null,
          timestamp: new Date().toISOString()
        }
      };

      if (paymentStatus === 'Settled') {
        updatedOrderStatus = 'Payment Successfully Settled';
        previousOrders = [...previousOrders, newHistoryEntry];
        updatedOrders = [];
      } else if (paymentStatus === 'Due' && responsibleName.trim() !== '') {
        updatedOrderStatus = `Payment Due Successfully by ${responsibleName}`;
        previousOrders = [...previousOrders, newHistoryEntry];
        updatedOrders = [];
      } else {
        alert('Please enter the responsible person\'s name for due payments.');
        return;
      }

      try {
        await updateDoc(tableRef, {
          payment: {
            total: calculateTotalPrice(selectedTable.orders),
            status: paymentStatus,
            method: paymentMethod,
            responsible: paymentStatus === 'Due' ? responsibleName : null
          },
          orders: updatedOrders,
          orderHistory: previousOrders,
          orderStatus: updatedOrders.length === 0 ? 'New Order' : updatedOrderStatus
        });
        alert('Payment details saved successfully');
        handleClosePaymentModal();
      } catch (error) {
        console.error("Error saving payment details: ", error);
      }
    } else {
      alert('Please select a payment method and status');
    }
  };

  return (
    <div className={`table-list-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <UserSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div className="table-list-content">
        <UserHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />

        <h2>Tables</h2>
        <div className="table-list">
          {tables.map(table => {
            const totalPrice = calculateTotalPrice(table.orders);
            const cardClass = totalPrice > 0 ? 'table-card payment-due' : 'table-card';

            return (
              <div key={table.id} className={cardClass}>
                <Link to={`/table/${table.id}`}>
                  <button className="table-button">{table.tableNumber}</button>
                </Link>
                <button className="payment-button" onClick={() => handleOpenPaymentModal(table)}>
                  Pay ${totalPrice.toFixed(2)}
                </button>
              </div>
            );
          })}
        </div>

        {showPaymentModal && selectedTable && (
          <div className="modal">
            <div className="modal-content">
              <h3>Payment for Table {selectedTable.tableNumber}</h3>

              {selectedTable.orders.length > 0 ? (
                <>
                  <p>Total Price: ${calculateTotalPrice(selectedTable.orders)}</p>

                  <h4>Order Summary:</h4>
                  <ul>
                    {selectedTable.orders.map((order, index) => (
                      <li key={index}>
                        {order.quantity} x {order.name} - ${order.price * order.quantity}
                      </li>
                    ))}
                  </ul>

                  <label>
                    Payment Status:
                    <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                      <option value="">Select Status</option>
                      <option value="Settled">Settled</option>
                      <option value="Due">Due</option>
                    </select>
                  </label>

                  {paymentStatus === 'Due' && (
                    <label>
                      Name of responsible person for payment:
                      <input
                        type="text"
                        value={responsibleName}
                        onChange={(e) => setResponsibleName(e.target.value)}
                        placeholder="Enter name"
                      />
                    </label>
                  )}

                  <label>
                    Payment Method:
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="">Select Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </label>
                </>
              ) : (
                <p>No current orders. This is a new order.</p>
              )}

              <button className="save-payment-button" onClick={handleSavePayment}>Save Payment</button>
              <button className="close-modal-button" onClick={handleClosePaymentModal}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableList;
