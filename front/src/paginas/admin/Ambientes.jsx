import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { FaTrash } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { CiExport } from "react-icons/ci";

import { Modal } from "../../componentes/modal/Modal";
import { AmbientesForm } from "../../componentes/formulario/AmbientesForm";
import api from "../../api/Api";
import "./style/index.css"; 

// Configurações dos campos da tabela ambientes
const fields = {
  ambientes: {
    endpoint: 'ambientes/',
    fields: ['sig', 'descricao', 'ni', 'responsavel'],
    fieldNames: ['SIG', 'Descrição', 'NI', 'Responsável']
  }
};

export function Ambientes() {
  const navigate = useNavigate();

  // Lista de ambientes
  const [ambientes, setAmbientes] = useState([]);
  // Controle da página atual da tabela
  const [currentPage, setCurrentPage] = useState(1);
  // Itens por página fixo
  const [itemsPerPage] = useState(30);
  // Total de itens (ambientes)
  const [totalItems, setTotalItems] = useState(0);
  
  // Controle para abrir/fechar modal e conteúdo dentro dele
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  // Ambiente selecionado para editar ou excluir
  const [selectedAmbiente, setSelectedAmbiente] = useState(null);
  // Tipo de ação no modal: create, edit ou delete
  const [actionType, setActionType] = useState('');
  
  // Busca dados dos ambientes quando o componente carrega
  useEffect(() => {
    const fetchAmbientes = async () => {
      try {
        const response = await api.get(fields.ambientes.endpoint);
        setAmbientes(response.data);
        setTotalItems(response.data.length);
      } catch (error) {
        console.error("Error fetching ambiente data:", error);
      }
    };

    fetchAmbientes();
  }, []);

  // Calcula os índices para a paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Itens que vão aparecer na página atual
  const currentItems = ambientes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Funções para controlar paginação
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

  // Abre modal para criar novo ambiente
  const handleAddAmbiente = () => {
    setActionType('create');
    setSelectedAmbiente(null);
    setModalContent(
      <AmbientesForm 
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

  // Abre modal para editar ambiente existente
  const handleEditAmbiente = (ambiente) => {
    setActionType('edit');
    setSelectedAmbiente(ambiente);
    setModalContent(
      <AmbientesForm 
        item={ambiente} 
        action="edit" 
        onClose={() => {
          setShowModal(false);
          refreshData();
        }} 
      />
    );
    setShowModal(true);
  };

  // Abre modal para confirmar exclusão do ambiente
  const handleDeleteAmbiente = (ambiente) => {
    setActionType('delete');
    setSelectedAmbiente(ambiente);
    setModalContent(
      <div className="delete-confirmacao">
        <h3>Confirmar exclusão</h3>
        <p>Tem certeza que deseja excluir o ambiente {ambiente.sig} ({ambiente.descricao})?</p>
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
                await api.delete(`ambientes/${ambiente.id}/`);
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

  // Atualiza dados da tabela (recarrega ambientes)
  const refreshData = async () => {
    try {
      const response = await api.get(fields.ambientes.endpoint);
      setAmbientes(response.data);
      setTotalItems(response.data.length);
    } catch (error) {
      console.error("Error refreshing ambiente data:", error);
    }
  };

  // Exporta dados para arquivo Excel
  const handleExport = async () => {
    try {
      const response = await api.get('/exportar/sensores/', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ambientes_exportados.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar ambientes:', error);
    }
  };

  return (
    <main className="sensores-container"> 
      {/* Modal para criar, editar ou excluir */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {modalContent}
        </Modal>
      )}

      {/* Cabeçalho da página */}
      <header className="sensores-header"> 
        <h1>Dados dos Ambientes</h1>
        <button className="add-btn" onClick={handleAddAmbiente}>+ Add registro</button>
      </header>

      {/* Botões de navegação e exportação */}
      <div className="sensores-filtro"> 
        <button onClick={() => navigate('/sensores')}>Visualizar sensores</button>
        <button onClick={() => navigate('/historicos')}>Visualizar histórico</button>
        <button
          onClick={handleExport}
          className="exportar-btn"
          title="Exportar Ambientes"
          aria-label="Exportar Ambientes"
        >
          <CiExport className="exportar-icon" />
          <span>Exportar Ambientes</span>
        </button>
      </div>

      {/* Tabela com os dados dos ambientes */}
      <section aria-label="Tabela de ambientes">
        <table className="sensores-tabela">
          <thead>
            <tr>
              {fields.ambientes.fieldNames.map(name => (
                <th key={name} scope="col">{name}</th>
              ))}
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(item => (
              <tr key={item.id}>
                {fields.ambientes.fields.map(field => (
                  <td key={`${item.id}-${field}`}>
                    {item[field]}
                  </td>
                ))}
                <td>
                  {/* Botões editar e excluir */}
                  <button 
                    className="acoes-btn" 
                    aria-label="Editar" 
                    title="Editar"
                    onClick={() => handleEditAmbiente(item)}
                  >
                    <MdModeEdit />
                  </button>
                  <button 
                    className="acoes-btn" 
                    aria-label="Excluir" 
                    title="Excluir"
                    onClick={() => handleDeleteAmbiente(item)}
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