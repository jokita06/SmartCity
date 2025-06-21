
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { FaTrash } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { CiExport } from "react-icons/ci";

import { Modal } from "../../componentes/modal/Modal";
import { HistoricosForm } from "../../componentes/formulario/HistoricosForm";
import api from "../../api/Api";
import "./style/index.css";

// Configuração dos campos e nomes para a tabela
const fields = {
  historicos: {
    endpoint: 'historico/',
    fields: ['ambiente', 'sensor', 'valor', 'timestamp'],
    fieldNames: ['Ambiente', 'Sensor', 'Valor', 'Data/Hora']
  }
};

export function Historicos() {
  const navigate = useNavigate();

  // Lista de históricos
  const [historicos, setHistoricos] = useState([]);
  // Página atual da tabela
  const [currentPage, setCurrentPage] = useState(1);
  // Itens que mostramos por página (fixo 30)
  const [itemsPerPage] = useState(30);
  // Total de itens na lista
  const [totalItems, setTotalItems] = useState(0);
  
  // Controle para abrir/fechar modal e o conteúdo dentro dele
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  // Histórico selecionado para editar ou excluir
  const [selectedHistorico, setSelectedHistorico] = useState(null);
  // Tipo de ação no modal (create, edit, delete)
  const [actionType, setActionType] = useState('');

  // Busca os dados quando o componente carrega
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

  // Cálculo da paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Itens que vão aparecer na página atual
  const currentItems = historicos.slice(indexOfFirstItem, indexOfLastItem);
  // Quantas páginas a gente vai ter
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Funções para mudar página
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

  // Abre modal para criar novo histórico
  const handleAddHistorico = () => {
    setActionType('create');
    setSelectedHistorico(null);
    setModalContent(
      <HistoricosForm 
        item={null} 
        action="create" 
        onClose={() => {
          setShowModal(false);
          refreshData(); // Atualiza tabela depois de fechar modal
        }} 
      />
    );
    setShowModal(true);
  };

  // Abre modal para editar histórico existente
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

  // Abre modal para confirmar exclusão do histórico
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

  // Atualiza os dados da tabela
  const refreshData = async () => {
    try {
      const response = await api.get(fields.historicos.endpoint);
      setHistoricos(response.data);
      setTotalItems(response.data.length);
    } catch (error) {
      console.error("Error refreshing historico data:", error);
    }
  };

  // Exporta dados para Excel
  const handleExport = async () => {
    try {
      const response = await api.get('/exportar/historicos/', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'historicos_exportados.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar histórico:', error);
    }
  };

  return (
    <main className="sensores-container">
      {/* Modal para criar, editar ou excluir histórico */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {modalContent}
        </Modal>
      )}

      {/* Cabeçalho da página */}
      <header className="sensores-header">
        <h1>Dados Históricos</h1>
        <button className="add-btn" onClick={handleAddHistorico}>+ Add registro</button>
      </header>

      {/* Botões para navegar entre telas e exportar */}
      <div className="sensores-filtro">
        <button onClick={() => navigate('/sensores')}>Visualizar sensores</button>
        <button onClick={() => navigate('/ambientes')}>Visualizar ambientes</button>
        <button
          onClick={handleExport}
          className="exportar-btn"
          title="Exportar histórico"
          aria-label="Exportar histórico"
        >
          <CiExport className="exportar-icon" />
          <span>Exportar histórico</span>
        </button>
      </div>

      {/* Tabela dos históricos */}
      <section aria-label="Tabela de históricos">
        <table className="sensores-tabela">
          <thead>
            <tr>
              {/* Cabeçalho dinâmico com nomes dos campos */}
              {fields.historicos.fieldNames.map(name => (
                <th key={name} scope="col">{name}</th>
              ))}
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* Linhas da tabela, só os itens da página atual */}
            {currentItems.map(item => (
              <tr key={item.id}>
                {fields.historicos.fields.map(field => (
                  <td key={`${item.id}-${field}`}>
                    {/* Formata data para mostrar legível */}
                    {field === 'timestamp' ? 
                      new Date(item[field]).toLocaleString() : 
                      item[field]}
                  </td>
                ))}
                <td>
                  {/* Botões editar e excluir */}
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

      {/* Controle da paginação */}
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