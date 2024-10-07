import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import TableForm from './components/TableForm';
import TableList from './components/TableList';
import TableDetail from './components/TableDetail';
import OrdersReport from './components/OrdersReport';
import PaymentHistoryReport from './components/PaymentHistoryReport';
function App() {
  return (
    <Router>
      <div>
      <h1>Café Table Management</h1>
        <Routes>
          <Route path="/add-product" element={<ProductForm />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/" element={<TableList />} />
          <Route path="/add-table" element={<TableForm />} />
          <Route path="/table/:tableId" element={<TableDetail />} />
          <Route path="/report/order" element={<OrdersReport />} />
          <Route path="/report/payments" element={<PaymentHistoryReport />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
