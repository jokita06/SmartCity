
import React from 'react';
import './Modal.css';

export function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-conteudo">
        <button className="fechar-modal" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
