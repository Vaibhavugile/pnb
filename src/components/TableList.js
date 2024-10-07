import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import './TableList.css'; // Import your CSS file for styles

const TableList = () => {
  const [tables, setTables] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // For payment modal visibility
  const [selectedTable, setSelectedTable] = useState(null); // For storing the table being paid
  const [paymentMethod, setPaymentMethod] = useState(''); // Store selected payment method
  const [paymentStatus, setPaymentStatus] = useState(''); // Store payment status (Settled/Due)
  const [responsibleName, setResponsibleName] = useState(''); // Store name for due payment

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

  // Calculate the total price of the table's orders
  const calculateTotalPrice = (orders) => {
    return orders.reduce((total, order) => total + (order.price * order.quantity), 0);
  };

  // Handle opening the payment modal for a table
  const handleOpenPaymentModal = (table) => {
    setSelectedTable(table);
    setShowPaymentModal(true);
  };

  // Handle closing the payment modal
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedTable(null);
    setPaymentMethod('');
    setPaymentStatus('');
    setResponsibleName('');
  };

  // Handle saving payment details
  const handleSavePayment = async () => {
    if (selectedTable && paymentMethod && paymentStatus) {
      const tableRef = doc(db, 'tables', selectedTable.id);
      let updatedOrderStatus = '';
      let updatedOrders = selectedTable.orders; // Keep current orders
  
      // Check if there are current orders to add to the history
      let previousOrders = selectedTable.orderHistory || [];
  
      // Create a new history entry for the payment
      const newHistoryEntry = {
        orders: selectedTable.orders, // Orders related to this payment
        payment: {
          total: calculateTotalPrice(selectedTable.orders),
          status: paymentStatus,
          method: paymentMethod,
          responsible: paymentStatus === 'Due' ? responsibleName : null,
          timestamp: new Date().toISOString() // Store the time of payment
        }
      };
  
      // Determine order status based on paymentStatus
      if (paymentStatus === 'Settled') {
        updatedOrderStatus = 'Payment Successfully Settled';
  
        // Append the new history entry with payment details to the order history
        previousOrders = [...previousOrders, newHistoryEntry];
  
        // Clear current orders when payment is settled
        updatedOrders = [];
      } else if (paymentStatus === 'Due' && responsibleName.trim() !== '') {
        updatedOrderStatus = `Payment Due Successfully by ${responsibleName}`;
  
        // Append the new history entry with payment details to the order history
        previousOrders = [...previousOrders, newHistoryEntry];
  
        // Clear current orders when payment is due
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
          orders: updatedOrders, // Clear the orders array
          orderHistory: previousOrders, // Store the updated order history in Firestore
          orderStatus: updatedOrders.length === 0 ? 'New Order' : updatedOrderStatus // Reset order status if no orders remain
        });
        alert('Payment details saved successfully');
        handleClosePaymentModal(); // Close modal after saving
      } catch (error) {
        console.error("Error saving payment details: ", error);
      }
    } else {
      alert('Please select a payment method and status');
    }
  };
  
  return (
    <div>
      <h2>Tables</h2>
      <div className="table-list">
        {tables.map(table => {
          const totalPrice = calculateTotalPrice(table.orders);
          const cardClass = totalPrice > 0 ? 'table-card payment-due' : 'table-card'; // Conditional class

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
  );
};


export default TableList;
