import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

const TableForm = () => {
  const [tableNumber, setTableNumber] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'tables'), {
        tableNumber,
        orders: []  // Initialize with an empty orders array
      });
      setTableNumber('');
      alert("Table added successfully");
    } catch (error) {
      console.error("Error adding table: ", error);
    }
  };

  return (
    <div>
      <h2>Add New Table</h2>
      <form onSubmit={handleSubmit}>
        <label>Table Number / Counter Number</label>
        <input
          type="text"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          required
        />
        <button type="submit">Add Table</button>
      </form>
    </div>
  );
};

export default TableForm;
