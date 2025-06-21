import { useEffect, useState } from "react";
import "./style/index.css";
import { FaTrash } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { Modal } from "../../componentes/modal/Modal";
import { HistoricosForm } from "../../componentes/formulario/HistoricosForm";
import api from "../../api/Api";
import { useNavigate } from 'react-router-dom';

const fields = {
  historicos: {
    endpoint: 'historico/',
    fields: ['ambiente', 'sensor', 'valor', 'timestamp'],
    fieldNames: ['Ambiente', 'Sensor', 'Valor', 'Data/Hora']
  }
};

export function Historicos() {
  const navigate = useNavigate();
  const [historicos, setHistoricos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);
  const [totalItems, setTotalItems] = useState(0);
  
  // Estados para os modais
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [selectedHistorico, setSelectedHistorico] = useState(null);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    const fetchHistoricos = async () => {
      try {
        const response = await api.get(fields.historicos.endpoint);
        setHistoricos(response.data);
        setTotalItems(response.data.length);
      } catch (error) {
        console.error("Error fetching historico data:", error);
      }
    };

    fetchHistoricos();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historicos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const goToFirstPage = () => paginate(1);
  const goToLastPage = () => paginate(totalPages);
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      paginate(currentPage + 1);
    }
  };
  const goToPrevPage = () => {
    if (currentPage > 1) {
      paginate(currentPage - 1);
    }
  };

  const handleAddHistorico = () => {
    setActionType('create');
    setSelectedHistorico(null);
    setModalContent(
      <HistoricosForm 
        item={null} 
        action="create" 
        onClose={() => {
          setShowModal(false);
          refreshData();
        }} 
      />
    );
    setShowModal(true);
  };

  const handleEditHistorico = (historico) => {
    setActionType('edit');
    setSelectedHistorico(historico);
    setModalContent(
      <HistoricosForm 
        item={historico} 
        action="edit" 
        onClose={() => {
          setShowModal(false);
          refreshData();
        }} 
      />
    );
    setShowModal(true);
  };

  const handleDeleteHistorico = (historico) => {
    setActionType('delete');
    setSelectedHistorico(historico);
    setModalContent(
      <div className="delete-confirmacao">
        <h3>Confirmar exclusão</h3>
        <p>Tem certeza que deseja excluir o histórico de {historico.sensor} em {historico.ambiente}?</p>
        <div className="botoes-modal">
          <button 
            className="btn-cancelar" 
            onClick={() => setShowModal(false)}
          >
            Cancelar
          </button>
          <button 
            className="btn-confirmar" 
            onClick={async () => {
              try {
                await api.delete(`historicos/${historico.id}/`);
                setShowModal(false);
                refreshData();
              } catch (error) {
                console.error("Erro ao deletar:", error);
              }
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    );
    setShowModal(true);
  };

  const refreshData = async () => {
    try {
      const response = await api.get(fields.historicos.endpoint);
      setHistoricos(response.data);
      setTotalItems(response.data.length);
    } catch (error) {
      console.error("Error refreshing historico data:", error);
    }
  };

  return (
    <main className="sensores-container">
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {modalContent}
        </Modal>
      )}

      <header className="sensores-header">
        <h1>Dados Históricos</h1>
        <button className="add-btn" onClick={handleAddHistorico}>+ Add registro</button>
      </header>

      <div className="sensores-filtro">
        <button onClick={() => navigate('/sensores')}>Visualizar sensores</button>
        <button onClick={() => navigate('/ambientes')}>Visualizar ambientes</button>
      </div>

      <section aria-label="Tabela de históricos">
        <table className="sensores-tabela">
          <thead>
            <tr>
              {fields.historicos.fieldNames.map(name => (
                <th key={name} scope="col">{name}</th>
              ))}
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(item => (
              <tr key={item.id}>
                {fields.historicos.fields.map(field => (
                  <td key={`${item.id}-${field}`}>
                    {field === 'timestamp' ? 
                      new Date(item[field]).toLocaleString() : 
                      item[field]}
                  </td>
                ))}
                <td>
                  <button 
                    className="acoes-btn" 
                    aria-label="Editar" 
                    title="Editar"
                    onClick={() => handleEditHistorico(item)}
                  >
                    <MdModeEdit />
                  </button>
                  <button 
                    className="acoes-btn" 
                    aria-label="Excluir" 
                    title="Excluir"
                    onClick={() => handleDeleteHistorico(item)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <nav className="controle-paginacao" aria-label="Paginação">
        <button
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          className="paginacao-btn"
          aria-label="Primeira página"
        >
          <FaAngleDoubleLeft />
        </button>
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="paginacao-btn"
          aria-label="Página anterior"
        >
          <FaAngleLeft />
        </button>

        <span className="paginacao-info">
          Página {currentPage} de {totalPages} | Total: {totalItems} itens
        </span>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="paginacao-btn"
          aria-label="Próxima página"
        >
          <FaAngleRight />
        </button>
        <button
          onClick={goToLastPage}
          disabled={currentPage === totalPages}
          className="paginacao-btn"
          aria-label="Última página"
        >
          <FaAngleDoubleRight />
        </button>
      </nav>
    </main>
  );
}