import React from 'react';
import './Modal.css';

// Componente de modal genérico
export function Modal({ children, onClose }) {
  return (
    // Sobreposição do fundo do modal
    <div className="modal-overlay">
      {/* Conteúdo principal do modal */}
      <div className="modal-conteudo">
        {/* Botão para fechar o modal */}
        <button className="fechar-modal" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}