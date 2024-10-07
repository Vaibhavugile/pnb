import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './payreport.css'; // Import your CSS file for styles

const PaymentHistoryReport = () => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState(null); // For storing selected orders

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tables'));
        const historyData = [];

        querySnapshot.forEach(doc => {
          const table = doc.data();
          if (table.orderHistory) {
            table.orderHistory.forEach(order => {
              historyData.push({
                tableNumber: table.tableNumber,
                ...order.payment, // Extract payment details
                orders: order.orders // Keep order details if needed
              });
            });
          }
        });

        setPaymentHistory(historyData);
      } catch (error) {
        console.error("Error fetching payment history: ", error);
      }
    };

    fetchPaymentHistory();
  }, []);

  // Handle clicking on the total amount
  const handleTotalClick = (orders) => {
    setSelectedOrders(orders);
  };

  return (
    <div className="report-container">
      <h2>Payment History Report</h2>
      {paymentHistory.length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Table Number</th>
                <th>Total Amount</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Responsible</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.tableNumber}</td>
                  <td
                    className="clickable-amount"
                    onClick={() => handleTotalClick(entry.orders)} // Handle click event
                  >
                    ${typeof entry.total === 'number' ? entry.total.toFixed(2) : parseFloat(entry.total).toFixed(2)}
                  </td>
                  <td>{entry.method || 'N/A'}</td>
                  <td>{entry.status || 'N/A'}</td>
                  <td>{entry.responsible || 'N/A'}</td>
                  <td>{new Date(entry.timestamp).toLocaleString() || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Display selected orders if available */}
          {selectedOrders && (
            <div className="orders-summary">
              <h3>Associated Orders:</h3>
              <ul>
                {selectedOrders.map((order, index) => (
                  <li key={index}>
                    {order.quantity} x {order.name} - ${order.price * order.quantity}
                  </li>
                ))}
              </ul>
              <button onClick={() => setSelectedOrders(null)}>Close</button>
            </div>
          )}
        </>
      ) : (
        <p>No payment history available.</p>
      )}
    </div>
  );
};

export default PaymentHistoryReport;
