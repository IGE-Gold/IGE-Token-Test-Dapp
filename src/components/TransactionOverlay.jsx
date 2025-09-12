import React from 'react';
import './TransactionOverlay.css';

const TransactionOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="transaction-overlay">
      <div className="transaction-overlay-content">
        <div className="transaction-spinner">
          <div className="spinner"></div>
        </div>
        <h3>Transazione in corso</h3>
        <p>Attendere la conferma della transazione...</p>
        <div className="transaction-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionOverlay;
